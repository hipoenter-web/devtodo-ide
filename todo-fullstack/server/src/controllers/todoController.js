function normalizeTitle(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function badRequest(message) {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

function notFound(message) {
  const error = new Error(message)
  error.statusCode = 404
  return error
}

export const getTodos = (repository) => async (_request, response, next) => {
  try {
    const todos = await repository.findAll()
    response.json({
      todos,
      storage: repository.storageLabel,
    })
  } catch (error) {
    next(error)
  }
}

export const createTodo = (repository) => async (request, response, next) => {
  try {
    const title = normalizeTitle(request.body.title)

    if (!title) throw badRequest('할 일 내용을 입력하세요.')

    const todo = await repository.create({ title })

    response.status(201).json({ todo })
  } catch (error) {
    next(error)
  }
}

export const updateTodo = (repository) => async (request, response, next) => {
  try {
    const updates = {}

    if (Object.hasOwn(request.body, 'title')) {
      const title = normalizeTitle(request.body.title)
      if (!title) throw badRequest('수정할 할 일 내용을 입력하세요.')
      updates.title = title
    }

    if (Object.hasOwn(request.body, 'completed')) {
      updates.completed = Boolean(request.body.completed)
    }

    if (Object.keys(updates).length === 0) {
      throw badRequest('수정할 항목이 없습니다.')
    }

    const todo = await repository.update(request.params.id, updates)

    if (!todo) throw notFound('해당 할 일을 찾을 수 없습니다.')

    response.json({ todo })
  } catch (error) {
    next(error)
  }
}

export const deleteTodo = (repository) => async (request, response, next) => {
  try {
    const deleted = await repository.remove(request.params.id)

    if (!deleted) throw notFound('삭제할 할 일을 찾을 수 없습니다.')

    response.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

