import { PostsRepository, PostType } from '../repositores/posts-db-repository'

export class PostsService {
    postsRepository: PostsRepository
    constructor() {
        this.postsRepository = new PostsRepository()
    }

    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<PostType[]> {
        return this.postsRepository.getPosts(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        )
    }

    async getPostsCount(): Promise<number> {
        return this.postsRepository.getPostsCount()
    }

    async getPostById(id: string): Promise<PostType | null> {
        return this.postsRepository.getPostById(id)
    }

    async getPostsByBlogId(
        blogId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<PostType[]> {
        return this.postsRepository.getPostsByBlogId(
            blogId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        )
    }

    async getPostsCountByBlogId(blogId: string): Promise<number> {
        return this.postsRepository.getPostsCountByBlogId(blogId)
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

        return this.postsRepository.createPost(newPost)
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
        return this.postsRepository.updatePost(id, body)
    }

    async deletePost(id: string): Promise<boolean> {
        return this.postsRepository.deletePost(id)
    }
    async deleteAll() {
        return this.postsRepository.deleteAll()
    }
}
//export const postsService = new PostsService()
