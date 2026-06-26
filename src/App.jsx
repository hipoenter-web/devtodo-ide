import { useMemo, useState } from 'react'
import CodeEditor from './components/CodeEditor'
import ConsolePanel from './components/ConsolePanel'
import Header from './components/Header'
import PreviewPanel from './components/PreviewPanel'
import Sidebar from './components/Sidebar'
import { saveProjectFiles } from './utils/storage'
import {
  countLoadedFiles,
  createWorkspaceFromDirectoryHandle,
  createWorkspaceFromDrop,
  createWorkspaceFromFileList,
  loadFolderChildren,
  readWorkspaceFile,
  updateTreeNode,
  writeWorkspaceFile,
} from './utils/workspace'

function createLog(message, type = 'info') {
  return {
    id: `${Date.now()}-${Math.random()}`,
    message,
    type,
    time: new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date()),
  }
}

function App() {
  const [workspaceTree, setWorkspaceTree] = useState([])
  const [fileContents, setFileContents] = useState({})
  const [editableFiles, setEditableFiles] = useState({})
  const [writableFiles, setWritableFiles] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [currentCode, setCurrentCode] = useState(
    '// 왼쪽 WORKSPACE에 Finder 폴더를 올려주세요.',
  )
  const [loadingFolders, setLoadingFolders] = useState(() => new Set())
  const [isRunning, setIsRunning] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [logs, setLogs] = useState(() => [
    createLog('DevTodo IDE workspace initialized', 'success'),
    createLog('폴더 드롭 Workspace 준비 완료'),
    createLog('Preview server ready on localhost:5173', 'success'),
  ])

  const isEditable = selectedFile
    ? editableFiles[selectedFile.id] !== false
    : false
  const canWriteOriginal = selectedFile
    ? Boolean(writableFiles[selectedFile.id])
    : false
  const isDirty =
    Boolean(selectedFile) &&
    isEditable &&
    currentCode !== fileContents[selectedFile.id]
  const fileCount = useMemo(
    () => countLoadedFiles(workspaceTree),
    [workspaceTree],
  )

  const addLog = (message, type = 'info') => {
    setLogs((current) => [...current, createLog(message, type)].slice(-80))
  }

  const openFile = async (node) => {
    setSelectedFile(node)

    if (Object.hasOwn(fileContents, node.id)) {
      setCurrentCode(fileContents[node.id])
      addLog(`${node.path} 파일을 열었습니다.`)
      return
    }

    setCurrentCode('// 파일을 불러오는 중입니다...')
    setEditableFiles((current) => ({ ...current, [node.id]: false }))
    setWritableFiles((current) => ({ ...current, [node.id]: false }))

    try {
      const result = await readWorkspaceFile(node)

      setFileContents((current) => ({
        ...current,
        [node.id]: result.content,
      }))
      setEditableFiles((current) => ({
        ...current,
        [node.id]: result.editable,
      }))
      setWritableFiles((current) => ({
        ...current,
        [node.id]: Boolean(result.writable),
      }))
      setCurrentCode(result.content)
      addLog(
        result.editable && result.writable
          ? `${node.path} 파일을 열었습니다. 원본 저장이 가능합니다.`
          : result.editable
            ? `${node.path} 파일을 열었습니다. 세션 저장 모드입니다.`
          : `${node.path} 파일을 읽기 전용으로 열었습니다.`,
        result.editable ? 'info' : 'action',
      )
    } catch (error) {
      setCurrentCode('파일을 읽는 중 오류가 발생했습니다.')
      setEditableFiles((current) => ({ ...current, [node.id]: false }))
      setWritableFiles((current) => ({ ...current, [node.id]: false }))
      addLog(error.message || '파일을 읽지 못했습니다.', 'action')
    }
  }

  const expandFolder = async (node) => {
    if (node.loaded || loadingFolders.has(node.id)) return

    setLoadingFolders((current) => new Set(current).add(node.id))

    try {
      const children = await loadFolderChildren(node)
      setWorkspaceTree((current) =>
        updateTreeNode(current, node.id, (target) => ({
          ...target,
          children,
          loaded: true,
        })),
      )
    } catch (error) {
      addLog(
        `${node.name} 폴더를 읽지 못했습니다: ${error.message}`,
        'action',
      )
    } finally {
      setLoadingFolders((current) => {
        const next = new Set(current)
        next.delete(node.id)
        return next
      })
    }
  }

  const activateWorkspace = async (tree, sourceLabel) => {
    let nextTree = tree

    if (tree.length === 1 && !tree[0].loaded) {
      try {
        const children = await loadFolderChildren(tree[0])
        nextTree = [{ ...tree[0], children, loaded: true }]
      } catch (error) {
        addLog(`최상위 폴더를 읽지 못했습니다: ${error.message}`, 'action')
      }
    }

    setWorkspaceTree(nextTree)
    setSelectedFile(null)
    setCurrentCode('// 왼쪽 WORKSPACE에서 파일을 선택하세요.')
    addLog(`${sourceLabel} 폴더를 Workspace에 불러왔습니다.`, 'success')
  }

  const handleFolderDrop = async (dataTransfer) => {
    try {
      const tree = await createWorkspaceFromDrop(dataTransfer)
      await activateWorkspace(tree, tree[0]?.name || '프로젝트')
    } catch (error) {
      addLog(error.message || '폴더를 불러오지 못했습니다.', 'action')
    }
  }

  const handleFolderOpen = async () => {
    if (typeof window.showDirectoryPicker !== 'function') return false

    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
      })
      const tree = createWorkspaceFromDirectoryHandle(handle)
      await activateWorkspace(tree, handle.name)
      addLog('브라우저 파일 권한으로 Workspace를 열었습니다.', 'success')
      return true
    } catch (error) {
      if (error.name === 'AbortError') return true

      addLog(
        `권한 방식으로 폴더를 열지 못했습니다: ${error.message}`,
        'action',
      )
      return false
    }
  }

  const handleFolderChoose = async (fileList) => {
    try {
      const tree = createWorkspaceFromFileList(fileList)
      await activateWorkspace(tree, tree[0]?.name || '프로젝트')
    } catch (error) {
      addLog(error.message || '폴더를 불러오지 못했습니다.', 'action')
    }
  }

  const saveCurrentFile = async () => {
    if (!selectedFile || !isEditable) {
      addLog('저장할 수 있는 텍스트 파일을 먼저 선택하세요.', 'action')
      return
    }

    const nextFiles = {
      ...fileContents,
      [selectedFile.id]: currentCode,
    }
    setFileContents(nextFiles)

    if (canWriteOriginal) {
      try {
        await writeWorkspaceFile(selectedFile, currentCode)
        addLog(`${selectedFile.path} 원본 파일에 저장되었습니다.`, 'success')
        return
      } catch (error) {
        addLog(
          `${selectedFile.path} 원본 저장 실패: ${error.message} 현재 세션에 저장합니다.`,
          'action',
        )
      }
    }

    const saved = saveProjectFiles(nextFiles)
    addLog(
      saved
        ? `${selectedFile.path} 세션 저장이 완료되었습니다.`
        : `${selectedFile.path}은 현재 브라우저 탭에만 저장되었습니다.`,
      saved ? 'success' : 'action',
    )
  }

  const runProject = async () => {
    if (isDirty) await saveCurrentFile()
    setIsRunning(true)
    addLog('프로젝트 실행 로그를 시작합니다.', 'action')

    window.setTimeout(() => {
      setRefreshKey((key) => key + 1)
      setIsRunning(false)
      addLog('실행되었습니다. Todo Preview가 새로고침되었습니다.', 'success')
    }, 650)
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#0b0f16] text-slate-100 lg:h-screen">
      <Header
        onSave={saveCurrentFile}
        onRun={runProject}
        isDirty={isDirty}
        isRunning={isRunning}
        canSave={Boolean(selectedFile) && isEditable}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[230px_minmax(380px,1fr)_minmax(320px,390px)] lg:grid-rows-[minmax(0,1fr)_170px]">
        <div className="min-h-[360px] lg:row-span-2 lg:min-h-0">
          <Sidebar
            tree={workspaceTree}
            selectedFileId={selectedFile?.id}
            fileCount={fileCount}
            loadingFolders={loadingFolders}
            onToggleFolder={expandFolder}
            onSelectFile={openFile}
            onFolderOpen={handleFolderOpen}
            onFolderDrop={handleFolderDrop}
            onFolderChoose={handleFolderChoose}
          />
        </div>
        <CodeEditor
          fileName={selectedFile?.name || 'No file selected'}
          filePath={selectedFile?.path || ''}
          code={currentCode}
          onChange={setCurrentCode}
          isDirty={isDirty}
          isEditable={isEditable}
          canWriteOriginal={canWriteOriginal}
        />
        <div className="lg:row-span-2 lg:min-h-0">
          <PreviewPanel onLog={addLog} refreshKey={refreshKey} />
        </div>
        <ConsolePanel logs={logs} onClear={() => setLogs([])} />
      </main>
    </div>
  )
}

export default App
