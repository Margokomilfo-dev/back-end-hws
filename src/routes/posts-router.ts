import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import {
    commentContentValidator,
    postBlogIdValidator,
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator,
} from '../assets/express-validator/field-validators'
import {
    idStringParamValidationMiddleware,
    postIdStringParamValidationMiddleware,
} from '../assets/express-validator/id-int-param-validation-middleware'
import { _customIsBlogValidator } from '../assets/express-validator/custom-validators'
import { basicAuthorizationMiddleware } from '../middlewares/basic-authorization-middleware'
import { postsService } from '../services/posts-service'
import { blogsService } from '../services/blogs-service'
import { paginationQueries } from '../assets/pagination'
import { commentsService } from '../services/comments-service'
import { bearerAuthorizationMiddleware } from '../middlewares/bearer-authorization-middleware'

export const postsRouter = Router({})

postsRouter.get('/', async (req: Request, res: Response) => {
    const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)

    const posts = await postsService.getPosts(pageNumber, pageSize, sortBy, sortDirection)
    const postsCount = await postsService.getPostsCount()

    const result = {
        pagesCount: Math.ceil(postsCount / pageSize),
        page: pageNumber,
        pageSize,
        totalCount: postsCount,
        items: posts,
    }
    res.status(CodeResponsesEnum.Success_200).send(result)
})

postsRouter.get(
    '/:postId/comments',
    postIdStringParamValidationMiddleware,
    async (req: Request, res: Response) => {
        const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)
        const postId = req.params.postId.toString().trim()
        const post = await postsService.getPostById(postId)
        if (!post) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        const comments = await commentsService.getCommentsByPostId(
            postId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        )
        const commentsCount = await commentsService.getCommentsCountByPostId(postId)

        const result = {
            pagesCount: Math.ceil(commentsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: commentsCount,
            items: comments,
        }
        res.status(CodeResponsesEnum.Success_200).send(result)
    }
)

postsRouter.post(
    '/',
    basicAuthorizationMiddleware,
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    postBlogIdValidator,
    _customIsBlogValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const blogId = req.body.blogId
        const blog = await blogsService.getBlogById(blogId)

        const newPost = await postsService.createPost(req.body, blog!.name)

        if (newPost) {
            res.status(CodeResponsesEnum.Created_201).send(newPost) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
)

postsRouter.post(
    '/:postId/comments',
    bearerAuthorizationMiddleware,
    postIdStringParamValidationMiddleware,
    commentContentValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const postId = req.params.postId.toString().trim()
        const content = req.body.content.toString().trim()
        const post = await postsService.getPostById(postId)
        if (!post) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }

        const newComment = await commentsService.createComment(
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
)

postsRouter.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const post = await postsService.getPostById(id)
    if (post) {
        res.status(CodeResponsesEnum.Success_200).send(post)
    } else {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
    }
})

postsRouter.put(
    '/:id',
    basicAuthorizationMiddleware,
    idStringParamValidationMiddleware,
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    postBlogIdValidator,
    _customIsBlogValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const id = req.params.id
        const isUpdated = await postsService.updatePost(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
postsRouter.delete(
    '/:id',
    basicAuthorizationMiddleware,
    idStringParamValidationMiddleware,
    async (req: Request, res: Response) => {
        const id = req.params.id
        const isDeleted = await postsService.deletePost(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
)
export type PostType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}
