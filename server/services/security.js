import crypto from 'node:crypto'

const TOKEN_HEADER = { alg: 'HS256', typ: 'JWT' }
const TOKEN_TTL_SECONDS = 60 * 60 * 12

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url')
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto
    .pbkdf2Sync(String(password), salt, 120_000, 32, 'sha256')
    .toString('hex')

  return `${salt}:${hash}`
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false

  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) return false

  const nextHash = hashPassword(password, salt).split(':')[1]
  if (Buffer.byteLength(hash) !== Buffer.byteLength(nextHash)) return false

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(nextHash))
}

export function createToken(payload, secret) {
  const now = Math.floor(Date.now() / 1000)
  const body = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  }
  const encodedHeader = base64UrlEncode(TOKEN_HEADER)
  const encodedBody = base64UrlEncode(body)
  const signature = sign(`${encodedHeader}.${encodedBody}`, secret)

  return `${encodedHeader}.${encodedBody}.${signature}`
}

export function verifyToken(token, secret) {
  const [encodedHeader, encodedBody, signature] = String(token || '').split('.')

  if (!encodedHeader || !encodedBody || !signature) return null

  const expectedSignature = sign(`${encodedHeader}.${encodedBody}`, secret)
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expectedSignature)) {
    return null
  }

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    return null
  }

  const payload = JSON.parse(Buffer.from(encodedBody, 'base64url').toString())
  const now = Math.floor(Date.now() / 1000)

  if (payload.exp && payload.exp < now) return null

  return payload
}
