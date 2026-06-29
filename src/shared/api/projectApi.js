import { apiRequest } from './httpClient'

export async function fetchProjects() {
  const data = await apiRequest('/projects')
  return data.projects || []
}
