import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
// import { postsRepository } from '../repositores/posts-repository'
// import { blogsRepository } from '../repositores/blogs-repository'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import {
    createdAtDateTimeValidator,
    postBlogIdValidator,
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator,
} from '../assets/express-validator/field-validators'
import { idStringParamValidationMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { _customIsBlogValidator } from '../assets/express-validator/custom-validators'
import { authorizationMiddleware } from '../assets/middlewares/authorization-middleware'
import { blogsRepository } from '../repositores/blogs-db-repository'
import { postsRepository } from '../repositores/posts-db-repository'

export const postsRouter = Router({})

postsRouter.get('/', async (req: Request, res: Response) => {
    const posts = await postsRepository.getPosts()
    res.status(CodeResponsesEnum.Success_200).send(posts)
})

postsRouter.post(
    '/',
    authorizationMiddleware,
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    postBlogIdValidator,
    createdAtDateTimeValidator,
    _customIsBlogValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const blogId = req.body.blogId
        const blog = await blogsRepository.getBlogById(blogId)

        const newPost = await postsRepository.createPost(req.body, blog!.name)

        if (newPost) {
            res.status(CodeResponsesEnum.Created_201).send(newPost) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
)

postsRouter.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const post = await postsRepository.getPostById(id)
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
        const isUpdated = await postsRepository.updatePost(id, req.body)
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
        const isDeleted = await postsRepository.deletePost(id)
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
