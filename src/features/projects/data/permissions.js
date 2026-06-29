export const projectMembers = [
  { projectId: 'econer-multitab', userId: 'team-design' },
  { projectId: 'damoae-detail-page', userId: 'team-design' },
  { projectId: 'seoripul-makgeolli', userId: 'team-design' },
  { projectId: 'coolbottle-first-page', userId: 'team-design' },
  { projectId: 'econer-multitab', userId: 'client-econer' },
  { projectId: 'damoae-detail-page', userId: 'client-damoae' },
  { projectId: 'seoripul-makgeolli', userId: 'client-seoripul' },
  { projectId: 'coolbottle-first-page', userId: 'client-coolbottle' },
]

export function canAccessProject(projectId, userId) {
  return projectMembers.some(
    (member) => member.projectId === projectId && member.userId === userId,
  )
}
