import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'

import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { idStringParamValidationMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { authorizationMiddleware } from '../assets/middlewares/authorization-middleware'
import { blogsRepository } from '../repositores/blogs-db-repository'

export const blogsRouter = Router({})

blogsRouter.get('/', async (req: Request, res: Response) => {
    const blogs = await blogsRepository.getBlogs()
    res.status(CodeResponsesEnum.Success_200).send(blogs)
})

blogsRouter.post(
    '/',
    authorizationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const name = req.body.name
        const description = req.body.description
        const websiteUrl = req.body.websiteUrl

        const newBlog = await blogsRepository.createBlog(
            name,
            description,
            websiteUrl
        )

        if (newBlog) {
            res.status(CodeResponsesEnum.Created_201).send(newBlog) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
)
//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.get(
    '/:id',
    idStringParamValidationMiddleware,
    async (req: Request, res: Response) => {
        const id = req.params.id

        const blog = await blogsRepository.getBlogById(id)
        if (blog) {
            res.status(CodeResponsesEnum.Success_200).send(blog)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.put(
    '/:id',
    authorizationMiddleware,
    idStringParamValidationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const id = req.params.id
        const isUpdated = await blogsRepository.updateBlog(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.delete(
    '/:id',
    authorizationMiddleware,
    idStringParamValidationMiddleware,
    async (req: Request, res: Response) => {
        const id = req.params.id
        const isDeleted = await blogsRepository.deleteBlog(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
)

export type BlogType = {
    id: string
    name: string
    description: string
    websiteUrl: string
    isMembership: boolean
    createdAt: string
}
