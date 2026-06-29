import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    clientKey: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    folderName: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      default: 'design-gallery',
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'archived'],
      default: 'review',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Project', projectSchema)
