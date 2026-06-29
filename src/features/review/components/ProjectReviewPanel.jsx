import ProjectChat from '../../chat/components/ProjectChat'
import TodoApp from '../../tasks/components/TodoApp'

function ProjectReviewPanel({
  onLog,
  refreshKey,
  projectId,
  projectName,
  currentUser,
}) {
  const permissions = currentUser?.role.permissions || {}

  return (
    <aside className="flex min-h-[540px] min-w-0 flex-col border-l border-slate-800 bg-[#0f151e] lg:min-h-0">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-800 px-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Project Review
          </span>
          <span className="max-w-32 truncate text-[10px] text-slate-600">
            {projectName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_38%)] p-4 xl:p-5">
        <TodoApp
          key={`${projectId}-${refreshKey}`}
          onLog={onLog}
          projectId={projectId}
          permissions={permissions}
          compact
        />
        <ProjectChat
          key={`chat-${projectId}`}
          projectId={projectId}
          onLog={onLog}
          currentUser={currentUser}
          canComment={permissions.canComment}
        />
      </div>
    </aside>
  )
}

export default ProjectReviewPanel
