import { createFileTodoRepository } from './fileTodoRepository.js'
import { createMongoTodoRepository } from './mongoTodoRepository.js'

export async function createTodoRepository() {
  if (!process.env.MONGODB_URI) {
    return createFileTodoRepository()
  }

  try {
    return await createMongoTodoRepository(process.env.MONGODB_URI)
  } catch (error) {
    console.warn('MongoDB 연결 실패로 로컬 파일 저장소를 사용합니다.')
    console.warn(error.message)
    return createFileTodoRepository('Local JSON fallback')
  }
}

