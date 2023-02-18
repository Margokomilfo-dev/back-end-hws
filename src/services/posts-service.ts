import { PostType } from '../routes/posts-router'
import { postsRepository } from '../repositores/posts-db-repository'

export const postsService = {
    async getPosts(): Promise<PostType[]> {
        return postsRepository.getPosts()
    },
    async getPostById(id: string): Promise<PostType | null> {
        return postsRepository.getPostById(id)
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
        return postsRepository.createPost(newPost)
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
        return postsRepository.updatePost(id, body)
    },

    async deletePost(id: string): Promise<boolean> {
        return postsRepository.deletePost(id)
    },
    async deleteAll() {
        return postsRepository.deleteAll()
    },
}
