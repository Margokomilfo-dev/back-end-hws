import { BlogType } from '../routes/blogs-router'
import { blogsCollection } from './db'

export const blogsRepository = {
    async getBlogs(): Promise<BlogType[]> {
        return blogsCollection.find({}).toArray()
    },
    async getBlogById(id: string): Promise<BlogType | null> {
        const blog = await blogsCollection.findOne({ id })
        if (blog) {
            return blog
        } else {
            return null
        }
    },
    async createBlog(
        name: string,
        description: string,
        websiteUrl: string
    ): Promise<BlogType | null> {
        const blog = {
            id: new Date().getTime().toString(),
            description,
            name,
            websiteUrl,
            isMembership: false,
        }
        await blogsCollection.insertOne(blog)
        return blog
    },

    async updateBlog(
        id: string,
        body: {
            name: 'string'
            description: 'string'
            websiteUrl: 'string'
        }
    ): Promise<boolean> {
        const res = await blogsCollection.updateOne(
            { id },
            { $set: { ...body } }
        )
        return res.matchedCount === 1
    },

    async deleteBlog(id: string): Promise<boolean> {
        const res = await blogsCollection.deleteOne({ id })
        return res.deletedCount === 1
    },
    async deleteAll() {
        return blogsCollection.deleteMany({})
    },
}
