import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { PostType } from '../../repositores/posts-db-repository'

export const PostsSchema = new mongoose.Schema<WithId<PostType>>({
    id: { type: String, require: true },
    title: { type: String, require: true },
    shortDescription: { type: String, require: true },
    content: { type: String, require: true },
    blogId: { type: String, require: true },
    blogName: { type: String, require: true },
    createdAt: { type: String, require: true },
    extendedLikesInfo: {
        likesCount: { type: Number, default: 0 },
        dislikesCount: { type: Number, default: 0 },
        newestLikes: [
            {
                addedAt: { type: String, require: true },
                userId: { type: String, require: true },
                login: { type: String, require: true },
            },
        ],
    },
})
