function ConsolePanel({ logs, onClear }) {
  return (
    <section className="flex min-h-[150px] flex-col border-t border-slate-800 bg-[#0b0f16] lg:min-h-0">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex h-full items-center gap-5">
          <span className="flex h-full items-center border-b-2 border-cyan-400 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200">
            Console
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-600">
            Problems 0
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] text-slate-500 transition hover:text-slate-200"
        >
          Clear
        </button>
      </div>
      <div
        aria-live="polite"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-5"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3">
            <span className="shrink-0 text-slate-600">{log.time}</span>
            <span
              className={
                log.type === 'success'
                  ? 'text-emerald-300'
                  : log.type === 'action'
                    ? 'text-cyan-300'
                    : 'text-slate-400'
              }
            >
              <span className="mr-2 text-slate-600">›</span>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ConsolePanel
