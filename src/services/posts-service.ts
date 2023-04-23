import { postsRepository, PostType } from '../repositores/posts-db-repository'

class PostsService {
    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<PostType[]> {
        return postsRepository.getPosts(pageNumber, pageSize, sortBy, sortDirection)
    }

    async getPostsCount(): Promise<number> {
        return postsRepository.getPostsCount()
    }

    async getPostById(id: string): Promise<PostType | null> {
        return postsRepository.getPostById(id)
    }

    async getPostsByBlogId(
        blogId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<PostType[]> {
        return postsRepository.getPostsByBlogId(blogId, pageNumber, pageSize, sortBy, sortDirection)
    }

    async getPostsCountByBlogId(blogId: string): Promise<number> {
        return postsRepository.getPostsCountByBlogId(blogId)
    }

    async createPost(
        body: {
            title: string
            content: string
            blogId: string
            shortDescription: string
        },
        blogName: string
    ): Promise<PostType | null> {
        const newPost = new PostType(
            new Date().getTime().toString(),
            body.title,
            body.shortDescription,
            body.content,
            body.blogId,
            blogName,
            new Date().toISOString()
        )

        return postsRepository.createPost(newPost)
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
        return postsRepository.updatePost(id, body)
    }

    async deletePost(id: string): Promise<boolean> {
        return postsRepository.deletePost(id)
    }
    async deleteAll() {
        return postsRepository.deleteAll()
    }
}
export const postsService = new PostsService()
