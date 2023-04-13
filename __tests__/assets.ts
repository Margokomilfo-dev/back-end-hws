// @ts-ignore
import request from 'supertest'
import { app } from '../src/settings'
import { CodeResponsesEnum } from '../src/types'
import { BlogType } from '../src/routes/blogs-router'
import { PostType } from '../src/routes/posts-router'
import { UserType } from '../src/repositores/users-db-repository'
import { CommentType } from '../src/services/comments-service'

export const createUser = async (dto: {
    login: string
    email: string
    password: string
}): Promise<UserType> => {
    const result = await request(app)
        .post('/users/')
        .set('authorization', 'Basic YWRtaW46cXdlcnR5')
        .send({
            login: dto.login,
            email: dto.email,
            password: dto.password,
        })
        .expect(CodeResponsesEnum.Created_201)

    expect(result.body.email).toBe(dto.email)
    expect(result.body.login).toBe(dto.login)
    return result.body
}
// {login: 'Dimych', email: 'dimych@gmail.com', password: '123456'}

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

export const createComment = async (
    postId: string,
    content: string,
    user: UserType,
    token: string
): Promise<CommentType> => {
    const res_ = await request(app)
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `bearer ${token}`)
        .send({ content })
        .expect(CodeResponsesEnum.Created_201)
    expect(res_.body.content).toBe(content)
    expect(res_.body.commentatorInfo).toEqual({
        userId: user!.id,
        userLogin: user!.login,
    })
    return res_.body
}

export const getTokenPostAuthLogin = async (
    loginOrEmail: string,
    password: string
): Promise<string> => {
    const res = await request(app)
        .post('/auth/login')
        .send({ loginOrEmail, password })
        .expect(CodeResponsesEnum.Success_200)

    return res.body.accessToken
}

export const userLogin = async (
    dto: { loginOrEmail: string; password: string },
    agent: string
): Promise<{ _cookie: string[]; _accessToken: string }> => {
    const res = await request(app)
        .post('/auth/login')
        .send(dto)
        .set('User-Agent', agent)
        .expect(CodeResponsesEnum.Success_200)

    const _cookie = res.get('Set-Cookie')
    const _accessToken = res.body.accessToken
    expect(_accessToken).toBeDefined()
    return { _cookie, _accessToken }
}
