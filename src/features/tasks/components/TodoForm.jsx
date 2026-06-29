import { useState } from 'react'

function TodoForm({ onAdd }) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const text = inputValue.trim()

    if (!text) return
    onAdd(text)
    setInputValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="todo-input" className="sr-only">
        새로운 할 일
      </label>
      <input
        id="todo-input"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="할 일을 입력하세요"
        autoComplete="off"
        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10"
      />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-lg bg-cyan-400 px-3.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      >
        + Add
      </button>
    </form>
  )
}

export default TodoForm
