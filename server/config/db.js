import mongoose from 'mongoose'

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.warn('[server] MONGODB_URI가 없어 메모리 데모 모드로 실행합니다.')
    return false
  }

  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(uri)
    console.log('[server] MongoDB 연결 완료')
    return true
  } catch (error) {
    console.error('[server] MongoDB 연결 실패:', error.message)
    return false
  }
}
