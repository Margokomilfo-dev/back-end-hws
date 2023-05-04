import mongoose from 'mongoose'
import { CommentsSchema } from './comments.schema'
import { CommentType } from '../../repositores/comments-db-repository'

export const CommentsModel = mongoose.model<CommentType>('comments', CommentsSchema)
