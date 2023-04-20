import mongoose from 'mongoose'
import { CommentsSchema } from './comments.schema'

export const CommentsModel = mongoose.model('comments', CommentsSchema)
