import express from 'express'
import Comment from '../models/Comment.js'
import { requireAuth } from '../middleware/auth.js'
import {
  createMemoryComment,
  listMemoryComments,
} from '../services/memoryStore.js'
import {
  canComment,
  canReadProject,
  serializeComment,
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
        comments: listMemoryComments(request.params.projectKey),
        mode: 'memory',
      })
    }

    const comments = await Comment.find({ projectKey: request.params.projectKey })
      .sort({ createdAt: 1 })
      .lean()

    response.json({
      comments: comments.map(serializeComment),
      mode: 'mongodb',
    })
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth, async (request, response, next) => {
  try {
    if (!requireProjectAccess(request, response)) return
    if (!canComment(request.user)) {
      return response.status(403).json({ message: '코멘트 작성 권한이 없습니다.' })
    }

    const message = String(request.body.message || '').trim()
    if (!message) return response.status(400).json({ message: '코멘트를 입력하세요.' })

    if (!request.app.locals.dbReady) {
      return response.status(201).json({
        comment: createMemoryComment({
          projectKey: request.params.projectKey,
          author: request.user.name,
          role: request.user.role,
          message,
          userKey: request.user.key,
        }),
        mode: 'memory',
      })
    }

    const comment = await Comment.create({
      projectKey: request.params.projectKey,
      author: request.user.name,
      role: request.user.role,
      message,
      createdBy: request.user.key,
    })

    response.status(201).json({
      comment: serializeComment(comment),
      mode: 'mongodb',
    })
  } catch (error) {
    next(error)
  }
})

export default router
