import { BlogType } from '../routes/blogs-router'
import { blogsCollection } from '../mongo/db'

export const blogsRepository = {
    async getBlogs(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        searchNameTerm: string | null
    ): Promise<BlogType[]> {
        let filter: any = {}
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: '$i' }
        }
        return blogsCollection
            .find(filter, { projection: { _id: 0 } })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .toArray()
    },
    async getBlogsCount(): Promise<number> {
        const res_ = await blogsCollection.find({}).toArray()
        return res_.length
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
