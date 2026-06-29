import { useState } from 'react'
import { DEFAULT_ROLE_ID, USER_ROLES } from '../lib/roles'

const roleList = Object.values(USER_ROLES)

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('demo123')
  const [roleId, setRoleId] = useState(DEFAULT_ROLE_ID)

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin({ name, roleId, password })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#08111f] px-4 py-10 text-slate-100">
      <section className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-700/70 bg-[#111722]/95 shadow-2xl shadow-black/35">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_34rem)] p-8 sm:p-10">
            <div className="mb-10 inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 font-mono text-sm font-black text-cyan-300 ring-1 ring-cyan-400/30">
                {'</>'}
              </span>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  DevTodo IDE
                </h1>
                <p className="text-xs text-slate-500">
                  Project review workspace
                </p>
              </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
              Access preview
            </p>
            <h2 className="mt-3 max-w-xl text-4xl font-black leading-none tracking-[-0.06em] text-slate-50 sm:text-5xl">
              프로젝트 작업물을 보고, 역할에 맞게 리뷰하세요.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
              과제용 로그인 프로토타입입니다. 실제 보안 인증 대신 사용자 역할에
              따라 화면 기능이 다르게 보이도록 구성했습니다.
            </p>
            <p className="mt-3 max-w-xl text-xs leading-6 text-slate-500">
              Client 권한 테스트는 아이디에 에코너, 다모애, 서리풀, 쿨보틀 중
              하나를 입력하면 해당 광고주 프로젝트만 표시됩니다.
            </p>

            <div className="mt-8 grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
                <strong className="mb-1 block text-cyan-300">Master</strong>
                전체 관리
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
                <strong className="mb-1 block text-emerald-300">Team</strong>
                작업 관리
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
                <strong className="mb-1 block text-amber-300">Client</strong>
                리뷰 채팅
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-800 bg-[#0d1119] p-6 sm:p-8 lg:border-l lg:border-t-0"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Sign in
            </p>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-semibold text-slate-300">
                아이디 또는 이름
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="예: gangseong"
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold text-slate-300">
                비밀번호
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="시연용: demo123"
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
              />
              <span className="mt-1 block text-[10px] text-slate-600">
                과제 시연용 기본 비밀번호는 demo123입니다.
              </span>
            </label>

            <div className="mt-5">
              <span className="mb-2 block text-xs font-semibold text-slate-300">
                접속 권한
              </span>
              <div className="grid gap-2">
                {roleList.map((role) => (
                  <label
                    key={role.id}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      roleId === role.id
                        ? 'border-cyan-400/60 bg-cyan-400/10'
                        : 'border-slate-800 bg-slate-950/35 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      checked={roleId === role.id}
                      onChange={() => setRoleId(role.id)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-bold text-slate-100">
                      {role.label}
                    </span>
                    <span className="mt-1 block text-[11px] leading-5 text-slate-500">
                      {role.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 h-11 w-full rounded-xl bg-cyan-400 text-sm font-black text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              프로젝트 입장
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginScreen
