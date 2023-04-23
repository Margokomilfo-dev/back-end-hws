import mongoose from 'mongoose'
import { BlogSchema } from './blog.schema'
import { BlogType } from '../../repositores/blogs-db-repository'

export const BlogModel = mongoose.model<BlogType>('blogs', BlogSchema)
