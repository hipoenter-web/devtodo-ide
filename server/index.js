import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDatabase } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import commentRoutes from './routes/comment.routes.js'
import projectRoutes from './routes/project.routes.js'
import todoRoutes from './routes/todo.routes.js'
import { seedDatabase } from './services/seedDatabase.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = process.env.PORT || 4000

app.locals.jwtSecret =
  process.env.JWT_SECRET || 'devtodo-local-development-secret'
app.locals.dbReady = false

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    db: app.locals.dbReady ? 'mongodb' : 'memory',
    service: 'DevTodo IDE API',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectKey/todos', todoRoutes)
app.use('/api/projects/:projectKey/comments', commentRoutes)

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use((error, _request, response, _next) => {
  console.error('[server] request error:', error)
  response.status(error.status || 500).json({
    message: error.message || '서버 오류가 발생했습니다.',
  })
})

async function startServer() {
  app.locals.dbReady = await connectDatabase()

  if (app.locals.dbReady) {
    await seedDatabase()
  }

  const server = app.listen(port, () => {
    console.log(`[server] http://localhost:${port} 실행 중`)
  })

  server.on('error', (error) => {
    console.error('[server] 서버 시작 실패:', error.message)
    process.exit(1)
  })
}

startServer()
