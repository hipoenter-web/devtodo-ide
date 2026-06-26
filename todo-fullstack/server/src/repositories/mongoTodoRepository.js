import mongoose from 'mongoose'
import { Todo } from '../models/Todo.js'

export async function createMongoTodoRepository(mongodbUri) {
  await mongoose.connect(mongodbUri)

  return {
    storageLabel: 'MongoDB',

    async findAll() {
      const todos = await Todo.find().sort({ createdAt: -1 })
      return todos.map((todo) => todo.toJSON())
    },

    async create({ title }) {
      const todo = await Todo.create({ title })
      return todo.toJSON()
    },

    async update(id, updates) {
      const todo = await Todo.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      })

      return todo ? todo.toJSON() : null
    },

    async remove(id) {
      const result = await Todo.findByIdAndDelete(id)
      return Boolean(result)
    },
  }
}
