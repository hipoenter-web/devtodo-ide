import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    projectKey: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'Reviewer',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
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

export default mongoose.model('Comment', commentSchema)
