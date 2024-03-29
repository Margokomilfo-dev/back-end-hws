import { BlogModel } from '../mongo/blog/blog.model'
import { injectable } from 'inversify'

@injectable()
export class BlogsRepository {
    async getBlogs(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        searchNameTerm: string | null
    ): Promise<BlogType[]> {
        let filter: any = {}
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: 'i' }
        }
        return BlogModel.find(filter, { _id: 0, __v: 0 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
    }
    async getBlogsCount(searchNameTerm: string | null): Promise<number> {
        let filter: any = {}
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: 'i' }
        }
        return BlogModel.countDocuments(filter)
    }
    async getBlogById(id: string): Promise<BlogType | null> {
        return BlogModel.findOne({ id }, { _id: 0, __v: 0 })
    }
    async createBlog(blog: BlogType): Promise<BlogType | null> {
        await BlogModel.insertMany([blog])
        return this.getBlogById(blog.id)
    }

    async updateBlog(
        id: string,
        body: {
            name: 'string'
            description: 'string'
            websiteUrl: 'string'
        }
    ): Promise<boolean> {
        const res = await BlogModel.updateOne({ id }, body)
        return res.matchedCount === 1
    }

    async deleteBlog(id: string): Promise<boolean> {
        const res = await BlogModel.deleteOne({ id })
        return res.deletedCount === 1
    }
    async deleteAll() {
        return BlogModel.deleteMany({})
    }
}

export class BlogType {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public websiteUrl: string,
        public isMembership: boolean,
        public createdAt: string
    ) {}
}
