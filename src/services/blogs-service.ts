import { BlogsRepository, BlogType } from '../repositores/blogs-db-repository'

export class BlogService {
    blogsRepository: BlogsRepository
    constructor() {
        this.blogsRepository = new BlogsRepository()
    }
    async getBlogs(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        searchNameTerm: string | null
    ): Promise<BlogType[]> {
        return this.blogsRepository.getBlogs(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        )
    }

    async getBlogsCount(searchNameTerm: string | null): Promise<number> {
        return this.blogsRepository.getBlogsCount(searchNameTerm)
    }

    async getBlogById(id: string): Promise<BlogType | null> {
        return this.blogsRepository.getBlogById(id)
    }

    async createBlog(
        name: string,
        description: string,
        websiteUrl: string
    ): Promise<BlogType | null> {
        const blog = new BlogType(
            new Date().getTime().toString(),
            description,
            name,
            websiteUrl,
            false,
            new Date().toISOString()
        )
        return this.blogsRepository.createBlog(blog)
    }

    async updateBlog(
        id: string,
        body: {
            name: 'string'
            description: 'string'
            websiteUrl: 'string'
        }
    ): Promise<boolean> {
        return this.blogsRepository.updateBlog(id, body)
    }

    async deleteBlog(id: string): Promise<boolean> {
        return this.blogsRepository.deleteBlog(id)
    }

    async deleteAll() {
        return this.blogsRepository.deleteAll()
    }
}

//export const blogService = new BlogService()
