import { ExtendedPostType, PostsRepository, PostType } from '../repositores/posts-db-repository'
import { inject, injectable } from 'inversify'
import { LikeInfoEnum, LikesRepository } from '../repositores/likes-db-repository'

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(LikesRepository) protected likesRepository: LikesRepository
    ) {}

    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        userId: string | null
    ): Promise<ExtendedPostType[]> {
        return this.postsRepository.getPosts(pageNumber, pageSize, sortBy, sortDirection, userId)
    }

    async getPostsCount(): Promise<number> {
        return this.postsRepository.getPostsCount()
    }

    async getPostById(id: string, userId: string | null): Promise<PostType | null> {
        return this.postsRepository.getPostById(id, userId)
    }

    async getPostsByBlogId(
        blogId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        userId: string | null
    ): Promise<PostType[]> {
        return this.postsRepository.getPostsByBlogId(
            blogId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            userId
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
        blogName: string,
        userId: string
    ): Promise<PostType | null> {
        const newPost = new PostType(
            new Date().getTime().toString(),
            body.title,
            body.shortDescription,
            body.content,
            body.blogId,
            blogName,
            new Date().toISOString(),
            {
                likesCount: 0,
                dislikesCount: 0,
                newestLikes: [],
            }
        )
        return this.postsRepository.createPost(newPost, userId)
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

    async updateLikeStatus(
        postId: string,
        likeStatus: LikeInfoEnum,
        userId: string,
        userLogin: string
    ): Promise<boolean> {
        const post = await this.postsRepository.getPostById(postId, userId)
        if (!post) return false
        let myLikeStatusData = await this.likesRepository.getPostStatus(userId, postId)

        if (!myLikeStatusData)
            myLikeStatusData = await this.likesRepository.createPostStatus({
                userId,
                status: LikeInfoEnum.None,
                postId,
                login: userLogin,
                createdAt: new Date().toISOString(),
            })
        await this.postsRepository.updateLikeStatus(post, myLikeStatusData!, likeStatus)
        return true
    }

    async deletePost(id: string): Promise<boolean> {
        return this.postsRepository.deletePost(id)
    }
    async deleteAll() {
        return this.postsRepository.deleteAll()
    }
}
//export const postsService = new PostsService()
