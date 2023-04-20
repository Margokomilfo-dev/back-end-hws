import mongoose from 'mongoose'
import { BlogSchema } from './blog.schema'
import { BlogType } from '../../routes/blogs-router'

export const BlogModel = mongoose.model<BlogType>('blogs', BlogSchema)
