import { apiRequest } from './httpClient'

export async function fetchTodos(projectId) {
  const data = await apiRequest(`/projects/${projectId}/todos`)
  return data.todos || []
}

export async function createTodo(projectId, text) {
  const data = await apiRequest(`/projects/${projectId}/todos`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
  return data.todo
}

export async function updateTodo(projectId, todoId, patch) {
  const data = await apiRequest(`/projects/${projectId}/todos/${todoId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return data.todo
}

export async function removeTodo(projectId, todoId) {
  await apiRequest(`/projects/${projectId}/todos/${todoId}`, {
    method: 'DELETE',
  })
}
