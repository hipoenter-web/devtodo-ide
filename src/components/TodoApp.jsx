import { useEffect, useMemo, useState } from 'react'
import TodoForm from './TodoForm'
import TodoList from './TodoList'
import { loadTodos, saveTodos } from '../utils/storage'

function TodoApp({ onLog }) {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const completedCount = todos.filter((todo) => todo.completed).length
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'done') return todos.filter((todo) => todo.completed)
    return todos
  }, [filter, todos])

  const addTodo = (text) => {
    setTodos((current) => [
      {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])
    onLog(`Todo 추가: ${text}`, 'action')
  }

  const toggleTodo = (id) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
    const target = todos.find((todo) => todo.id === id)
    onLog(`Todo ${target?.completed ? '진행 중으로 변경' : '완료'}: ${target?.text}`, 'action')
  }

  const editTodo = (id, text) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
    )
    onLog(`Todo 수정: ${text}`, 'action')
  }

  const deleteTodo = (id) => {
    const target = todos.find((todo) => todo.id === id)
    setTodos((current) => current.filter((todo) => todo.id !== id))
    onLog(`Todo 삭제: ${target?.text}`, 'action')
  }

  return (
    <section className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/70 bg-[#151c27]/95 shadow-2xl shadow-black/25">
      <div className="border-b border-slate-800 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              Today&apos;s sprint
            </p>
            <h2 className="text-xl font-bold tracking-tight text-slate-50">
              My Tasks
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              작은 작업부터 하나씩 완료해 보세요.
            </p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-center ring-1 ring-cyan-400/20">
            <div>
              <strong className="block text-sm text-cyan-300">{progress}%</strong>
              <span className="block text-[8px] uppercase tracking-wider text-slate-500">done</span>
            </div>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-5">
        <TodoForm onAdd={addTodo} />

        <div className="my-4 flex items-center justify-between">
          <div className="flex rounded-lg bg-slate-950/50 p-1">
            {[
              ['all', '전체'],
              ['active', '진행 중'],
              ['done', '완료'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${
                  filter === value
                    ? 'bg-slate-700 text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500">
            {completedCount}/{todos.length} completed
          </span>
        </div>

        <TodoList
          todos={visibleTodos}
          onToggle={toggleTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
        />
      </div>
    </section>
  )
}

export default TodoApp
