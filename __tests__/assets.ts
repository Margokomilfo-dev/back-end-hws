import request from 'supertest'
import { app } from '../src/settings'
import { CodeResponsesEnum } from '../src/types'
import { BlogType } from '../src/routes/blogs-router'

export const createBlog = async (): Promise<BlogType> => {
    const res_ = await request(app)
        .post('/blogs/')
        .set('authorization', 'Basic YWRtaW46cXdlcnR5')
        .send({
            name: 'valid title',
            description: 'valid description',
            websiteUrl: 'https://margocommm.pl.com',
        })
        .expect(CodeResponsesEnum.Created_201)
    return res_.body
}
