import cors from 'cors'
import express from 'express'
import { createTodoRouter } from './routes/todos.js'

export function createApp(repository) {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_request, response) => {
    response.json({
      ok: true,
      storage: repository.storageLabel,
      time: new Date().toISOString(),
    })
  })

  app.use('/api/todos', createTodoRouter(repository))

  app.use((request, response) => {
    response.status(404).json({
      message: `${request.method} ${request.path} 경로를 찾을 수 없습니다.`,
    })
  })

  app.use((error, _request, response, _next) => {
    console.error(error)
    response.status(error.statusCode || 500).json({
      message: error.message || '서버 오류가 발생했습니다.',
    })
  })

  return app
}

