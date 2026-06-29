function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFC')
}

export const demoUsers = [
  {
    id: 'master',
    roleId: 'master',
    label: 'Master',
    aliases: ['master', '관리자', 'gangseong', '강성걸'],
  },
  {
    id: 'team-design',
    roleId: 'team',
    label: 'Design Team',
    aliases: ['team', '팀원', 'designer', '디자이너'],
  },
  {
    id: 'client-econer',
    roleId: 'client',
    label: '에코너 광고주',
    aliases: ['econer', '에코너', '에코너 광고주'],
  },
  {
    id: 'client-damoae',
    roleId: 'client',
    label: '다모애 광고주',
    aliases: ['damoae', '다모애', '다모애 광고주'],
  },
  {
    id: 'client-seoripul',
    roleId: 'client',
    label: '서리풀 광고주',
    aliases: ['seoripul', '서리풀', '서리풀 막걸리'],
  },
  {
    id: 'client-coolbottle',
    roleId: 'client',
    label: '쿨보틀 광고주',
    aliases: ['coolbottle', '쿨보틀', '쿨보틀 광고주'],
  },
]

export function resolveDemoUser(currentUser) {
  const userName = normalize(currentUser?.name)
  const roleId = currentUser?.role?.id

  return (
    demoUsers.find(
      (user) =>
        user.roleId === roleId &&
        user.aliases.some((alias) => normalize(alias) === userName),
    ) || null
  )
}
