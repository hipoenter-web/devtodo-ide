export const USER_ROLES = {
  master: {
    id: 'master',
    label: 'Master',
    description: '프로젝트 관리, 코드 편집, Todo 관리, 리뷰 채팅 가능',
    permissions: {
      canEditCode: true,
      canSaveCode: true,
      canManageTasks: true,
      canDeleteTasks: true,
      canComment: true,
    },
  },
  team: {
    id: 'team',
    label: 'Team',
    description: 'Todo 관리/삭제와 리뷰 채팅 가능',
    permissions: {
      canEditCode: false,
      canSaveCode: false,
      canManageTasks: true,
      canDeleteTasks: true,
      canComment: true,
    },
  },
  client: {
    id: 'client',
    label: 'Client',
    description: '작업물 확인과 리뷰 채팅만 가능',
    permissions: {
      canEditCode: false,
      canSaveCode: false,
      canManageTasks: false,
      canDeleteTasks: false,
      canComment: true,
    },
  },
}

export const DEFAULT_ROLE_ID = 'client'

export function createUserSession({ name, roleId }) {
  const role = USER_ROLES[roleId] || USER_ROLES[DEFAULT_ROLE_ID]

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim() || role.label,
    role,
  }
}
