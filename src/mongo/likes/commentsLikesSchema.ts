import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { CommentStatusType } from '../../repositores/likes-db-repository'

export const CommentLikesSchema = new mongoose.Schema<WithId<CommentStatusType>>({
    userId: { type: String, require: true },
    commentId: { type: String, require: true },
    status: { type: String, require: true },
})
