import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import {
    postBlogIdValidator,
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator,
} from '../assets/express-validator/field-validators'
import { idStringParamValidationMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { _customIsBlogValidator } from '../assets/express-validator/custom-validators'
import { authorizationMiddleware } from '../assets/middlewares/authorization-middleware'
import { postsService } from '../services/posts-service'
import { blogsService } from '../services/blogs-service'

export const postsRouter = Router({})

postsRouter.get('/', async (req: Request, res: Response) => {
    let pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1
    let pageSize = req.query.pageSize ? +req.query.pageSize : 10
    let sortBy = req.query.sortBy ? req.query.sortBy.toString() : 'createdAt'
    let sortDirection =
        req.query.sortDirection && req.query.sortDirection.toString() === 'asc'
            ? 'asc'
            : 'desc'

    const posts = await postsService.getPosts(
        pageNumber,
        pageSize,
        sortBy,
        sortDirection
    )
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

postsRouter.post(
    '/',
    authorizationMiddleware,
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
    authorizationMiddleware,
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
    authorizationMiddleware,
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
