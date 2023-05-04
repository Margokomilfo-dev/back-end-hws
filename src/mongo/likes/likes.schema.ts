import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { StatusType } from '../../repositores/likes-db-repository'

export const LikesSchema = new mongoose.Schema<WithId<StatusType>>({
    userId: { type: String, require: true },
    commentId: { type: String, require: true },
    status: { type: String, require: true },
})
