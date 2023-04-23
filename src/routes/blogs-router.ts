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
import { basicAuthorizationMiddleware } from '../middlewares/basic-authorization-middleware'
import { blogService } from '../services/blogs-service'
import { postsService } from '../services/posts-service'
import { paginationQueries } from '../assets/pagination'

export const blogsRouter = Router({})

class BlogsController {
    async getBlogs(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)

        let searchNameTerm = req.query.searchNameTerm ? req.query.searchNameTerm.toString() : null

        const blogs = await blogService.getBlogs(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        )
        const blogsCount = await blogService.getBlogsCount(searchNameTerm)
        const result = {
            pagesCount: Math.ceil(blogsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: blogsCount,
            items: blogs,
        }
        res.status(CodeResponsesEnum.Success_200).send(result)
    }
    async createBlog(req: Request, res: Response) {
        const name = req.body.name
        const description = req.body.description
        const websiteUrl = req.body.websiteUrl

        const newBlog = await blogService.createBlog(name, description, websiteUrl)

        if (newBlog) {
            res.status(CodeResponsesEnum.Created_201).send(newBlog) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
    async createPostForBlog(req: Request, res: Response) {
        const blog = await blogService.getBlogById(req.params.blogId)
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
    async getBlog(req: Request, res: Response) {
        const id = req.params.id

        const blog = await blogService.getBlogById(id)
        if (blog) {
            res.status(CodeResponsesEnum.Success_200).send(blog)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
    async getPostsByBlogId(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)

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
    async updateBlog(req: Request, res: Response) {
        const id = req.params.id
        const isUpdated = await blogService.updateBlog(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteBlog(req: Request, res: Response) {
        const id = req.params.id
        const isDeleted = await blogService.deleteBlog(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}

const blogsController = new BlogsController()

blogsRouter.get('/', blogsController.getBlogs)

blogsRouter.post(
    '/',
    basicAuthorizationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorsResultMiddleware,
    blogsController.createBlog
)

blogsRouter.post(
    '/:blogId/posts',
    basicAuthorizationMiddleware,
    blogIdStringParamValidationMiddleware,
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    errorsResultMiddleware,
    blogsController.createPostForBlog
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.get('/:id', idStringParamValidationMiddleware, blogsController.getBlog)

blogsRouter.get(
    '/:blogId/posts',
    blogIdStringParamValidationMiddleware,
    blogsController.getPostsByBlogId
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.put(
    '/:id',
    basicAuthorizationMiddleware,
    idStringParamValidationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorsResultMiddleware,
    blogsController.updateBlog
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.delete(
    '/:id',
    basicAuthorizationMiddleware,
    idStringParamValidationMiddleware,
    blogsController.deleteBlog
)
