import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['master', 'team', 'client'],
      required: true,
      index: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    projectKeys: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('User', userSchema)
