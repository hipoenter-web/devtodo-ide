import { useEffect, useMemo, useRef, useState } from 'react'

function CodeEditor({
  fileName,
  filePath,
  code,
  onChange,
  isDirty,
  isEditable,
  canWriteOriginal,
}) {
  const editorRef = useRef(null)
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [scrollTop, setScrollTop] = useState(0)
  const lines = useMemo(() => code.split('\n'), [code])
  const lineCount = lines.length
  const saveMode = canWriteOriginal ? 'Original file' : 'Session save'

  useEffect(() => {
    setCursor({ line: 1, column: 1 })
    setScrollTop(0)
    if (editorRef.current) editorRef.current.scrollTop = 0
  }, [filePath])

  const updateCursor = (target = editorRef.current) => {
    if (!target) return

    const position = target.selectionStart || 0
    const beforeCursor = target.value.slice(0, position)
    const lineParts = beforeCursor.split('\n')

    setCursor({
      line: lineParts.length,
      column: lineParts[lineParts.length - 1].length + 1,
    })
  }

  const insertAtSelection = (insertText) => {
    const target = editorRef.current
    if (!target) return

    const { selectionStart, selectionEnd, value } = target
    const nextValue =
      value.slice(0, selectionStart) + insertText + value.slice(selectionEnd)
    const nextCursor = selectionStart + insertText.length

    onChange(nextValue)

    window.requestAnimationFrame(() => {
      target.selectionStart = nextCursor
      target.selectionEnd = nextCursor
      updateCursor(target)
    })
  }

  const handleKeyDown = (event) => {
    if (!isEditable) return

    if (event.key === 'Tab') {
      event.preventDefault()
      insertAtSelection('  ')
    }
  }

  const handleChange = (event) => {
    onChange(event.target.value)
    updateCursor(event.currentTarget)
  }

  return (
    <section className="flex min-h-[420px] min-w-0 flex-col bg-[#0d1119] lg:min-h-0">
      <div className="flex h-10 shrink-0 items-center border-b border-slate-800 bg-[#111722]">
        <div className="flex h-full items-center gap-2 border-r border-slate-800 bg-[#0d1119] px-4 text-xs text-slate-300">
          <span className="text-amber-300">◆</span>
          <span>{fileName}</span>
          {isDirty && <span className="text-cyan-300">●</span>}
        </div>
        {isEditable && (
          <span
            className={`ml-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              canWriteOriginal
                ? 'bg-emerald-400/10 text-emerald-300'
                : 'bg-amber-400/10 text-amber-300'
            }`}
          >
            {canWriteOriginal ? '원본 저장 가능' : '세션 저장'}
          </span>
        )}
        {filePath && (
          <span className="min-w-0 truncate px-3 text-[10px] text-slate-600">
            {filePath}
          </span>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 overflow-hidden border-r border-slate-800/70 bg-[#0d1119] py-4 text-right font-mono text-xs leading-6 text-slate-700"
        >
          <div style={{ transform: `translateY(-${scrollTop}px)` }}>
            {Array.from({ length: lineCount }, (_, index) => (
              <div key={index} className="pr-3">
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        <label htmlFor="code-editor" className="sr-only">
          {fileName} 코드 편집기
        </label>
        <textarea
          ref={editorRef}
          id="code-editor"
          value={code}
          onChange={handleChange}
          onClick={(event) => updateCursor(event.currentTarget)}
          onKeyUp={(event) => updateCursor(event.currentTarget)}
          onSelect={(event) => updateCursor(event.currentTarget)}
          onKeyDown={handleKeyDown}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          readOnly={!isEditable}
          spellCheck="false"
          placeholder="왼쪽 Workspace에서 파일을 선택하세요."
          className={`h-full min-h-[380px] w-full resize-none overflow-auto bg-transparent py-4 pl-16 pr-5 font-mono text-[13px] leading-6 outline-none selection:bg-cyan-400/20 lg:min-h-0 ${
            isEditable ? 'text-slate-300' : 'text-slate-500'
          }`}
        />
      </div>

      <div className="flex h-6 shrink-0 items-center justify-end gap-4 border-t border-slate-800 bg-[#111722] px-3 text-[10px] text-slate-500">
        <span>
          Ln {cursor.line}, Col {cursor.column}
        </span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>{isEditable ? saveMode : 'Read only'}</span>
      </div>
    </section>
  )
}

export default CodeEditor
