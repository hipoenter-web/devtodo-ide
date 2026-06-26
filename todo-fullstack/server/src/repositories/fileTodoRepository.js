import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultDataFile = path.resolve(__dirname, '../../data/todos.json')
const dataFile = process.env.DATA_FILE
  ? path.resolve(process.cwd(), process.env.DATA_FILE)
  : defaultDataFile

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function ensureDataFile() {
  await mkdir(path.dirname(dataFile), { recursive: true })

  try {
    await readFile(dataFile, 'utf8')
  } catch {
    await writeFile(dataFile, '[]\n')
  }
}

async function readTodos() {
  await ensureDataFile()

  const raw = await readFile(dataFile, 'utf8')
  const parsed = JSON.parse(raw || '[]')

  return Array.isArray(parsed) ? parsed : []
}

async function writeTodos(todos) {
  await ensureDataFile()
  await writeFile(dataFile, `${JSON.stringify(todos, null, 2)}\n`)
}

export function createFileTodoRepository(storageLabel = 'Local JSON file') {
  return {
    storageLabel,

    async findAll() {
      const todos = await readTodos()
      return todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },

    async create({ title }) {
      const todos = await readTodos()
      const now = new Date().toISOString()
      const todo = {
        id: createId(),
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
      }

      await writeTodos([todo, ...todos])
      return todo
    },

    async update(id, updates) {
      const todos = await readTodos()
      const index = todos.findIndex((todo) => todo.id === id)

      if (index === -1) return null

      const updatedTodo = {
        ...todos[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      todos[index] = updatedTodo
      await writeTodos(todos)
      return updatedTodo
    },

    async remove(id) {
      const todos = await readTodos()
      const nextTodos = todos.filter((todo) => todo.id !== id)

      if (nextTodos.length === todos.length) return false

      await writeTodos(nextTodos)
      return true
    },
  }
}

