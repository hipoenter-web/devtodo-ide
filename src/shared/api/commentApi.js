import { apiRequest } from './httpClient'

export async function fetchComments(projectId, keyword = '') {
  const searchParams = new URLSearchParams()
  const nextKeyword = keyword.trim()

  if (nextKeyword) searchParams.set('keyword', nextKeyword)

  const query = searchParams.toString()
  const data = await apiRequest(
    `/projects/${projectId}/comments${query ? `?${query}` : ''}`,
  )

  return data.comments || []
}

export async function createComment(projectId, message) {
  const data = await apiRequest(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  return data.comment
}
