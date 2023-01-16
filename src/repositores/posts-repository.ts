import { PostType } from '../routes/posts-router'

let posts: Array<PostType> = [
    {
        id: '1',
        blogId: '1',
        blogName: 'Margo',
        title: 'postTitle',
        content: 'content',
        shortDescription: 'shortDescription',
    },
]

export const postsRepository = {
    getPosts() {
        return posts
    },
    getPostById(id: string): PostType | null {
        const post = posts.find((p) => p.id === id)
        if (post) {
            return post
        } else {
            return null
        }
    },
    createPost(
        body: {
            title: string
            content: string
            blogId: string
            shortDescription: string
        },
        blogName: string
    ): PostType | null {
        const newPost: PostType = {
            id: new Date().getTime().toString(),
            title: body.title,
            content: body.content,
            blogId: body.blogId,
            shortDescription: body.shortDescription,
            blogName,
        }
        posts.push(newPost)
        if (posts.find((p) => p.id === newPost.id)) {
            return newPost
        } else {
            return null
        }
    },
    updatePost(
        id: string,
        body: {
            title: string
            content: string
            blogId: string
            shortDescription: string
        }
    ): boolean {
        const ourPost = posts.find((p) => p.id === id)
        if (!ourPost) {
            return false
        }
        posts = posts.map((p) => (p.id === id ? { ...p, ...body } : p))
        return true
    },

    deletePost(id: string): boolean {
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
    deleteAll() {
        posts.splice(0, posts.length)
        return posts
    },
}
