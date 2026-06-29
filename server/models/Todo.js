import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema(
  {
    projectKey: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Todo', todoSchema)
