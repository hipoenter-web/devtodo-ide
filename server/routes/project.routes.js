import express from 'express'
import Client from '../models/Client.js'
import Project from '../models/Project.js'
import { requireAuth } from '../middleware/auth.js'
import {
  getMemoryProject,
  getMemoryProjectsForUser,
} from '../services/memoryStore.js'
import { canReadProject, serializeProject } from '../services/permissions.js'

const router = express.Router()

async function getClientMap() {
  const clients = await Client.find().lean()
  return new Map(clients.map((client) => [client.key, client]))
}

router.get('/', requireAuth, async (request, response, next) => {
  try {
    if (!request.app.locals.dbReady) {
      return response.json({
        projects: getMemoryProjectsForUser(request.user),
        mode: 'memory',
      })
    }

    const query =
      request.user.role === 'master'
        ? {}
        : { key: { $in: request.user.projectKeys || [] } }
    const [projects, clientMap] = await Promise.all([
      Project.find(query).sort({ createdAt: 1 }).lean(),
      getClientMap(),
    ])

    response.json({
      projects: projects.map((project) =>
        serializeProject(project, clientMap.get(project.clientKey)),
      ),
      mode: 'mongodb',
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:projectKey', requireAuth, async (request, response, next) => {
  try {
    const { projectKey } = request.params

    if (!canReadProject(request.user, projectKey)) {
      return response.status(403).json({ message: '프로젝트 접근 권한이 없습니다.' })
    }

    if (!request.app.locals.dbReady) {
      const project = getMemoryProject(projectKey)
      if (!project) return response.status(404).json({ message: '프로젝트가 없습니다.' })
      return response.json({ project, mode: 'memory' })
    }

    const project = await Project.findOne({ key: projectKey }).lean()
    if (!project) return response.status(404).json({ message: '프로젝트가 없습니다.' })

    const client = await Client.findOne({ key: project.clientKey }).lean()
    response.json({
      project: serializeProject(project, client),
      mode: 'mongodb',
    })
  } catch (error) {
    next(error)
  }
})

export default router
