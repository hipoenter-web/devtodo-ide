import { useEffect, useMemo, useState } from 'react'
import ActivityPanel from '../features/activity/components/ActivityPanel'
import LoginScreen from '../features/auth/components/LoginScreen'
import { USER_ROLES, createUserSession } from '../features/auth/lib/roles'
import CodeEditor from '../features/editor/components/CodeEditor'
import ProjectPreview from '../features/preview/components/ProjectPreview'
import ProjectSidebar from '../features/projects/components/ProjectSidebar'
import ProjectReviewPanel from '../features/review/components/ProjectReviewPanel'
import Header from '../shared/components/Header'
import { login as apiLogin, logout as apiLogout } from '../shared/api/authApi'
import { fetchProjects } from '../shared/api/projectApi'
import {
  loadPreviewOrder,
  savePreviewOrder,
  saveProjectFiles,
} from '../shared/storage/localStorage'
import {
  createCatalogProjectPreview,
  getVisibleProjects,
} from '../features/projects/lib/projectService'
import {
  collectFolderMedia,
  countLoadedFiles,
  createStaticHtmlPreview,
  createWorkspaceFromDirectoryHandle,
  createWorkspaceFromDrop,
  createWorkspaceFromFileList,
  isPreviewMediaFileName,
  loadFolderChildren,
  readWorkspaceMedia,
  readWorkspaceFile,
  updateTreeNode,
  writeWorkspaceFile,
} from '../features/projects/lib/workspace'

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

const defaultLayout = {
  project: true,
  activity: false,
  preview: true,
  editor: true,
  review: true,
}

const fullLayout = {
  ...defaultLayout,
  activity: true,
}

const centerPanelBounds = {
  activity: { min: 190, max: 560 },
  preview: { min: 220, max: 680 },
}

const defaultCenterPanelHeights = {
  activity: 270,
  preview: 300,
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function ResizeHandle({ label, onPointerDown }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={onPointerDown}
      className="group absolute bottom-0 left-0 right-0 z-10 flex h-6 cursor-row-resize touch-none items-end justify-center bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent pb-2 outline-none transition hover:from-cyan-950/45"
    >
      <span className="h-1 w-16 rounded-full bg-slate-700/80 transition group-hover:w-24 group-hover:bg-cyan-300/80 group-focus-visible:w-24 group-focus-visible:bg-cyan-300/80" />
    </button>
  )
}

function applySavedGalleryOrder(items, scope) {
  if (!scope) return items

  const savedOrder = loadPreviewOrder(scope)
  if (!savedOrder.length) return items

  const orderMap = new Map(savedOrder.map((id, index) => [id, index]))

  return [...items].sort((a, b) => {
    const aOrder = orderMap.get(a.id) ?? orderMap.get(a.path)
    const bOrder = orderMap.get(b.id) ?? orderMap.get(b.path)

    if (aOrder === undefined && bOrder === undefined) return 0
    if (aOrder === undefined) return 1
    if (bOrder === undefined) return -1
    return aOrder - bOrder
  })
}

function applyGalleryOrderToPreview(previewContent) {
  if (previewContent.type !== 'gallery' || !previewContent.galleryOrderScope) {
    return previewContent
  }

  return {
    ...previewContent,
    images: applySavedGalleryOrder(
      previewContent.images,
      previewContent.galleryOrderScope,
    ),
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [apiProjects, setApiProjects] = useState(null)
  const [layout, setLayout] = useState(defaultLayout)
  const [centerPanelHeights, setCenterPanelHeights] = useState(
    defaultCenterPanelHeights,
  )
  const [workspaceTree, setWorkspaceTree] = useState([])
  const [fileContents, setFileContents] = useState({})
  const [editableFiles, setEditableFiles] = useState({})
  const [writableFiles, setWritableFiles] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedPreviewTarget, setSelectedPreviewTarget] = useState(null)
  const [selectedCatalogProject, setSelectedCatalogProject] = useState(null)
  const [previewContent, setPreviewContent] = useState({ type: 'shell' })
  const [currentCode, setCurrentCode] = useState(
    '// 왼쪽 PROJECT에 Finder 폴더를 올려주세요.',
  )
  const [loadingFolders, setLoadingFolders] = useState(() => new Set())
  const [isRunning, setIsRunning] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [logs, setLogs] = useState(() => [
    createLog('DevTodo IDE workspace initialized', 'success'),
    createLog('폴더 드롭 Project 준비 완료'),
    createLog('Preview server ready on localhost:5173', 'success'),
  ])

  const permissions = currentUser?.role.permissions || {}
  const isEditable = selectedFile
    ? editableFiles[selectedFile.id] !== false && permissions.canEditCode
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
  const assignedProjects = useMemo(
    () => apiProjects || getVisibleProjects(currentUser),
    [apiProjects, currentUser],
  )
  const projectName =
    selectedCatalogProject?.name || workspaceTree[0]?.name || 'No project'
  const projectId =
    selectedCatalogProject?.id || workspaceTree[0]?.id || 'default'
  const previewTargetName =
    selectedCatalogProject?.name ||
    selectedPreviewTarget?.path ||
    selectedFile?.path ||
    projectName
  const hasCenterPanel = layout.activity || layout.preview || layout.editor
  const shouldPreviewFillCenter = layout.preview && !layout.editor
  const mainGridClass =
    layout.project && layout.review
      ? 'lg:grid-cols-[230px_minmax(420px,1fr)_minmax(330px,410px)]'
      : layout.project
        ? 'lg:grid-cols-[230px_minmax(420px,1fr)]'
        : layout.review
          ? 'lg:grid-cols-[minmax(420px,1fr)_minmax(330px,410px)]'
          : 'lg:grid-cols-[minmax(420px,1fr)]'

  const startCenterPanelResize = (panelName, event) => {
    event.preventDefault()

    const startY = event.clientY
    const startHeight = centerPanelHeights[panelName]
    const bounds = centerPanelBounds[panelName]

    const handlePointerMove = (moveEvent) => {
      const nextHeight = clamp(
        startHeight + moveEvent.clientY - startY,
        bounds.min,
        bounds.max,
      )

      setCenterPanelHeights((current) => ({
        ...current,
        [panelName]: nextHeight,
      }))
    }

    const stopResize = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopResize)
      window.removeEventListener('pointercancel', stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopResize)
    window.addEventListener('pointercancel', stopResize)
  }

  const addLog = (message, type = 'info') => {
    setLogs((current) => [...current, createLog(message, type)].slice(-80))
  }

  useEffect(() => {
    if (!currentUser || currentUser.source !== 'api') {
      setApiProjects(null)
      return
    }

    let isMounted = true

    fetchProjects()
      .then((projects) => {
        if (!isMounted) return
        setApiProjects(projects)
        addLog('서버에서 권한 프로젝트 목록을 불러왔습니다.', 'success')
      })
      .catch((error) => {
        if (!isMounted) return
        setApiProjects(null)
        addLog(
          `프로젝트 API 호출 실패: ${error.message} 로컬 샘플 목록을 사용합니다.`,
          'action',
        )
      })

    return () => {
      isMounted = false
    }
  }, [currentUser])

  const openFile = async (node) => {
    setSelectedCatalogProject(null)
    setSelectedFile(node)
    setSelectedPreviewTarget(node)

    if (isPreviewMediaFileName(node.name)) {
      setEditableFiles((current) => ({ ...current, [node.id]: false }))
      setWritableFiles((current) => ({ ...current, [node.id]: false }))
      setCurrentCode(
        `// 미디어 파일입니다.\n// Run을 누르거나 파일을 선택하면 Preview에서 확인할 수 있습니다.\n// ${node.path}`,
      )

      try {
        const media = await readWorkspaceMedia(node)
        setPreviewContent({
          type: 'image',
          title: node.name,
          message: `${node.path} 파일을 Preview에 표시합니다.`,
          images: [media],
        })
        addLog(`${node.path} 파일을 Preview에 표시했습니다.`, 'success')
      } catch (error) {
        setPreviewContent({
          type: 'message',
          title: 'Preview 실패',
          message: error.message || '파일을 읽지 못했습니다.',
        })
        addLog(error.message || '파일을 읽지 못했습니다.', 'action')
      }
      return
    }

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

  const selectFolderForPreview = (node) => {
    setSelectedCatalogProject(null)
    setSelectedPreviewTarget(node)
    addLog(`${node.path} 폴더가 Preview 대상으로 선택되었습니다.`)
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
    setSelectedCatalogProject(null)
    setSelectedFile(null)
    setSelectedPreviewTarget(nextTree[0] || null)
    setPreviewContent({ type: 'shell' })
    setCurrentCode('// 왼쪽 PROJECT에서 파일을 선택하세요.')
    addLog(`${sourceLabel} 폴더를 Project에 불러왔습니다.`, 'success')
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
      addLog('브라우저 파일 권한으로 Project를 열었습니다.', 'success')
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

  const handleLogin = async (credentials) => {
    try {
      const data = await apiLogin(credentials)
      const role = USER_ROLES[data.user.roleId] || USER_ROLES.client
      const user = {
        id: data.user.id,
        name: data.user.name,
        role: {
          ...role,
          permissions: data.user.permissions || role.permissions,
        },
        source: 'api',
        apiMode: data.mode,
      }

      setCurrentUser(user)
      setLogs((current) => [
        ...current,
        createLog(
          `${user.name}님이 ${user.role.label} 권한으로 서버 로그인했습니다.`,
          'success',
        ),
      ])
    } catch (error) {
      const user = {
        ...createUserSession(credentials),
        source: 'local',
      }

      setCurrentUser(user)
      setLogs((current) => [
        ...current,
        createLog(
          `서버 로그인 실패: ${error.message} 로컬 시연 모드로 접속했습니다.`,
          'action',
        ),
      ])
    }
  }

  const handleLogout = () => {
    apiLogout()
    setCurrentUser(null)
    setApiProjects(null)
    setSelectedCatalogProject(null)
    setPreviewContent({ type: 'shell' })
  }

  const handleCatalogProjectSelect = (project) => {
    setSelectedCatalogProject(project)
    setSelectedFile(null)
    setSelectedPreviewTarget(null)
    setCurrentCode(
      `// 샘플 프로젝트: ${project.name}\n// 광고주: ${project.clientName}\n// 설명: ${project.description}\n// Run을 누르면 등록된 디자인 파일을 Preview로 확인합니다.`,
    )
    setPreviewContent({
      type: 'message',
      title: project.name,
      message:
        '좌측 권한 프로젝트가 선택되었습니다. Run을 누르면 샘플 디자인 Preview를 표시합니다.',
    })
    addLog(`${project.clientName} / ${project.name} 프로젝트가 선택되었습니다.`)
  }

  const createOrderedCatalogPreview = (project) =>
    applyGalleryOrderToPreview(createCatalogProjectPreview(project))

  const reorderPreviewGallery = (fromIndex, toIndex) => {
    setPreviewContent((current) => {
      if (
        current?.type !== 'gallery' ||
        !current.images ||
        toIndex < 0 ||
        toIndex >= current.images.length
      ) {
        return current
      }

      const images = [...current.images]
      const [target] = images.splice(fromIndex, 1)
      images.splice(toIndex, 0, target)

      if (current.galleryOrderScope) {
        savePreviewOrder(
          images.map((image) => image.id || image.path),
          current.galleryOrderScope,
        )
      }

      return {
        ...current,
        images,
        message: `${current.title} · Preview 순서를 조정했습니다.`,
      }
    })
  }

  const toggleLayoutPanel = (panelId) => {
    setLayout((current) => ({
      ...current,
      [panelId]: !current[panelId],
    }))
  }

  const saveCurrentFile = async () => {
    if (!permissions.canSaveCode) {
      addLog('현재 권한으로는 코드 저장을 사용할 수 없습니다.', 'action')
      return
    }

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

  const buildFolderPreview = async (target) => {
    const children = target.loaded
      ? target.children || []
      : await loadFolderChildren(target)
    const currentTarget = target.loaded
      ? target
      : { ...target, children, loaded: true }

    if (!target.loaded) {
      setWorkspaceTree((current) =>
        updateTreeNode(current, target.id, (node) => ({
          ...node,
          children,
          loaded: true,
        })),
      )
      setSelectedPreviewTarget(currentTarget)
    }

    const hasIndexHtml = children.some(
      (child) => child.type === 'file' && child.name.toLowerCase() === 'index.html',
    )
    const hasPackageJson = children.some(
      (child) => child.type === 'file' && child.name.toLowerCase() === 'package.json',
    )
    const hasSrcFolder = children.some(
      (child) => child.type === 'folder' && child.name.toLowerCase() === 'src',
    )

    if (hasPackageJson && hasSrcFolder) {
      return {
        type: 'message',
        title: 'React/Vite 프로젝트 감지',
        message:
          'package.json이 발견되었습니다. 이 유형은 서버 실행 또는 배포 URL 연결 후 Preview로 여는 방식이 적합합니다.',
      }
    }

    if (hasIndexHtml) {
      return createStaticHtmlPreview(currentTarget)
    }

    if (hasPackageJson) {
      return {
        type: 'message',
        title: '실행 설정 파일 감지',
        message:
          'package.json이 발견되었습니다. 정적 index.html이 없어서 서버 실행 또는 배포 URL 연결이 필요합니다.',
      }
    }

    const media = await collectFolderMedia(currentTarget)
    const galleryOrderScope = `folder:${currentTarget.id}`

    if (media.length > 0) {
      return applyGalleryOrderToPreview({
        type: 'gallery',
        title: currentTarget.name,
        message: `${media.length}개의 이미지/GIF/영상 파일을 파일명 순서대로 이어 붙였습니다.`,
        images: media,
        galleryOrderScope,
      })
    }

    return {
      type: 'message',
      title: 'Preview 대상 없음',
      message:
        '이 폴더에서 바로 표시할 이미지/GIF/영상, index.html, package.json을 찾지 못했습니다.',
    }
  }

  const runProject = async () => {
    if (isDirty) await saveCurrentFile()
    setIsRunning(true)
    addLog('Preview 대상을 분석합니다.', 'action')

    try {
      if (selectedCatalogProject) {
        const nextPreviewContent = createOrderedCatalogPreview(selectedCatalogProject)
        setPreviewContent(nextPreviewContent)
        addLog(
          nextPreviewContent.type === 'gallery'
            ? `${selectedCatalogProject.name} 샘플 Preview를 생성했습니다.`
            : `${selectedCatalogProject.name} 프로젝트 분석이 완료되었습니다.`,
          nextPreviewContent.type === 'gallery' ? 'success' : 'action',
        )
        return
      }

      const target = selectedPreviewTarget || selectedFile || workspaceTree[0]

      if (!target) {
        setPreviewContent({
          type: 'message',
          title: 'Preview 대상 없음',
          message:
            '좌측 Project에서 권한 프로젝트, 미디어 파일, 또는 폴더를 먼저 선택하세요.',
        })
        addLog('Preview 대상이 없습니다.', 'action')
        return
      }

      if (target.type === 'file' && isPreviewMediaFileName(target.name)) {
        const media = await readWorkspaceMedia(target)
        setPreviewContent({
          type: 'image',
          title: target.name,
          message: `${target.path} 파일을 Preview에 표시합니다.`,
          images: [media],
        })
        addLog(`${target.path} 파일을 Preview에 표시했습니다.`, 'success')
        return
      }

      if (target.type === 'folder') {
        const nextPreviewContent = await buildFolderPreview(target)
        const isPreviewReady = ['gallery', 'html'].includes(nextPreviewContent.type)
        setPreviewContent(nextPreviewContent)
        addLog(
          nextPreviewContent.type === 'html'
            ? `${target.path} 폴더의 정적 HTML Preview를 생성했습니다.`
            : nextPreviewContent.type === 'gallery'
            ? `${target.path} 폴더의 미디어 상세 Preview를 생성했습니다.`
            : `${target.path} 폴더 분석이 완료되었습니다.`,
          isPreviewReady ? 'success' : 'action',
        )
        return
      }

      setPreviewContent({
        type: 'message',
        title: '코드 파일은 직접 실행하지 않습니다',
        message:
          '텍스트/코드 파일은 Code Editor에서 확인하고, Preview는 권한 프로젝트·미디어 파일·미디어 폴더·HTML/URL 연결을 대상으로 사용합니다.',
      })
      addLog('코드 파일은 현재 Preview 실행 대상이 아닙니다.', 'action')
    } catch (error) {
      setPreviewContent({
        type: 'message',
        title: 'Preview 생성 실패',
        message: error.message || 'Preview를 생성하지 못했습니다.',
      })
      addLog(error.message || 'Preview를 생성하지 못했습니다.', 'action')
    } finally {
      setRefreshKey((key) => key + 1)
      setIsRunning(false)
    }
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#0b0f16] text-slate-100 lg:h-screen">
      <Header
        onSave={saveCurrentFile}
        onRun={runProject}
        isDirty={isDirty}
        isRunning={isRunning}
        canSave={Boolean(selectedFile) && isEditable && permissions.canSaveCode}
        currentUser={currentUser}
        onLogout={handleLogout}
        layout={layout}
        onTogglePanel={toggleLayoutPanel}
        onResetLayout={() => setLayout(fullLayout)}
      />

      <main className={`grid min-h-0 flex-1 grid-cols-1 ${mainGridClass}`}>
        {layout.project && (
        <div className="min-h-[360px] lg:min-h-0">
          <ProjectSidebar
            tree={workspaceTree}
            assignedProjects={assignedProjects}
            selectedCatalogProjectId={selectedCatalogProject?.id}
            selectedFileId={selectedFile?.id}
            selectedNodeId={selectedPreviewTarget?.id}
            fileCount={fileCount}
            loadingFolders={loadingFolders}
            onSelectCatalogProject={handleCatalogProjectSelect}
            onToggleFolder={expandFolder}
            onSelectFile={openFile}
            onSelectFolder={selectFolderForPreview}
            onFolderOpen={handleFolderOpen}
            onFolderDrop={handleFolderDrop}
            onFolderChoose={handleFolderChoose}
          />
        </div>
        )}

        <section className="flex min-h-[420px] min-w-0 flex-col bg-[#0b0f16] lg:min-h-0">
          {!hasCenterPanel && (
            <div className="grid min-h-[420px] flex-1 place-items-center border-b border-slate-800 bg-[#0d1119] px-6 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-300">
                  열린 중앙 패널이 없습니다.
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  상단 View 메뉴에서 Activity Log, Preview, Code Editor를 다시 켜세요.
                </p>
              </div>
            </div>
          )}

          {layout.activity && (
          <div
            className="relative shrink-0 overflow-hidden border-b border-slate-800"
            style={{
              height: `${centerPanelHeights.activity}px`,
              minHeight: `${centerPanelBounds.activity.min}px`,
            }}
          >
            <div className="h-full overflow-hidden">
              <ActivityPanel
                logs={logs}
                onClear={() => setLogs([])}
              />
            </div>
            <ResizeHandle
              label="Activity Log 높이 조절"
              onPointerDown={(event) =>
                startCenterPanelResize('activity', event)
              }
            />
          </div>
          )}

          {layout.preview && (
          <div
            className={`relative overflow-hidden border-b border-slate-800 ${
              shouldPreviewFillCenter ? 'min-h-[220px] flex-1' : 'shrink-0'
            }`}
            style={
              shouldPreviewFillCenter
                ? { minHeight: `${centerPanelBounds.preview.min}px` }
                : {
                    height: `${centerPanelHeights.preview}px`,
                    minHeight: `${centerPanelBounds.preview.min}px`,
                  }
            }
          >
            <div className="h-full overflow-hidden">
              <ProjectPreview
                projectName={projectName}
                selectedFileName={previewTargetName}
                refreshKey={refreshKey}
                isRunning={isRunning}
                previewContent={previewContent}
                onReorderGallery={reorderPreviewGallery}
              />
            </div>
            {!shouldPreviewFillCenter && (
              <ResizeHandle
                label="Preview 높이 조절"
                onPointerDown={(event) =>
                  startCenterPanelResize('preview', event)
                }
              />
            )}
          </div>
          )}

          {layout.editor && (
          <div className="min-h-[330px] flex-1 overflow-hidden">
            <CodeEditor
              fileName={selectedFile?.name || 'No file selected'}
              filePath={selectedFile?.path || ''}
              code={currentCode}
              onChange={setCurrentCode}
              isDirty={isDirty}
              isEditable={isEditable}
              canWriteOriginal={canWriteOriginal}
            />
          </div>
          )}
        </section>

        {layout.review && (
        <div className="min-h-[540px] lg:min-h-0">
          <ProjectReviewPanel
            onLog={addLog}
            refreshKey={refreshKey}
            projectId={projectId}
            projectName={projectName}
            currentUser={currentUser}
          />
        </div>
        )}
      </main>
    </div>
  )
}

export default App
