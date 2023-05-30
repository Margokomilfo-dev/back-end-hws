import { PostsService } from '../services/posts-service'
import { CommentsService } from '../services/comments-service'
import { BlogsService } from '../services/blogs-service'
import { Request, Response } from 'express'
import { paginationQueries } from '../assets/pagination'
import { CodeResponsesEnum } from '../types'
import { getBearerUserIdFromHeaders } from '../assets/get-bearer-user-id-from-headers'
import { inject, injectable } from 'inversify'
import { JwtService } from '../services/jwt-service'

@injectable()
export class PostsController {
    constructor(
        @inject(PostsService) protected postsService: PostsService,
        @inject(CommentsService) protected commentsService: CommentsService,
        @inject(BlogsService) protected blogService: BlogsService,
        @inject(JwtService) protected jwtService: JwtService
    ) {}
    async getPosts(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)
        let userId = null
        const user = await getBearerUserIdFromHeaders(req.headers.authorization)
        if (user) {
            userId = user.userId
        }
        const posts = await this.postsService.getPosts(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            userId
        )
        const postsCount = await this.postsService.getPostsCount()
        const result = {
            pagesCount: Math.ceil(postsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postsCount,
            items: posts,
        }
        res.status(CodeResponsesEnum.Success_200).send(result)
    }

    async getCommentsByPostId(req: Request, res: Response) {
        let userId = null
        const user = await getBearerUserIdFromHeaders(req.headers.authorization)
        if (user) {
            userId = user.userId
        }
        const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)
        const postId = req.params.postId.toString().trim()
        const post = await this.postsService.getPostById(postId, userId)

        if (!post) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        const comments = await this.commentsService.getCommentsByPostId(
            userId,
            postId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        )
        const commentsCount = await this.commentsService.getCommentsCountByPostId(postId)

        const result = {
            pagesCount: Math.ceil(commentsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: commentsCount,
            items: comments,
        }
        res.status(CodeResponsesEnum.Success_200).send(result)
    }

    async createPost(req: Request, res: Response) {
        const blogId = req.body.blogId
        const blog = await this.blogService.getBlogById(blogId)

        const userId = req.userId
        const newPost = await this.postsService.createPost(req.body, blog!.name, userId!)

        if (newPost) {
            res.status(CodeResponsesEnum.Created_201).send(newPost) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }

    async createCommentByPostId(req: Request, res: Response) {
        let userId = null
        const user = await getBearerUserIdFromHeaders(req.headers.authorization)
        if (user) {
            userId = user.userId
        }
        const postId = req.params.postId.toString().trim()
        const content = req.body.content.toString().trim()
        const post = await this.postsService.getPostById(postId, userId)
        if (!post) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }

        const newComment = await this.commentsService.createComment(
            content,
            req.userId!,
            req.userLogin!,
            postId
        )
        if (newComment) {
            res.status(CodeResponsesEnum.Created_201).send(newComment) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }

    async getPost(req: Request, res: Response) {
        const id = req.params.id
        let userId = null
        const user = await getBearerUserIdFromHeaders(req.headers.authorization)
        if (user) {
            userId = user.userId
        }
        const post = await this.postsService.getPostById(id, userId)
        if (post) {
            res.status(CodeResponsesEnum.Success_200).send(post)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }

    async updateComment(req: Request, res: Response) {
        const id = req.params.id
        const isUpdated = await this.postsService.updatePost(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }

    async updateLikeStatus(req: Request, res: Response) {
        const id = req.params.id
        const likeStatus = req.body.likeStatus
        let userId = null
        let userLogin = null
        const user = await getBearerUserIdFromHeaders(req.headers.authorization)
        if (user) {
            userId = user.userId
            userLogin = user.userLogin
        }
        const isUpdated = await this.postsService.updateLikeStatus(
            id,
            likeStatus,
            userId!,
            userLogin!
        )
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }

    async deleteComment(req: Request, res: Response) {
        const id = req.params.id
        const isDeleted = await this.postsService.deletePost(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}
