import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { CommentType } from '../../services/comments-service'

export const CommentsSchema = new mongoose.Schema<WithId<CommentType>>({
    id: { type: String, require: true },
    content: { type: String, require: true },
    createdAt: { type: String, require: true },
    postId: { type: String, require: true },
    commentatorInfo: {
        userId: { type: String, required: true },
        userLogin: { type: String, required: true },
    },
})
