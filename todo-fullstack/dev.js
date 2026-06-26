import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')

const serverPort = process.env.PORT || '4000'
const clientPort = process.env.CLIENT_PORT || '5175'
const apiUrl = process.env.VITE_API_URL || `http://127.0.0.1:${serverPort}/api`

const sharedEnv = {
  ...process.env,
  PORT: serverPort,
  CLIENT_PORT: clientPort,
  VITE_API_URL: apiUrl,
}

const processes = [
  spawn(process.execPath, ['todo-fullstack/server/index.js'], {
    cwd: rootDir,
    env: sharedEnv,
    stdio: 'inherit',
  }),
  spawn(
    process.execPath,
    [viteBin, 'todo-fullstack/client', '--host', '127.0.0.1', '--port', clientPort],
    {
      cwd: rootDir,
      env: sharedEnv,
      stdio: 'inherit',
    },
  ),
]

const stopAll = () => {
  for (const child of processes) {
    if (!child.killed) child.kill('SIGTERM')
  }
}

process.on('SIGINT', () => {
  stopAll()
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopAll()
  process.exit(0)
})

