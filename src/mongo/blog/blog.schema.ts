import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { BlogType } from '../../repositores/blogs-db-repository'

export const BlogSchema = new mongoose.Schema<WithId<BlogType>>({
    id: { type: String, require: true },
    name: { type: String, require: true },
    description: { type: String, require: true },
    websiteUrl: { type: String, require: true },
    isMembership: { type: 'Boolean', default: false },
    createdAt: { type: String, require: true },
})
