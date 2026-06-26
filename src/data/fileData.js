export const initialFiles = {
  'src/App.jsx': `import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CodeEditor from './components/CodeEditor'
import PreviewPanel from './components/PreviewPanel'
import ConsolePanel from './components/ConsolePanel'

function App() {
  const [selectedFile, setSelectedFile] = useState('App.jsx')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="grid grid-cols-[220px_1fr_380px]">
        <Sidebar
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
        />
        <CodeEditor />
        <PreviewPanel />
      </main>
      <ConsolePanel />
    </div>
  )
}

export default App`,
  'src/components/TodoApp.jsx': `import { useEffect, useState } from 'react'
import TodoForm from './TodoForm'
import TodoList from './TodoList'
import { loadTodos, saveTodos } from '../utils/storage'

function TodoApp() {
  const [todos, setTodos] = useState(loadTodos)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = (text) => {
    setTodos((current) => [
      ...current,
      {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ])
  }

  return (
    <section>
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} />
    </section>
  )
}

export default TodoApp`,
  'src/components/TodoForm.jsx': `import { useState } from 'react'

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
    <form onSubmit={handleSubmit}>
      <input
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="새로운 할 일을 입력하세요"
      />
      <button type="submit">추가</button>
    </form>
  )
}

export default TodoForm`,
  'src/components/TodoList.jsx': `import TodoItem from './TodoItem'

function TodoList({ todos, onToggle, onEdit, onDelete }) {
  if (todos.length === 0) {
    return <p>아직 등록된 할 일이 없습니다.</p>
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TodoList`,
  'src/components/TodoItem.jsx': `import { useState } from 'react'

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingText, setEditingText] = useState(todo.text)

  const saveEdit = () => {
    const text = editingText.trim()
    if (!text) return
    onEdit(todo.id, text)
    setIsEditing(false)
  }

  return (
    <li>
      <button onClick={() => onToggle(todo.id)}>
        {todo.completed ? '완료' : '진행 중'}
      </button>
      {isEditing ? (
        <input
          value={editingText}
          onChange={(event) => setEditingText(event.target.value)}
        />
      ) : (
        <span>{todo.text}</span>
      )}
      <button onClick={() => setIsEditing(true)}>수정</button>
      <button onClick={() => onDelete(todo.id)}>삭제</button>
      {isEditing && <button onClick={saveEdit}>저장</button>}
    </li>
  )
}

export default TodoItem`,
  'src/utils/storage.js': `const TODO_STORAGE_KEY = 'devtodo.todos'

export function loadTodos() {
  try {
    const storedTodos = localStorage.getItem(TODO_STORAGE_KEY)
    return storedTodos ? JSON.parse(storedTodos) : []
  } catch {
    return []
  }
}

export function saveTodos(todos) {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos))
}`,
}

function fileNode(path) {
  return {
    id: `starter:${path}`,
    name: path.split('/').pop(),
    path,
    type: 'file',
    loaded: true,
    sourceId: 'starter',
  }
}

function folderNode(path, children) {
  return {
    id: `starter:${path}`,
    name: path.split('/').pop(),
    path,
    type: 'folder',
    children,
    loaded: true,
    sourceId: 'starter',
  }
}

export const initialWorkspaceTree = [
  folderNode('devtodo-ide', [
    folderNode('devtodo-ide/src', [
      folderNode('devtodo-ide/src/components', [
        fileNode('src/components/TodoApp.jsx'),
        fileNode('src/components/TodoForm.jsx'),
        fileNode('src/components/TodoItem.jsx'),
        fileNode('src/components/TodoList.jsx'),
      ]),
      folderNode('devtodo-ide/src/utils', [
        fileNode('src/utils/storage.js'),
      ]),
      fileNode('src/App.jsx'),
    ]),
  ]),
]

export const legacyFileNames = {
  'App.jsx': 'src/App.jsx',
  'TodoApp.jsx': 'src/components/TodoApp.jsx',
  'TodoForm.jsx': 'src/components/TodoForm.jsx',
  'TodoList.jsx': 'src/components/TodoList.jsx',
  'TodoItem.jsx': 'src/components/TodoItem.jsx',
  'storage.js': 'src/utils/storage.js',
}
