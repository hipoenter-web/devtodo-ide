import { useEffect, useRef, useState } from 'react'

function FolderIcon({ isOpen }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 fill-current ${
        isOpen ? 'text-cyan-300' : 'text-sky-400'
      }`}
    >
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H10l2 2h6.5A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
    </svg>
  )
}

function FileIcon({ fileName }) {
  const extension = fileName.includes('.')
    ? fileName.split('.').pop().toUpperCase()
    : 'TXT'
  const isCode = ['JS', 'JSX', 'TS', 'TSX'].includes(extension)

  return (
    <span
      className={`grid h-4 min-w-4 shrink-0 place-items-center rounded px-0.5 text-[7px] font-black ${
        isCode
          ? 'bg-amber-300/15 text-amber-300'
          : 'bg-sky-300/15 text-sky-300'
      }`}
    >
      {extension.slice(0, 3)}
    </span>
  )
}

function TreeNode({
  node,
  depth,
  expandedFolders,
  loadingFolders,
  selectedNodeId,
  onToggleFolder,
  onSelectFile,
  onSelectFolder,
}) {
  const isFolder = node.type === 'folder'
  const isExpanded = expandedFolders.has(node.id)
  const isLoading = loadingFolders.has(node.id)
  const isSelected = node.id === selectedNodeId

  if (isFolder) {
    return (
      <li>
        <button
          type="button"
          onClick={() => {
            onSelectFolder(node)
            onToggleFolder(node)
          }}
          aria-expanded={isExpanded}
          className={`flex w-full items-center gap-1.5 py-1.5 pr-2 text-left text-xs transition ${
            isSelected
              ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-400/20'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
          }`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          <span className="w-2 shrink-0 text-[8px] text-slate-600">
            {isLoading ? '…' : isExpanded ? '▼' : '▶'}
          </span>
          <FolderIcon isOpen={isExpanded} />
          <span className="truncate font-medium">{node.name}</span>
          {isSelected && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />
          )}
        </button>

        {isExpanded && node.children?.length > 0 && (
          <ul>
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedFolders={expandedFolders}
                loadingFolders={loadingFolders}
                selectedNodeId={selectedNodeId}
                onToggleFolder={onToggleFolder}
                onSelectFile={onSelectFile}
                onSelectFolder={onSelectFolder}
              />
            ))}
          </ul>
        )}

        {isExpanded && node.loaded && node.children?.length === 0 && (
          <p
            className="py-1 text-[10px] text-slate-600"
            style={{ paddingLeft: `${30 + depth * 14}px` }}
          >
            빈 폴더
          </p>
        )}
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelectFile(node)}
        className={`flex w-full items-center gap-2 py-1.5 pr-2 text-left text-xs transition ${
          isSelected
            ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-400/20'
            : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
        }`}
        style={{ paddingLeft: `${22 + depth * 14}px` }}
      >
        <FileIcon fileName={node.name} />
        <span className="truncate">{node.name}</span>
        {isSelected && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />
        )}
      </button>
    </li>
  )
}

function ProjectSidebar({
  tree,
  assignedProjects = [],
  selectedCatalogProjectId,
  selectedFileId,
  selectedNodeId,
  fileCount,
  loadingFolders,
  onSelectCatalogProject,
  onToggleFolder,
  onSelectFile,
  onSelectFolder,
  onFolderOpen,
  onFolderDrop,
  onFolderChoose,
}) {
  const [expandedFolders, setExpandedFolders] = useState(() => new Set())
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const rootId = tree[0]?.id

  useEffect(() => {
    if (rootId && tree[0].sourceId !== 'starter') {
      setExpandedFolders(new Set([rootId]))
    }
  }, [rootId])

  const toggleFolder = async (node) => {
    if (expandedFolders.has(node.id)) {
      setExpandedFolders((current) => {
        const next = new Set(current)
        next.delete(node.id)
        return next
      })
      return
    }

    await onToggleFolder(node)
    setExpandedFolders((current) => new Set(current).add(node.id))
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    setIsDragging(false)
    await onFolderDrop(event.dataTransfer)
  }

  const handleFolderChoose = async (event) => {
    await onFolderChoose(event.target.files)
    event.target.value = ''
  }

  const handleOpenFolder = async () => {
    const openedWithPermission = await onFolderOpen()
    if (!openedWithPermission) inputRef.current?.click()
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-800 bg-[#121821]">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-800 px-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Project
        </span>
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
          {assignedProjects.length + fileCount}
        </span>
      </div>

      <nav
        aria-label="프로젝트 파일"
        className="min-h-0 flex-1 overflow-y-auto py-2"
      >
        {assignedProjects.length > 0 && (
          <section className="mb-3 border-b border-slate-800/80 pb-3">
            <div className="mb-1 flex items-center justify-between px-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Assigned Projects
              </p>
              <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                {assignedProjects.length}
              </span>
            </div>

            <ul className="space-y-1 px-2">
              {assignedProjects.map((project) => {
                const isSelected = project.id === selectedCatalogProjectId

                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCatalogProject(project)}
                      className={`w-full rounded-lg px-2.5 py-2 text-left transition ${
                        isSelected
                          ? 'bg-cyan-400/10 ring-1 ring-inset ring-cyan-400/30'
                          : 'hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="block truncate text-xs font-bold text-slate-200">
                        {project.name}
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-2 text-[9px] text-slate-500">
                        <span className="truncate">{project.clientName}</span>
                        <span className="shrink-0 rounded bg-slate-900 px-1.5 py-0.5 uppercase tracking-wide">
                          {project.status}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <div className="mb-1 px-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Local Workspace
          </p>
        </div>

        {tree.length > 0 ? (
          <ul>
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                expandedFolders={expandedFolders}
                loadingFolders={loadingFolders}
                selectedNodeId={selectedNodeId || selectedFileId}
                onToggleFolder={toggleFolder}
                onSelectFile={onSelectFile}
                onSelectFolder={onSelectFolder}
              />
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-slate-500">열린 프로젝트가 없습니다.</p>
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-slate-800 p-2.5">
        <input
          ref={inputRef}
          type="file"
          multiple
          webkitdirectory=""
          className="hidden"
          onChange={handleFolderChoose}
        />
        <div
          data-testid="folder-drop-zone"
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'copy'
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsDragging(false)
            }
          }}
          onDrop={handleDrop}
          className={`rounded-lg border border-dashed px-3 py-3 text-center transition ${
            isDragging
              ? 'border-cyan-300 bg-cyan-400/10'
              : 'border-slate-700 bg-slate-950/35 hover:border-slate-600'
          }`}
        >
          <div className="mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-lg bg-slate-800 text-sm text-cyan-300">
            ↥
          </div>
          <p className="text-[11px] font-semibold text-slate-300">
            폴더를 올리세요
          </p>
          <p className="mt-1 text-[9px] leading-4 text-slate-600">
            드래그하거나 폴더 선택
          </p>
          <button
            type="button"
            onClick={handleOpenFolder}
            className="mt-2 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[10px] font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            폴더 열기
          </button>
          <p className="mt-2 text-[9px] leading-4 text-slate-600">
            권한 지원 브라우저는 원본 저장 가능
          </p>
        </div>
      </div>
    </aside>
  )
}

export default ProjectSidebar
