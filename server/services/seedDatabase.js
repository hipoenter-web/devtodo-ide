import Client from '../models/Client.js'
import Comment from '../models/Comment.js'
import Project from '../models/Project.js'
import Todo from '../models/Todo.js'
import User from '../models/User.js'
import {
  clients,
  projects,
  starterComments,
  starterTodos,
  users,
} from '../data/seedData.js'

export async function seedDatabase() {
  const clientCount = await Client.countDocuments()
  if (clientCount > 0) return

  await Client.insertMany(clients)
  await Project.insertMany(projects)
  await User.insertMany(users)

  const todoRows = projects.flatMap((project) =>
    starterTodos.map((todo) => ({
      ...todo,
      projectKey: project.key,
      createdBy: 'system',
    })),
  )
  const commentRows = projects.flatMap((project) =>
    starterComments.map((comment) => ({
      ...comment,
      projectKey: project.key,
      createdBy: 'system',
    })),
  )

  await Todo.insertMany(todoRows)
  await Comment.insertMany(commentRows)

  console.log('[server] 데모 데이터 시드 완료')
}
