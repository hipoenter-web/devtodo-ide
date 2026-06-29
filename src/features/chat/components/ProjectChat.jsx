import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createComment,
  fetchComments,
} from '../../../shared/api/commentApi'
import {
  loadProjectChat,
  saveProjectChat,
} from '../../../shared/storage/localStorage'

function nowText() {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function normalizeSearch(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFC')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesKeyword(item, keyword) {
  const normalizedKeyword = normalizeSearch(keyword)
  if (!normalizedKeyword) return true

  return [item.author, item.role, item.message].some((value) =>
    normalizeSearch(value).includes(normalizedKeyword),
  )
}

function HighlightedText({ text, keyword }) {
  const value = String(text || '')
  const nextKeyword = keyword.trim()

  if (!nextKeyword) return value

  const pattern = new RegExp(`(${escapeRegExp(nextKeyword)})`, 'gi')

  return value.split(pattern).map((part, index) =>
    normalizeSearch(part) === normalizeSearch(nextKeyword) ? (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-cyan-300/20 px-0.5 text-cyan-100"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function ProjectChat({
  projectId = 'default',
  onLog,
  currentUser,
  canComment = true,
}) {
  const [messages, setMessages] = useState(() => loadProjectChat(projectId))
  const [message, setMessage] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeKeyword, setActiveKeyword] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isApiBacked, setIsApiBacked] = useState(false)
  const messageListRef = useRef(null)
  const visibleMessages = useMemo(() => {
    if (searchResults) return searchResults
    if (!activeKeyword) return messages

    return messages.filter((item) => matchesKeyword(item, activeKeyword))
  }, [activeKeyword, messages, searchResults])

  useEffect(() => {
    let isMounted = true

    setMessages(loadProjectChat(projectId))
    setSearchInput('')
    setActiveKeyword('')
    setSearchResults(null)

    fetchComments(projectId)
      .then((serverComments) => {
        if (!isMounted) return
        setMessages(serverComments)
        setIsApiBacked(true)
        onLog?.('리뷰 코멘트를 서버에서 불러왔습니다.', 'success')
      })
      .catch(() => {
        if (!isMounted) return
        setIsApiBacked(false)
      })

    return () => {
      isMounted = false
    }
  }, [projectId])

  useEffect(() => {
    if (!isApiBacked) saveProjectChat(messages, projectId)
  }, [isApiBacked, messages, projectId])

  useEffect(() => {
    const messageList = messageListRef.current
    if (!messageList) return

    messageList.scrollTop = messageList.scrollHeight
  }, [visibleMessages])

  const searchComments = async (event) => {
    event.preventDefault()

    const keyword = searchInput.trim()
    setActiveKeyword(keyword)

    if (!keyword) {
      setSearchResults(null)
      return
    }

    if (!isApiBacked) {
      setSearchResults(null)
      onLog?.(`로컬 코멘트에서 "${keyword}" 검색`, 'action')
      return
    }

    try {
      const serverComments = await fetchComments(projectId, keyword)
      setSearchResults(serverComments)
      onLog?.(`코멘트 검색: "${keyword}" ${serverComments.length}건`, 'action')
    } catch (error) {
      setSearchResults(null)
      onLog?.(
        `코멘트 검색 API 실패: ${error.message} 로컬 목록에서 검색합니다.`,
        'action',
      )
    }
  }

  const clearSearch = () => {
    setSearchInput('')
    setActiveKeyword('')
    setSearchResults(null)
  }

  const addMessage = async (event) => {
    event.preventDefault()

    const nextMessage = message.trim()
    if (!nextMessage) return

    const fallbackEntry = {
      id: `${Date.now()}-${Math.random()}`,
      author: currentUser?.name || 'Reviewer',
      role: currentUser?.role.label || 'Reviewer',
      message: nextMessage,
      time: nowText(),
    }

    try {
      const entry = isApiBacked
        ? await createComment(projectId, nextMessage)
        : fallbackEntry

      setMessages((current) => [...current, entry].slice(-80))
      if (searchResults && matchesKeyword(entry, activeKeyword)) {
        setSearchResults((current) => [...current, entry].slice(-80))
      }
      setMessage('')
      onLog?.(`코멘트 추가: ${nextMessage}`, 'action')
    } catch (error) {
      setIsApiBacked(false)
      setMessages((current) => [...current, fallbackEntry].slice(-80))
      if (searchResults && matchesKeyword(fallbackEntry, activeKeyword)) {
        setSearchResults((current) => [...current, fallbackEntry].slice(-80))
      }
      setMessage('')
      onLog?.(
        `코멘트 API 저장 실패: ${error.message} 로컬에 임시 저장했습니다.`,
        'action',
      )
    }
  }

  return (
    <section className="flex min-h-[230px] max-h-[360px] flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-[#151c27]/95 shadow-2xl shadow-black/20">
      <div className="shrink-0 border-b border-slate-800 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
          Team comments
        </p>
        <h2 className="mt-1 text-sm font-bold text-slate-100">
          작업 리뷰 채팅방
        </h2>
        <p className="mt-1 text-[11px] leading-4 text-slate-500">
          실행 화면을 보고 남기는 의견을 프로젝트별로 기록합니다.
        </p>
        <form onSubmit={searchComments} className="mt-3 flex gap-2">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="코멘트 검색"
            className="h-8 min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 text-[11px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
          />
          {activeKeyword && (
            <button
              type="button"
              onClick={clearSearch}
              className="h-8 rounded-lg border border-slate-800 px-2 text-[10px] font-bold text-slate-500 transition hover:border-slate-600 hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="h-8 rounded-lg bg-slate-800 px-2.5 text-[10px] font-bold text-cyan-200 transition hover:bg-slate-700"
          >
            Search
          </button>
        </form>
        {activeKeyword && (
          <p className="mt-2 text-[10px] text-slate-500">
            &quot;{activeKeyword}&quot; 검색 결과 {visibleMessages.length}건
          </p>
        )}
      </div>

      <div
        ref={messageListRef}
        className="min-h-[92px] flex-1 space-y-2 overflow-y-auto px-4 py-3 pr-2 [scrollbar-color:#334155_transparent] [scrollbar-width:thin]"
      >
        {visibleMessages.length === 0 ? (
          <div className="flex h-full min-h-[92px] items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/25 px-3 text-center text-[11px] leading-5 text-slate-500">
            {activeKeyword ? '검색 결과가 없습니다.' : '아직 등록된 리뷰 코멘트가 없습니다.'}
            <br />
            {activeKeyword
              ? '다른 키워드로 다시 검색해 보세요.'
              : '실행 화면을 확인한 뒤 의견을 남겨보세요.'}
          </div>
        ) : (
          visibleMessages.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-950/45 px-3 py-2"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <strong className="truncate text-[11px] text-slate-300">
                    {item.author}
                  </strong>
                  {item.role && (
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {item.role}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-600">{item.time}</span>
              </div>
              <p className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">
                <HighlightedText text={item.message} keyword={activeKeyword} />
              </p>
            </article>
          ))
        )}
      </div>

      <form
        onSubmit={addMessage}
        className="flex shrink-0 gap-2 border-t border-slate-800 p-3"
      >
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="리뷰 코멘트를 입력하세요"
          disabled={!canComment}
          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
        />
        <button
          type="submit"
          disabled={!canComment}
          className="h-9 shrink-0 rounded-lg bg-slate-800 px-3 text-xs font-bold text-cyan-200 transition hover:bg-slate-700"
        >
          Send
        </button>
      </form>
    </section>
  )
}

export default ProjectChat
