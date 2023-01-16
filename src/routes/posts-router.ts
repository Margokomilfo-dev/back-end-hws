import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import { postsRepository } from '../repositores/posts-repository'
import { blogsRepository } from '../repositores/blogs-repository'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import {
    postBlogIdValidator,
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator,
} from '../assets/express-validator/field-validators'
import { idStringParamValidationMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'

export const postsRouter = Router({})

postsRouter.get('/', (req: Request, res: Response) => {
    const posts = postsRepository.getPosts()
    res.status(CodeResponsesEnum.Success_200).send(posts)
})

postsRouter.post(
    '/',
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    postBlogIdValidator,
    errorsResultMiddleware,
    (req: Request, res: Response) => {
        const blogId = req.body.blogId
        const blog = blogsRepository.getBlogById(blogId)
        if (!blog) {
            res.status(CodeResponsesEnum.Incorrect_values_400).send({
                errorsMessages: [
                    {
                        message: 'no blog with this blogId',
                        field: 'blogId',
                    },
                ],
            })
            return
        }
        const newPost = postsRepository.createPost(req.body, blog.name)

        if (newPost) {
            res.status(CodeResponsesEnum.Created_201).send(newPost) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
)

postsRouter.get('/:id', (req: Request, res: Response) => {
    const id = req.params.id
    const post = postsRepository.getPostById(id)
    if (post) {
        res.status(CodeResponsesEnum.Success_200).send(post)
    } else {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
    }
})

postsRouter.put(
    '/:id',
    idStringParamValidationMiddleware,
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    postBlogIdValidator,
    errorsResultMiddleware,
    (req: Request, res: Response) => {
        const id = req.params.id
        const blogId = req.body.blogId
        const blog = blogsRepository.getBlogById(blogId)
        if (!blog) {
            res.status(CodeResponsesEnum.Incorrect_values_400).send({
                errorsMessages: [
                    {
                        message: 'no blog with this blogId',
                        field: 'blogId',
                    },
                ],
            })
            return
        }
        const isUpdated = postsRepository.updatePost(id, req.body)
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
    idStringParamValidationMiddleware,
    (req: Request, res: Response) => {
        const id = req.params.id
        const isDeleted = postsRepository.deletePost(id)
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
}
