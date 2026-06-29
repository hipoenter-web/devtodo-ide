import { apiRequest } from './httpClient'

export async function fetchComments(projectId) {
  const data = await apiRequest(`/projects/${projectId}/comments`)
  return data.comments || []
}

export async function createComment(projectId, message) {
  const data = await apiRequest(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  return data.comment
}
