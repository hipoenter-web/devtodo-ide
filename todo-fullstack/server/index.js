import 'dotenv/config'
import { createApp } from './src/app.js'
import { createTodoRepository } from './src/repositories/createTodoRepository.js'

const port = Number(process.env.PORT || 4000)

async function startServer() {
  const repository = await createTodoRepository()
  const app = createApp(repository)

  app.listen(port, () => {
    console.log(`DevTodo API running on http://127.0.0.1:${port}`)
    console.log(`Storage: ${repository.storageLabel}`)
  })
}

startServer().catch((error) => {
  console.error('서버 실행 중 오류가 발생했습니다.')
  console.error(error)
  process.exit(1)
})

