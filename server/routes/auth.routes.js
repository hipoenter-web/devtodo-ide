import express from 'express'
import User from '../models/User.js'
import { findMemoryUser } from '../services/memoryStore.js'
import { rolePermissions, serializeUser } from '../services/permissions.js'
import { createToken, verifyPassword } from '../services/security.js'

const router = express.Router()

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFC')
}

async function findDatabaseUser({ name, roleId }) {
  const normalizedName = normalize(name)
  const normalizedRole = normalize(roleId)

  return (
    (await User.findOne({
      role: normalizedRole,
      $or: [{ username: normalizedName }, { aliases: normalizedName }],
    }).lean()) ||
    (await User.findOne({ role: normalizedRole }).lean()) ||
    (await User.findOne({ role: 'client' }).lean())
  )
}

router.post('/login', async (request, response, next) => {
  try {
    const { name, roleId, password } = request.body
    const user = request.app.locals.dbReady
      ? await findDatabaseUser({ name, roleId })
      : findMemoryUser({ name, roleId })

    if (!user) {
      return response.status(401).json({ message: '사용자를 찾지 못했습니다.' })
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return response.status(401).json({
        message: '비밀번호가 맞지 않습니다. 시연용 비밀번호는 demo123입니다.',
      })
    }

    const token = createToken(
      {
        userKey: user.key,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      request.app.locals.jwtSecret,
    )

    response.json({
      token,
      user: serializeUser(user),
      permissions: rolePermissions[user.role],
      mode: request.app.locals.dbReady ? 'mongodb' : 'memory',
    })
  } catch (error) {
    next(error)
  }
})

export default router
