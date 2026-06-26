import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

todoSchema.set('toJSON', {
  transform(_document, returnedObject) {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
  },
})

export const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema)

