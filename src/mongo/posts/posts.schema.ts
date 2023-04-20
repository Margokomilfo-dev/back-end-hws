import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { PostType } from '../../routes/posts-router'

export const PostsSchema = new mongoose.Schema<WithId<PostType>>({
    id: { type: String, require: true },
    title: { type: String, require: true },
    shortDescription: { type: String, require: true },
    content: { type: String, require: true },
    blogId: { type: String, require: true },
    blogName: { type: String, require: true },
    createdAt: { type: String, require: true },
})
