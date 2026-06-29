import { useEffect, useMemo, useState } from 'react'
import TodoForm from './TodoForm'
import TodoList from './TodoList'
import {
  createTodo,
  fetchTodos,
  removeTodo,
  updateTodo,
} from '../../../shared/api/todoApi'
import { loadTodos, saveTodos } from '../../../shared/storage/localStorage'

function TodoApp({
  onLog,
  projectId = 'default',
  compact = false,
  permissions = {},
}) {
  const [todos, setTodos] = useState(() => loadTodos(projectId))
  const [filter, setFilter] = useState('all')
  const [isApiBacked, setIsApiBacked] = useState(false)

  useEffect(() => {
    let isMounted = true

    setTodos(loadTodos(projectId))
    setFilter('all')

    fetchTodos(projectId)
      .then((serverTodos) => {
        if (!isMounted) return
        setTodos(serverTodos)
        setIsApiBacked(true)
        onLog?.('Todo를 서버에서 불러왔습니다.', 'success')
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
    if (!isApiBacked) saveTodos(todos, projectId)
  }, [isApiBacked, todos, projectId])

  const completedCount = todos.filter((todo) => todo.completed).length
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'done') return todos.filter((todo) => todo.completed)
    return todos
  }, [filter, todos])

  const addTodo = async (text) => {
    if (!permissions.canManageTasks) {
      onLog?.('현재 권한으로는 Todo를 추가할 수 없습니다.', 'action')
      return
    }

    const fallbackTodo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    try {
      const nextTodo = isApiBacked
        ? await createTodo(projectId, text)
        : fallbackTodo

      setTodos((current) => [nextTodo, ...current])
      onLog?.(`Todo 추가: ${text}`, 'action')
    } catch (error) {
      setTodos((current) => [fallbackTodo, ...current])
      setIsApiBacked(false)
      onLog?.(
        `Todo API 저장 실패: ${error.message} 로컬에 임시 저장했습니다.`,
        'action',
      )
    }
  }

  const toggleTodo = async (id) => {
    if (!permissions.canManageTasks) {
      onLog?.('현재 권한으로는 Todo 상태를 변경할 수 없습니다.', 'action')
      return
    }

    const target = todos.find((todo) => todo.id === id)
    if (!target) return

    try {
      const nextTodo = isApiBacked
        ? await updateTodo(projectId, id, { completed: !target.completed })
        : {
            ...target,
            completed: !target.completed,
          }

      setTodos((current) =>
        current.map((todo) => (todo.id === id ? nextTodo : todo)),
      )
      onLog?.(
        `Todo ${target.completed ? '진행 중으로 변경' : '완료'}: ${target.text}`,
        'action',
      )
    } catch (error) {
      setIsApiBacked(false)
      setTodos((current) =>
        current.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      )
      onLog?.(
        `Todo API 수정 실패: ${error.message} 로컬 상태로 반영했습니다.`,
        'action',
      )
    }
  }

  const editTodo = async (id, text) => {
    if (!permissions.canManageTasks) {
      onLog?.('현재 권한으로는 Todo를 수정할 수 없습니다.', 'action')
      return
    }

    const target = todos.find((todo) => todo.id === id)
    if (!target) return

    try {
      const nextTodo = isApiBacked
        ? await updateTodo(projectId, id, { text })
        : {
            ...target,
            text,
          }

      setTodos((current) =>
        current.map((todo) => (todo.id === id ? nextTodo : todo)),
      )
      onLog?.(`Todo 수정: ${text}`, 'action')
    } catch (error) {
      setIsApiBacked(false)
      setTodos((current) =>
        current.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
      )
      onLog?.(
        `Todo API 수정 실패: ${error.message} 로컬 상태로 반영했습니다.`,
        'action',
      )
    }
  }

  const deleteTodo = async (id) => {
    if (!permissions.canDeleteTasks) {
      onLog?.('현재 권한으로는 Todo를 삭제할 수 없습니다.', 'action')
      return
    }

    const target = todos.find((todo) => todo.id === id)

    try {
      if (isApiBacked) await removeTodo(projectId, id)

      setTodos((current) => current.filter((todo) => todo.id !== id))
      onLog?.(`Todo 삭제: ${target?.text}`, 'action')
    } catch (error) {
      setIsApiBacked(false)
      setTodos((current) => current.filter((todo) => todo.id !== id))
      onLog?.(
        `Todo API 삭제 실패: ${error.message} 로컬 상태로 반영했습니다.`,
        'action',
      )
    }
  }

  return (
    <section
      className={`mx-auto flex w-full flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-[#151c27]/95 shadow-2xl shadow-black/25 ${
        compact ? 'max-h-[430px] max-w-none' : 'max-h-[720px] max-w-lg'
      }`}
    >
      <div className="shrink-0 border-b border-slate-800 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              Today&apos;s sprint
            </p>
            <h2 className="text-xl font-bold tracking-tight text-slate-50">
              Project Tasks
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

      <div className="flex min-h-0 flex-1 flex-col p-5">
        {permissions.canManageTasks ? (
          <TodoForm onAdd={addTodo} />
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-3 text-xs leading-5 text-slate-500">
            Client 권한은 작업 목록을 확인만 할 수 있습니다.
          </div>
        )}

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

        <div className="min-h-[132px] flex-1 overflow-y-auto pr-1 [scrollbar-color:#334155_transparent] [scrollbar-width:thin]">
          <TodoList
            todos={visibleTodos}
            onToggle={toggleTodo}
            onEdit={editTodo}
            onDelete={deleteTodo}
            canManage={permissions.canManageTasks}
            canDelete={permissions.canDeleteTasks}
          />
        </div>
      </div>
    </section>
  )
}

export default TodoApp
