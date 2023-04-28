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
import { paramsValidatorsMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { basicAuthorizationMiddleware } from '../middlewares/basic-authorization-middleware'
import { BlogService } from '../services/blogs-service'
import { PostsService } from '../services/posts-service'
import { paginationQueries } from '../assets/pagination'

export const blogsRouter = Router({})

class BlogsController {
    postsService: PostsService
    blogService: BlogService
    constructor() {
        this.postsService = new PostsService()
        this.blogService = new BlogService()
    }
    async getBlogs(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection } =
            paginationQueries(req)

        let searchNameTerm = req.query.searchNameTerm
            ? req.query.searchNameTerm.toString()
            : null

        const blogs = await this.blogService.getBlogs(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        )
        const blogsCount = await this.blogService.getBlogsCount(searchNameTerm)
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

        const newBlog = await this.blogService.createBlog(
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
    async createPostForBlog(req: Request, res: Response) {
        const blog = await this.blogService.getBlogById(req.params.blogId)
        const newPost = await this.postsService.createPost(
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

        const blog = await this.blogService.getBlogById(id)
        if (blog) {
            res.status(CodeResponsesEnum.Success_200).send(blog)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
    async getPostsByBlogId(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection } =
            paginationQueries(req)

        const id = req.params.blogId

        const posts = await this.postsService.getPostsByBlogId(
            id,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        )
        const postsCount = await this.postsService.getPostsCountByBlogId(id)
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
        const isUpdated = await this.blogService.updateBlog(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteBlog(req: Request, res: Response) {
        const id = req.params.id
        const isDeleted = await this.blogService.deleteBlog(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}

const blogsController = new BlogsController()

blogsRouter.get('/', blogsController.getBlogs.bind(blogsController))
blogsRouter.post(
    '/',
    basicAuthorizationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorsResultMiddleware,
    blogsController.createBlog.bind(blogsController)
)

blogsRouter.post(
    '/:blogId/posts',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.blogIdStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    errorsResultMiddleware,
    blogsController.createPostForBlog.bind(blogsController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.get(
    '/:id',
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    blogsController.getBlog.bind(blogsController)
)

blogsRouter.get(
    '/:blogId/posts',
    paramsValidatorsMiddleware.blogIdStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    blogsController.getPostsByBlogId.bind(blogsController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.put(
    '/:id',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorsResultMiddleware,
    blogsController.updateBlog.bind(blogsController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.delete(
    '/:id',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    blogsController.deleteBlog.bind(blogsController)
)
