import { apiRequest, clearApiToken, setApiToken } from './httpClient'

export async function login(credentials) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  setApiToken(data.token)

  return data
}

export function logout() {
  clearApiToken()
}
