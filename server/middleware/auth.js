import User from '../models/User.js'
import { findMemoryUser } from '../services/memoryStore.js'
import { verifyToken } from '../services/security.js'

export async function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null

  if (!token) {
    return response.status(401).json({ message: '로그인이 필요합니다.' })
  }

  const payload = verifyToken(token, request.app.locals.jwtSecret)
  if (!payload) {
    return response.status(401).json({ message: '로그인이 만료되었습니다.' })
  }

  let user = null

  if (request.app.locals.dbReady) {
    user = await User.findOne({ key: payload.userKey }).lean()
  } else {
    user = findMemoryUser({ name: payload.username, roleId: payload.role })
  }

  if (!user) {
    return response.status(401).json({ message: '사용자를 찾지 못했습니다.' })
  }

  request.user = user
  next()
}
