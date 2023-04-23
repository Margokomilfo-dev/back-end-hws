import { PostType } from './posts-db-repository'

let posts: Array<PostType> = [
    {
        id: '1',
        blogId: '1',
        blogName: 'Margo',
        title: 'postTitle',
        content: 'content',
        shortDescription: 'shortDescription',
        createdAt: new Date().toISOString(),
    },
]

export const postsRepository = {
    async getPosts() {
        return posts
    },
    async getPostById(id: string): Promise<PostType | null> {
        const post = posts.find((p) => p.id === id)
        if (post) {
            return post
        } else {
            return null
        }
    },
    async createPost(newPost: PostType): Promise<PostType | null> {
        posts.push(newPost)
        if (posts.find((p) => p.id === newPost.id)) {
            return newPost
        } else {
            return null
        }
    },
    async updatePost(
        id: string,
        body: {
            title: string
            content: string
            blogId: string
            shortDescription: string
        }
    ): Promise<boolean> {
        const ourPost = posts.find((p) => p.id === id)
        if (!ourPost) {
            return false
        }
        posts = posts.map((p) => (p.id === id ? { ...p, ...body } : p))
        return true
    },

    async deletePost(id: string): Promise<boolean> {
        const post = posts.find((p) => p.id === id)
        if (post) {
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].id === id) {
                    posts.splice(i, 1)
                    return true
                }
            }
            return false
        } else return false
    },
    async deleteAll() {
        posts.splice(0, posts.length)
        return posts
    },
}
