import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'

import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator,
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import {
    blogIdStringParamValidationMiddleware,
    idStringParamValidationMiddleware,
} from '../assets/express-validator/id-int-param-validation-middleware'
import { authorizationMiddleware } from '../assets/middlewares/authorization-middleware'
import { blogsService } from '../services/blogs-service'
import { postsService } from '../services/posts-service'
import { paginationQueries } from '../assets/pagination'

export const blogsRouter = Router({})

blogsRouter.get('/', async (req: Request, res: Response) => {
    const { pageNumber, pageSize, sortBy, sortDirection } =
        paginationQueries(req)

    let searchNameTerm = req.query.searchNameTerm
        ? req.query.searchNameTerm.toString()
        : null

    const blogs = await blogsService.getBlogs(
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm
    )
    const blogsCount = await blogsService.getBlogsCount(searchNameTerm)
    const result = {
        pagesCount: Math.ceil(blogsCount / pageSize),
        page: pageNumber,
        pageSize,
        totalCount: blogsCount,
        items: blogs,
    }
    res.status(CodeResponsesEnum.Success_200).send(result)
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

        const newBlog = await blogsService.createBlog(
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

blogsRouter.post(
    '/:blogId/posts',
    authorizationMiddleware,
    blogIdStringParamValidationMiddleware,
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const blog = await blogsService.getBlogById(req.params.blogId)
        const newPost = await postsService.createPost(
            {
                title: req.body.title,
                content: req.body.content,
                shortDescription: req.body.shortDescription,
                blogId: blog!.id,
            },
            blog!.name
        )

        if (newPost) {
            res.status(CodeResponsesEnum.Created_201).send(newPost) //если сделать sendStatus - не дойдем до send
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

        const blog = await blogsService.getBlogById(id)
        if (blog) {
            res.status(CodeResponsesEnum.Success_200).send(blog)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
)

blogsRouter.get(
    '/:blogId/posts',
    blogIdStringParamValidationMiddleware,
    async (req: Request, res: Response) => {
        const { pageNumber, pageSize, sortBy, sortDirection } =
            paginationQueries(req)

        const id = req.params.blogId

        const posts = await postsService.getPostsByBlogId(
            id,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        )
        const postsCount = await postsService.getPostsCountByBlogId(id)
        const result = {
            pagesCount: Math.ceil(postsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postsCount,
            items: posts,
        }

        res.status(CodeResponsesEnum.Success_200).send(result)
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
        const isUpdated = await blogsService.updateBlog(id, req.body)
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
        const isDeleted = await blogsService.deleteBlog(id)
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
