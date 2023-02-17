import { PostType } from '../routes/posts-router'
import { postsCollection } from './db'

export const postsRepository = {
    async getPosts(): Promise<PostType[]> {
        return postsCollection.find({}, { projection: { _id: 0 } }).toArray()
    },
    async getPostById(id: string): Promise<PostType | null> {
        return postsCollection.findOne({ id }, { projection: { _id: 0 } })
    },
    async createPost(
        body: {
            title: string
            content: string
            blogId: string
            shortDescription: string
        },
        blogName: string
    ): Promise<PostType | null> {
        const newPost: PostType = {
            id: new Date().getTime().toString(),
            title: body.title,
            content: body.content,
            blogId: body.blogId,
            shortDescription: body.shortDescription,
            createdAt: new Date().toISOString(),
            blogName,
        }
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
