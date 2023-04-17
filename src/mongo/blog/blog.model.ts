import mongoose from 'mongoose'
import { BlogSchema } from './blog.schema'

export const BlogModel = mongoose.model('blogs', BlogSchema)
