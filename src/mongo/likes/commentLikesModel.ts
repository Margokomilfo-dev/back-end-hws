import mongoose from 'mongoose'

import { CommentStatusType } from '../../repositores/likes-db-repository'
import { CommentLikesSchema } from './commentsLikesSchema'

export const CommentLikesModel = mongoose.model<CommentStatusType>(
    'comment-likes',
    CommentLikesSchema
)
