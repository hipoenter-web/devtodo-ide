import { useState } from 'react'

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

function ViewIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.8"
    >
      <path d="M4 5.5h16M4 12h16M4 18.5h16" />
      <path d="M8 5.5v13M16 5.5v13" />
    </svg>
  )
}

const panelOptions = [
  ['project', 'Project', '좌측 프로젝트 파일 트리'],
  ['activity', 'Activity Log', '실행·저장 기록'],
  ['preview', 'Preview', 'PC/Mobile 미리보기'],
  ['editor', 'Code Editor', '코드 확인/수정 영역'],
  ['review', 'Review', 'Todo와 팀 코멘트'],
]

function Header({
  onSave,
  onRun,
  isDirty,
  isRunning,
  canSave,
  currentUser,
  onLogout,
  layout,
  onTogglePanel,
  onResetLayout,
}) {
  const [isViewOpen, setIsViewOpen] = useState(false)

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
            Web IDE · Project review
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsViewOpen((current) => !current)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            aria-expanded={isViewOpen}
          >
            <ViewIcon />
            <span>View</span>
          </button>

          {isViewOpen && (
            <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border border-slate-700 bg-[#111722] shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Layout panels
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onResetLayout()
                    setIsViewOpen(false)
                  }}
                  className="text-[10px] font-semibold text-cyan-300 transition hover:text-cyan-100"
                >
                  Full
                </button>
              </div>

              <div className="p-2">
                {panelOptions.map(([id, label, description]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onTogglePanel(id)}
                    className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-800/80"
                  >
                    <span
                      className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${
                        layout?.[id]
                          ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                          : 'border-slate-600 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-slate-200">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
                        {description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {currentUser && (
          <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs sm:flex">
            <span className="max-w-24 truncate font-semibold text-slate-200">
              {currentUser.name}
            </span>
            <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              {currentUser.role.label}
            </span>
          </div>
        )}
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
        {currentUser && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden h-9 rounded-md border border-slate-800 px-3 text-xs font-medium text-slate-500 transition hover:border-slate-700 hover:text-slate-200 sm:inline-flex sm:items-center"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
