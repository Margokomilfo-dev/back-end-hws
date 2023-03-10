import { BlogType } from '../routes/blogs-router'
import { blogsRepository } from '../repositores/blogs-db-repository'

export const blogsService = {
    async getBlogs(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        searchNameTerm: string | null
    ): Promise<BlogType[]> {
        return blogsRepository.getBlogs(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        )
    },
    async getBlogsCount(searchNameTerm: string | null): Promise<number> {
        return blogsRepository.getBlogsCount(searchNameTerm)
    },
    async getBlogById(id: string): Promise<BlogType | null> {
        return blogsRepository.getBlogById(id)
    },

    async createBlog(
        name: string,
        description: string,
        websiteUrl: string
    ): Promise<BlogType | null> {
        const blog = {
            id: new Date().getTime().toString(),
            description,
            name,
            websiteUrl,
            isMembership: false,
            createdAt: new Date().toISOString(),
        }
        return blogsRepository.createBlog(blog)
    },

    async updateBlog(
        id: string,
        body: {
            name: 'string'
            description: 'string'
            websiteUrl: 'string'
        }
    ): Promise<boolean> {
        return blogsRepository.updateBlog(id, body)
    },

    async deleteBlog(id: string): Promise<boolean> {
        return blogsRepository.deleteBlog(id)
    },
    async deleteAll() {
        return blogsRepository.deleteAll()
    },
}
