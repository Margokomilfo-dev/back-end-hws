import { BlogType } from '../routes/blogs-router'

let blogs: Array<BlogType> = [
    {
        name: 'Margo',
        description: 'description',
        websiteUrl: 'https//:margokomilfo.com',
        id: '1',
    },
]

export const blogsRepository = {
    getBlogs() {
        return blogs
    },
    getBlogById(id: string): BlogType | null {
        const blog = blogs.find((blog) => blog.id === id)
        if (blog) {
            return blog
        } else {
            return null
        }
    },
    createBlog(
        name: string,
        description: string,
        websiteUrl: string
    ): BlogType | null {
        const blog = {
            id: new Date().getTime().toString(),
            description,
            name,
            websiteUrl,
        }
        blogs.push(blog)
        if (blogs.find((b) => b.id === b.id)) {
            return blog
        } else {
            return null
        }
    },

    updateBlog(
        id: string,
        body: {
            name: 'string'
            description: 'string'
            websiteUrl: 'string'
        }
    ): boolean {
        const blog = blogs.find((b) => b.id === id)
        if (!blog) {
            return false
        }
        blogs = blogs.map((b) => (b.id === id ? { ...b, ...body } : b))
        return true
    },

    deleteBlog(id: string): boolean {
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
    deleteAll() {
        blogs.splice(0, blogs.length)
        return blogs
    },
}
