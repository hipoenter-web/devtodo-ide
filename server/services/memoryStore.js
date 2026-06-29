import crypto from 'node:crypto'
import {
  clients as seedClients,
  projects as seedProjects,
  starterComments,
  starterTodos,
  users as seedUsers,
} from '../data/seedData.js'
import {
  serializeComment,
  serializeProject,
  serializeTodo,
} from './permissions.js'

function now() {
  return new Date().toISOString()
}

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFC')
}

const clients = seedClients.map((client) => ({ ...client }))
const projects = seedProjects.map((project) => ({ ...project }))
const users = seedUsers.map((user) => ({ ...user }))
let todos = projects.flatMap((project) =>
  starterTodos.map((todo) => ({
    id: crypto.randomUUID(),
    ...todo,
    projectKey: project.key,
    createdAt: now(),
    updatedAt: now(),
  })),
)
let comments = projects.flatMap((project) =>
  starterComments.map((comment) => ({
    id: crypto.randomUUID(),
    ...comment,
    projectKey: project.key,
    createdAt: now(),
    updatedAt: now(),
  })),
)

export function findMemoryUser({ name, roleId }) {
  const normalizedName = normalize(name)
  const normalizedRole = normalize(roleId)

  return (
    users.find(
      (user) =>
        normalize(user.role) === normalizedRole &&
        (normalize(user.username) === normalizedName ||
          user.aliases.some((alias) => normalize(alias) === normalizedName)),
    ) ||
    users.find((user) => normalize(user.role) === normalizedRole) ||
    users.find((user) => user.role === 'client')
  )
}

export function getMemoryProjectsForUser(user) {
  const visibleProjects =
    user.role === 'master'
      ? projects
      : projects.filter((project) => user.projectKeys.includes(project.key))

  return visibleProjects.map((project) =>
    serializeProject(
      project,
      clients.find((client) => client.key === project.clientKey),
    ),
  )
}

export function getMemoryProject(projectKey) {
  const project = projects.find((item) => item.key === projectKey)
  if (!project) return null

  return serializeProject(
    project,
    clients.find((client) => client.key === project.clientKey),
  )
}

export function listMemoryTodos(projectKey) {
  return todos
    .filter((todo) => todo.projectKey === projectKey)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(serializeTodo)
}

export function createMemoryTodo({ projectKey, text }) {
  const todo = {
    id: crypto.randomUUID(),
    projectKey,
    text,
    completed: false,
    createdAt: now(),
    updatedAt: now(),
  }

  todos.unshift(todo)

  return serializeTodo(todo)
}

export function updateMemoryTodo({ projectKey, todoId, patch }) {
  const target = todos.find(
    (todo) => todo.projectKey === projectKey && todo.id === todoId,
  )

  if (!target) return null

  if (typeof patch.text === 'string') target.text = patch.text
  if (typeof patch.completed === 'boolean') target.completed = patch.completed
  target.updatedAt = now()

  return serializeTodo(target)
}

export function deleteMemoryTodo({ projectKey, todoId }) {
  const beforeCount = todos.length
  todos = todos.filter(
    (todo) => !(todo.projectKey === projectKey && todo.id === todoId),
  )

  return todos.length !== beforeCount
}

export function listMemoryComments(projectKey) {
  return comments
    .filter((comment) => comment.projectKey === projectKey)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(serializeComment)
}

export function createMemoryComment({ projectKey, author, role, message, userKey }) {
  const comment = {
    id: crypto.randomUUID(),
    projectKey,
    author,
    role,
    message,
    createdBy: userKey,
    createdAt: now(),
    updatedAt: now(),
  }

  comments.push(comment)

  return serializeComment(comment)
}
