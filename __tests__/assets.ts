import request from 'supertest'
import { app } from '../src/settings'
import { CodeResponsesEnum } from '../src/types'
import { BlogType } from '../src/routes/blogs-router'
import { PostType } from '../src/routes/posts-router'

export const createBlog = async (dto: {
    title: string
    description: string
}): Promise<BlogType> => {
    const res_ = await request(app)
        .post('/blogs/')
        .set('authorization', 'Basic YWRtaW46cXdlcnR5')
        .send({
            name: dto.title,
            description: dto.description,
            websiteUrl: 'https://margocommm.pl.com',
        })
        .expect(CodeResponsesEnum.Created_201)
    return res_.body
}

export const createPost = async (
    blogId: string,
    dto: { title: string; shortDescription: string; content: string }
): Promise<PostType> => {
    const res_ = await request(app)
        .post('/posts/')
        .set('authorization', 'Basic YWRtaW46cXdlcnR5')
        .send({
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId,
        })
        .expect(CodeResponsesEnum.Created_201)
    return res_.body
}
