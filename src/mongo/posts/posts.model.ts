import mongoose from 'mongoose'
import { PostsSchema } from './posts.schema'

export const PostsModel = mongoose.model('posts', PostsSchema)
