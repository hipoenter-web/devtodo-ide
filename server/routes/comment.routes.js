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

function normalizeKeyword(value) {
  return String(value || '')
    .trim()
    .slice(0, 80)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function findComments({ projectKey, keyword }) {
  if (!keyword) {
    return Comment.find({ projectKey }).sort({ createdAt: 1 }).lean()
  }

  try {
    const textMatches = await Comment.find(
      {
        projectKey,
        $text: { $search: keyword },
      },
      {
        score: { $meta: 'textScore' },
      },
    )
      .sort({ score: { $meta: 'textScore' }, createdAt: 1 })
      .lean()

    if (textMatches.length > 0) return textMatches
  } catch {
    // Text index가 아직 생성되지 않았거나 검색어가 인덱스에 맞지 않으면
    // 정규식 검색으로 fallback합니다.
  }

  const keywordPattern = new RegExp(escapeRegExp(keyword), 'i')

  return Comment.find({
    projectKey,
    $or: [
      { message: keywordPattern },
      { author: keywordPattern },
      { role: keywordPattern },
    ],
  })
    .sort({ createdAt: 1 })
    .lean()
}

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
    const keyword = normalizeKeyword(request.query.keyword || request.query.q)

    if (!request.app.locals.dbReady) {
      return response.json({
        comments: listMemoryComments(request.params.projectKey, keyword),
        keyword,
        mode: 'memory',
      })
    }

    const comments = await findComments({
      projectKey: request.params.projectKey,
      keyword,
    })

    response.json({
      comments: comments.map(serializeComment),
      keyword,
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
