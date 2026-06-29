const TOKEN_STORAGE_KEY = 'devtodo.apiToken'

function getBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '/api'
}

export function getApiToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setApiToken(token) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearApiToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export async function apiRequest(path, options = {}) {
  const token = getApiToken()
  const headers = new Headers(options.headers || {})

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'API 요청에 실패했습니다.')
  }

  return data
}
