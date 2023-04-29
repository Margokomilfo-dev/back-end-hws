import { PostsService } from '../services/posts-service'
import { BlogsService } from '../services/blogs-service'
import { Request, Response } from 'express'
import { paginationQueries } from '../assets/pagination'
import { CodeResponsesEnum } from '../types'

export class BlogsController {
    constructor(private postsService: PostsService, private blogService: BlogsService) {}
    async getBlogs(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)

        let searchNameTerm = req.query.searchNameTerm ? req.query.searchNameTerm.toString() : null

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

        const newBlog = await this.blogService.createBlog(name, description, websiteUrl)

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
        const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)

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
