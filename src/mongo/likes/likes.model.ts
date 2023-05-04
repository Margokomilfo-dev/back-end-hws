import mongoose from 'mongoose'
import { LikesSchema } from './likes.schema'
import { StatusType } from '../../repositores/likes-db-repository'

export const LikesModel = mongoose.model<StatusType>('likes', LikesSchema)
