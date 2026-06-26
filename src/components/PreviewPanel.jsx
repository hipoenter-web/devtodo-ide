import TodoApp from './TodoApp'

function PreviewPanel({ onLog, refreshKey }) {
  return (
    <aside className="flex min-h-[540px] min-w-0 flex-col border-l border-slate-800 bg-[#0f151e] lg:min-h-0">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-800 px-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_38%)] p-4 xl:p-6">
        <TodoApp key={refreshKey} onLog={onLog} />
      </div>
    </aside>
  )
}

export default PreviewPanel
