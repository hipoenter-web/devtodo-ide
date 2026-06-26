const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || '요청 처리 중 오류가 발생했습니다.')
  }

  return data
}

export function getTodos() {
  return request('/todos')
}

export function createTodo(title) {
  return request('/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function updateTodo(id, updates) {
  return request(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function deleteTodo(id) {
  return request(`/todos/${id}`, {
    method: 'DELETE',
  })
}

