const TODO_STORAGE_KEY = 'devtodo.todos'
const FILE_STORAGE_KEY = 'devtodo.files'
const CHAT_STORAGE_KEY = 'devtodo.projectChats'
const PREVIEW_ORDER_STORAGE_KEY = 'devtodo.previewOrder'

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

function scopedKey(baseKey, scope = 'default') {
  return `${baseKey}.${scope || 'default'}`
}

export function loadTodos(scope = 'default') {
  return readJson(scopedKey(TODO_STORAGE_KEY, scope), starterTodos)
}

export function saveTodos(todos, scope = 'default') {
  localStorage.setItem(scopedKey(TODO_STORAGE_KEY, scope), JSON.stringify(todos))
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

export function loadProjectChat(scope = 'default') {
  return readJson(scopedKey(CHAT_STORAGE_KEY, scope), [
    {
      id: 1,
      author: 'Codex',
      message: '작업 결과를 보고 의견을 남기는 공간입니다.',
      time: '09:00',
    },
  ])
}

export function saveProjectChat(messages, scope = 'default') {
  localStorage.setItem(
    scopedKey(CHAT_STORAGE_KEY, scope),
    JSON.stringify(messages),
  )
}

export function loadPreviewOrder(scope = 'default') {
  return readJson(scopedKey(PREVIEW_ORDER_STORAGE_KEY, scope), [])
}

export function savePreviewOrder(order, scope = 'default') {
  localStorage.setItem(
    scopedKey(PREVIEW_ORDER_STORAGE_KEY, scope),
    JSON.stringify(order),
  )
}
