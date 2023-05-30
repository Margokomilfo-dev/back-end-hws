import mongoose from 'mongoose'
import { PostStatusType } from '../../repositores/likes-db-repository'
import { PostLikesSchema } from './postsLikesSchema'

export const PostLikesModel = mongoose.model<PostStatusType>('post-likes', PostLikesSchema)
