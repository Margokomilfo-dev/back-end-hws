import { BlogType } from '../routes/blogs-router'
import { blogsCollection } from '../mongo/db'

export const blogsRepository = {
    async getBlogs(): Promise<BlogType[]> {
        return blogsCollection.find({}, { projection: { _id: 0 } }).toArray()
    },
    async getBlogById(id: string): Promise<BlogType | null> {
        return blogsCollection.findOne({ id }, { projection: { _id: 0 } })
    },
    async createBlog(blog: BlogType): Promise<BlogType | null> {
        await blogsCollection.insertOne(blog)
        return this.getBlogById(blog.id)
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
