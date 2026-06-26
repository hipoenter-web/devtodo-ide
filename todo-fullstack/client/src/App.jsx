import { useEffect, useMemo, useState } from 'react'
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from './api/todos.js'

const FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'done', label: '완료' },
]

function TodoRow({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  const finishEdit = async () => {
    const nextTitle = draft.trim()

    if (!nextTitle) {
      setDraft(todo.title)
      setIsEditing(false)
      return
    }

    await onEdit(todo.id, nextTitle)
    setIsEditing(false)
  }

  return (
    <li className={`todo-row ${todo.completed ? 'is-done' : ''}`}>
      <button
        type="button"
        className="check-button"
        onClick={() => onToggle(todo)}
        aria-label={todo.completed ? '완료 취소' : '완료 처리'}
      >
        ✓
      </button>

      {isEditing ? (
        <input
          className="edit-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={finishEdit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') finishEdit()
            if (event.key === 'Escape') {
              setDraft(todo.title)
              setIsEditing(false)
            }
          }}
          autoFocus
        />
      ) : (
        <button
          type="button"
          className="todo-title"
          onClick={() => onToggle(todo)}
        >
          {todo.title}
        </button>
      )}

      <div className="row-actions">
        <button type="button" onClick={() => setIsEditing(true)}>
          수정
        </button>
        <button type="button" className="danger" onClick={() => onDelete(todo.id)}>
          삭제
        </button>
      </div>
    </li>
  )
}

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [storageLabel, setStorageLabel] = useState('확인 중')

  const completedCount = todos.filter((todo) => todo.completed).length
  const progress = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'done') return todos.filter((todo) => todo.completed)
    return todos
  }, [filter, todos])

  const loadTodos = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const data = await getTodos()
      setTodos(data.todos)
      setStorageLabel(data.storage)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  const addTodo = async (event) => {
    event.preventDefault()
    const title = inputValue.trim()

    if (!title) return

    try {
      setIsSaving(true)
      setErrorMessage('')
      const data = await createTodo(title)
      setTodos((current) => [data.todo, ...current])
      setInputValue('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTodo = async (todo) => {
    try {
      setErrorMessage('')
      const data = await updateTodo(todo.id, { completed: !todo.completed })
      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? data.todo : item)),
      )
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const editTodo = async (id, title) => {
    try {
      setErrorMessage('')
      const data = await updateTodo(id, { title })
      setTodos((current) =>
        current.map((item) => (item.id === id ? data.todo : item)),
      )
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const removeTodo = async (id) => {
    try {
      setErrorMessage('')
      await deleteTodo(id)
      setTodos((current) => current.filter((todo) => todo.id !== id))
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">React + Express API</p>
        <h1>DevTodo Fullstack</h1>
        <p className="description">
          프론트엔드가 백엔드 REST API와 통신해서 할 일을 등록, 조회, 수정,
          삭제하는 제출용 Todo 앱입니다.
        </p>
      </section>

      <section className="todo-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Today&apos;s work</p>
            <h2>My Tasks</h2>
            <p className="subtext">
              저장소: <strong>{storageLabel}</strong>
            </p>
          </div>
          <div className="progress-badge">
            <strong>{progress}%</strong>
            <span>done</span>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <form className="todo-form" onSubmit={addTodo}>
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="할 일을 입력하세요"
            disabled={isSaving}
            autoComplete="off"
          />
          <button type="submit" disabled={isSaving}>
            {isSaving ? '저장 중' : '+ 추가'}
          </button>
        </form>

        <div className="toolbar">
          <div className="filters">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? 'active' : ''}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span>
            {completedCount}/{todos.length} 완료
          </span>
        </div>

        {errorMessage ? <p className="error-box">{errorMessage}</p> : null}

        {isLoading ? (
          <div className="empty-box">백엔드에서 데이터를 불러오는 중입니다.</div>
        ) : visibleTodos.length === 0 ? (
          <div className="empty-box">표시할 할 일이 없습니다.</div>
        ) : (
          <ul className="todo-list">
            {visibleTodos.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onEdit={editTodo}
                onDelete={removeTodo}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App

