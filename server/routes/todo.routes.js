import express from 'express'
import Todo from '../models/Todo.js'
import { requireAuth } from '../middleware/auth.js'
import {
  createMemoryTodo,
  deleteMemoryTodo,
  listMemoryTodos,
  updateMemoryTodo,
} from '../services/memoryStore.js'
import {
  canDeleteTasks,
  canManageTasks,
  canReadProject,
  serializeTodo,
} from '../services/permissions.js'

const router = express.Router({ mergeParams: true })

function requireProjectAccess(request, response) {
  if (!canReadProject(request.user, request.params.projectKey)) {
    response.status(403).json({ message: '프로젝트 접근 권한이 없습니다.' })
    return false
  }

  return true
}

router.get('/', requireAuth, async (request, response, next) => {
  try {
    if (!requireProjectAccess(request, response)) return

    if (!request.app.locals.dbReady) {
      return response.json({
        todos: listMemoryTodos(request.params.projectKey),
        mode: 'memory',
      })
    }

    const todos = await Todo.find({ projectKey: request.params.projectKey })
      .sort({ createdAt: -1 })
      .lean()

    response.json({
      todos: todos.map(serializeTodo),
      mode: 'mongodb',
    })
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth, async (request, response, next) => {
  try {
    if (!requireProjectAccess(request, response)) return
    if (!canManageTasks(request.user)) {
      return response.status(403).json({ message: 'Todo 관리 권한이 없습니다.' })
    }

    const text = String(request.body.text || '').trim()
    if (!text) return response.status(400).json({ message: 'Todo 내용을 입력하세요.' })

    if (!request.app.locals.dbReady) {
      return response.status(201).json({
        todo: createMemoryTodo({ projectKey: request.params.projectKey, text }),
        mode: 'memory',
      })
    }

    const todo = await Todo.create({
      projectKey: request.params.projectKey,
      text,
      createdBy: request.user.key,
    })

    response.status(201).json({
      todo: serializeTodo(todo),
      mode: 'mongodb',
    })
  } catch (error) {
    next(error)
  }
})

router.patch('/:todoId', requireAuth, async (request, response, next) => {
  try {
    if (!requireProjectAccess(request, response)) return
    if (!canManageTasks(request.user)) {
      return response.status(403).json({ message: 'Todo 관리 권한이 없습니다.' })
    }

    const patch = {}
    if (typeof request.body.text === 'string') patch.text = request.body.text.trim()
    if (typeof request.body.completed === 'boolean') {
      patch.completed = request.body.completed
    }

    if (!request.app.locals.dbReady) {
      const todo = updateMemoryTodo({
        projectKey: request.params.projectKey,
        todoId: request.params.todoId,
        patch,
      })
      if (!todo) return response.status(404).json({ message: 'Todo가 없습니다.' })
      return response.json({ todo, mode: 'memory' })
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: request.params.todoId, projectKey: request.params.projectKey },
      patch,
      { new: true },
    )

    if (!todo) return response.status(404).json({ message: 'Todo가 없습니다.' })

    response.json({
      todo: serializeTodo(todo),
      mode: 'mongodb',
    })
  } catch (error) {
    next(error)
  }
})

router.delete('/:todoId', requireAuth, async (request, response, next) => {
  try {
    if (!requireProjectAccess(request, response)) return
    if (!canDeleteTasks(request.user)) {
      return response.status(403).json({ message: 'Todo 삭제 권한이 없습니다.' })
    }

    if (!request.app.locals.dbReady) {
      const deleted = deleteMemoryTodo({
        projectKey: request.params.projectKey,
        todoId: request.params.todoId,
      })
      if (!deleted) return response.status(404).json({ message: 'Todo가 없습니다.' })
      return response.status(204).end()
    }

    const result = await Todo.deleteOne({
      _id: request.params.todoId,
      projectKey: request.params.projectKey,
    })

    if (result.deletedCount === 0) {
      return response.status(404).json({ message: 'Todo가 없습니다.' })
    }

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
