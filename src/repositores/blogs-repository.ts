import { BlogType } from '../routes/blogs-router'

let blogs: Array<BlogType> = [
    {
        name: 'Margo',
        description: 'description',
        websiteUrl: 'https//:margokomilfo.com',
        id: '1',
        createdAt: '2023-02-17T20:20:23.630Z',
        isMembership: false,
    },
]

export const blogsRepository = {
    async getBlogs() {
        return blogs
    },
    async getBlogById(id: string): Promise<BlogType | null> {
        const blog = blogs.find((blog) => blog.id === id)
        if (blog) {
            return blog
        } else {
            return null
        }
    },
    async createBlog(blog: BlogType): Promise<BlogType | null> {
        blogs.push(blog)
        if (blogs.find((b) => b.id === b.id)) {
            return blog
        } else {
            return null
        }
    },

    async updateBlog(
        id: string,
        body: {
            name: 'string'
            description: 'string'
            websiteUrl: 'string'
        }
    ): Promise<boolean> {
        const blog = blogs.find((b) => b.id === id)
        if (!blog) {
            return false
        }
        blogs = blogs.map((b) => (b.id === id ? { ...b, ...body } : b))
        return true
    },

    async deleteBlog(id: string): Promise<boolean> {
        const blog = blogs.find((b) => b.id === id)
        if (blog) {
            for (let i = 0; i < blogs.length; i++) {
                if (blogs[i].id === id) {
                    blogs.splice(i, 1)
                    return true
                }
            }
            return false
        } else return false
    },
    async deleteAll() {
        blogs.splice(0, blogs.length)
        return blogs
    },
}
