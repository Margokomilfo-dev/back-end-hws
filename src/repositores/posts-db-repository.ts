import { PostType } from '../routes/posts-router'
import { postsCollection } from '../mongo/db'

export const postsRepository = {
    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<PostType[]> {
        return postsCollection
            .find({}, { projection: { _id: 0 } })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? -1 : 1 })
            .toArray()
    },
    async getPostsCount(): Promise<number> {
        const res = await postsCollection.find({}).toArray()
        return res.length
    },
    async getPostById(id: string): Promise<PostType | null> {
        return postsCollection.findOne({ id }, { projection: { _id: 0 } })
    },
    async getPostsByBlogId(
        blogId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<Array<PostType>> {
        return postsCollection
            .find({ blogId })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? -1 : 1 })
            .toArray()
    },
    async getPostsCountByBlogId(blogId: string): Promise<number> {
        const res = await postsCollection.find({ blogId }).toArray()
        return res.length
    },
    async createPost(newPost: PostType): Promise<PostType | null> {
        await postsCollection.insertOne(newPost)
        return this.getPostById(newPost.id)
    },
    async updatePost(
        id: string,
        body: {
            title: string
            content: string
            blogId: string
            shortDescription: string
        }
    ): Promise<boolean> {
        const ourPost = await postsCollection.updateOne(
            { id },
            { $set: { ...body } }
        )
        return ourPost.matchedCount === 1
    },

    async deletePost(id: string): Promise<boolean> {
        const res = await postsCollection.deleteOne({ id })
        return res.deletedCount === 1
    },
    async deleteAll() {
        return postsCollection.deleteMany({})
    },
}
