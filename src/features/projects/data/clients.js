export const clients = [
  {
    id: 'econer',
    name: '에코너',
    manager: '에코너 광고주',
  },
  {
    id: 'damoae',
    name: '다모애',
    manager: '다모애 광고주',
  },
  {
    id: 'seoripul',
    name: '서리풀 막걸리',
    manager: '서리풀 광고주',
  },
  {
    id: 'coolbottle',
    name: '쿨보틀',
    manager: '쿨보틀 광고주',
  },
]

export function findClient(clientId) {
  return clients.find((client) => client.id === clientId) || null
}
