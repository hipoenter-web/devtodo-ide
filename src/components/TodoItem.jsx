import { useEffect, useRef, useState } from 'react'

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
      <path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM13.5 7l3.5 3.5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
    </svg>
  )
}

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingText, setEditingText] = useState(todo.text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const saveEdit = () => {
    const text = editingText.trim()
    if (!text) return
    onEdit(todo.id, text)
    setIsEditing(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') saveEdit()
    if (event.key === 'Escape') {
      setEditingText(todo.text)
      setIsEditing(false)
    }
  }

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/45 p-3 transition hover:border-slate-700 hover:bg-slate-900/80">
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? '완료 취소' : '완료 처리'}
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] transition ${
          todo.completed
            ? 'border-cyan-400 bg-cyan-400 text-slate-950'
            : 'border-slate-600 text-transparent hover:border-cyan-400'
        }`}
      >
        ✓
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          value={editingText}
          onChange={(event) => setEditingText(event.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          className="h-8 min-w-0 flex-1 rounded border border-cyan-400/60 bg-slate-950 px-2 text-xs text-slate-100 outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => onToggle(todo.id)}
          className={`min-w-0 flex-1 text-left text-xs leading-5 transition ${
            todo.completed ? 'text-slate-600 line-through' : 'text-slate-300'
          }`}
        >
          {todo.text}
        </button>
      )}

      <div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="할 일 수정"
          className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-cyan-300"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          aria-label="할 일 삭제"
          className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-red-400/10 hover:text-red-300"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}

export default TodoItem
