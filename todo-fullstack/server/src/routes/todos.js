import { Router } from 'express'
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from '../controllers/todoController.js'

export function createTodoRouter(repository) {
  const router = Router()

  router.get('/', getTodos(repository))
  router.post('/', createTodo(repository))
  router.patch('/:id', updateTodo(repository))
  router.delete('/:id', deleteTodo(repository))

  return router
}

