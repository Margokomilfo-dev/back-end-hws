import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { LikeInfoEnum, PostStatusType } from '../../repositores/likes-db-repository'

export const PostLikesSchema = new mongoose.Schema<WithId<PostStatusType>>({
    login: { type: String, require: true },
    createdAt: { type: String, require: true },
    userId: { type: String, require: true },
    postId: { type: String, require: true },
    status: { type: String, require: true },
})
