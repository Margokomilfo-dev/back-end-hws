import { PostsModel } from '../mongo/posts/posts.model'
import { injectable } from 'inversify'

@injectable()
export class PostsRepository {
    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<PostType[]> {
        return PostsModel.find({}, { _id: 0, __v: 0 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .lean()
    }
    async getPostsCount(): Promise<number> {
        return PostsModel.countDocuments({})
    }
    async getPostById(id: string): Promise<PostType | null> {
        return PostsModel.findOne({ id }, { _id: 0, __v: 0 })
    }
    async getPostsByBlogId(
        blogId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<Array<PostType>> {
        return PostsModel.find({ blogId }, { _id: 0, __v: 0 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .lean()
    }
    async getPostsCountByBlogId(blogId: string): Promise<number> {
        return PostsModel.countDocuments({ blogId })
    }
    async createPost(newPost: PostType): Promise<PostType | null> {
        await PostsModel.insertMany(newPost)
        return this.getPostById(newPost.id)
    }
    async updatePost(
        id: string,
        body: {
            title: string
            content: string
            blogId: string
            shortDescription: string
        }
    ): Promise<boolean> {
        const ourPost = await PostsModel.updateOne({ id }, body)
        return ourPost.matchedCount === 1
    }

    async deletePost(id: string): Promise<boolean> {
        const res = await PostsModel.deleteOne({ id })
        return res.deletedCount === 1
    }
    async deleteAll() {
        return PostsModel.deleteMany({})
    }
}

export class PostType {
    constructor(
        public id: string,
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
        public createdAt: string
    ) {}
}
