const TODO_STORAGE_KEY = 'devtodo.todos'
const FILE_STORAGE_KEY = 'devtodo.files'

const starterTodos = [
  {
    id: 1,
    text: 'Web IDE 기본 레이아웃 완성하기',
    completed: true,
    createdAt: '2026-06-24T09:00:00.000Z',
  },
  {
    id: 2,
    text: 'To-do CRUD 기능 테스트하기',
    completed: false,
    createdAt: '2026-06-24T10:00:00.000Z',
  },
  {
    id: 3,
    text: 'README에 프로젝트 설명 정리하기',
    completed: false,
    createdAt: '2026-06-24T11:00:00.000Z',
  },
]

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function loadTodos() {
  return readJson(TODO_STORAGE_KEY, starterTodos)
}

export function saveTodos(todos) {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos))
}

export function loadProjectFiles(fallback) {
  return readJson(FILE_STORAGE_KEY, fallback)
}

export function saveProjectFiles(files) {
  try {
    localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(files))
    return true
  } catch {
    return false
  }
}
