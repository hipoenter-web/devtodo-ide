function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.3-6.8a1.1 1.1 0 0 0 0-1.8L9.6 4.3A1.1 1.1 0 0 0 8 5.2Z" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.8"
    >
      <path d="M5 3.5h11l3 3V20H5z" />
      <path d="M8 3.5v6h8v-6M8 20v-7h8v7" />
    </svg>
  )
}

function Header({ onSave, onRun, isDirty, isRunning, canSave }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-[#111722] px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-400/10 ring-1 ring-cyan-400/30">
          <span className="font-mono text-sm font-black text-cyan-300">{'</>'}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-semibold tracking-wide text-slate-100">
              DevTodo IDE
            </h1>
            <span className="hidden rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300 sm:inline">
              Online
            </span>
          </div>
          <p className="hidden text-[11px] text-slate-500 sm:block">
            Web IDE · Todo workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SaveIcon />
          <span>Save{isDirty ? ' •' : ''}</span>
        </button>
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-cyan-400 px-3.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-wait disabled:opacity-70"
        >
          <PlayIcon />
          <span>{isRunning ? 'Running' : 'Run'}</span>
        </button>
      </div>
    </header>
  )
}

export default Header
