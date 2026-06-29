export const rolePermissions = {
  master: {
    canEditCode: true,
    canSaveCode: true,
    canManageTasks: true,
    canDeleteTasks: true,
    canComment: true,
  },
  team: {
    canEditCode: false,
    canSaveCode: false,
    canManageTasks: true,
    canDeleteTasks: true,
    canComment: true,
  },
  client: {
    canEditCode: false,
    canSaveCode: false,
    canManageTasks: false,
    canDeleteTasks: false,
    canComment: true,
  },
}

export function canReadProject(user, projectKey) {
  if (!user) return false
  if (user.role === 'master') return true
  return user.projectKeys?.includes(projectKey)
}

export function canManageTasks(user) {
  return Boolean(rolePermissions[user?.role]?.canManageTasks)
}

export function canDeleteTasks(user) {
  return Boolean(rolePermissions[user?.role]?.canDeleteTasks)
}

export function canComment(user) {
  return Boolean(rolePermissions[user?.role]?.canComment)
}

export function serializeUser(user) {
  return {
    id: user.key || user._id?.toString(),
    key: user.key,
    username: user.username,
    name: user.name,
    roleId: user.role,
    projectKeys: user.projectKeys || [],
    permissions: rolePermissions[user.role] || rolePermissions.client,
  }
}

export function serializeProject(project, client) {
  return {
    id: project.key,
    key: project.key,
    clientId: project.clientKey,
    clientKey: project.clientKey,
    clientName: client?.name || '미지정 광고주',
    client,
    name: project.name,
    folderName: project.folderName,
    type: project.type,
    status: project.status,
    description: project.description,
  }
}

export function serializeTodo(todo) {
  return {
    id: todo._id?.toString() || todo.id,
    text: todo.text,
    completed: todo.completed,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  }
}

export function serializeComment(comment) {
  const createdAt = comment.createdAt ? new Date(comment.createdAt) : new Date()

  return {
    id: comment._id?.toString() || comment.id,
    author: comment.author,
    role: comment.role,
    message: comment.message,
    createdAt: createdAt.toISOString(),
    time: new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(createdAt),
  }
}
