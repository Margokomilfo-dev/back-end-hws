// @ts-ignore
import request from 'supertest'

import { CodeResponsesEnum } from '../src/types'
import { PostType } from '../src/routes/posts-router'
import { app } from '../src/settings'
import { BlogType } from '../src/routes/blogs-router'
import { createBlog, createComment, createPost, createUser, getTokenPostAuthLogin } from './assets'
import { UserType } from '../src/repositores/users-db-repository'
import { CommentType } from '../src/services/comments-service'

//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js

describe('/comments', () => {
    let user: UserType | null = null
    let newBlog: BlogType | null = null
    let newPost: PostType | null = null
    let token: string | null = null
    let comment: CommentType | null = null

    let user1: UserType | null = null
    let token1: string | null = null
    let comment1: CommentType | null = null

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })
    describe('preparing', () => {
        it('POST users', async () => {
            user = await createUser({
                login: 'Dimych',
                email: 'dimych@gmail.com',
                password: '123456',
            })
            user1 = await createUser({
                login: 'Natali',
                email: 'natali@gmail.com',
                password: '123456',
            })
        })
        it('POST blog', async () => {
            newBlog = await createBlog({
                title: 'blogTitle',
                description: 'blogDescription',
            })
            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(1)
            expect(res.body.items).toEqual([newBlog])
        })

        it('POST post', async () => {
            newPost = await createPost(newBlog!.id, {
                title: 'blogTitle',
                content: 'content could be more then 20 symbols',
                shortDescription: 'shortDescription of this new post',
            })

            const res = await request(app)
                .get(`/blogs/${newBlog!.id}/posts`)
                .expect(CodeResponsesEnum.Success_200)
            expect(res.body.totalCount).toBe(1)
        })
        it('POST tokens', async () => {
            token = await getTokenPostAuthLogin(user!.login, '123456')
            token1 = await getTokenPostAuthLogin(user1!.login, '123456')
        })
    })
    describe('GET/:id', () => {
        it('POST comments', async () => {
            comment = await createComment(
                newPost!.id,
                'comment content comment content comment content comment content',
                user!,
                token!
            )
            comment1 = await createComment(
                newPost!.id,
                'comment from Natali Natali Natali Natali Natali',
                user1!,
                token1!
            )
        })
        it('- GET/:id', async () => {
            await request(app).get('/comments/2324').expect(CodeResponsesEnum.Not_found_404)
        })
        it('+ GET/:id', async () => {
            const res = await request(app).get('/comments/' + comment!.id)
            expect(res.body).toEqual(comment)
        })
    })
    describe('PUT/:id', () => {
        it('- PUT/:id no auth', async () => {
            await request(app).put('/comments/2324').expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- PUT/:id auth, not correct id', async () => {
            await request(app)
                .put('/comments/2324')
                .set('Authorization', `bearer ${token}`)
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [{ message: 'content is required', field: 'content' }],
                })
        })
        it('- PUT/:id auth, not correct id', async () => {
            await request(app)
                .put('/comments/2324')
                .set('Authorization', `bearer ${token}`)
                .send({ content: 'contentik contentik contentik contentik' })
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- PUT/:id auth, correct id, not mine', async () => {
            await request(app)
                .put('/comments/' + comment1!.id)
                .set('Authorization', `bearer ${token}`)
                .send({ content: 'contentik contentik contentik contentik' })
                .expect(CodeResponsesEnum.Forbidden_403)
        })
        it('+ PUT/:id auth, not correct id', async () => {
            await request(app)
                .put('/comments/' + comment!.id)
                .set('Authorization', `bearer ${token}`)
                .send({ content: 'contentik contentik contentik contentik' })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app).get('/comments/' + comment!.id)
            expect(res_.body.content).toBe('contentik contentik contentik contentik')
        })
    })
    describe('DELETE', () => {
        it('- DELETE comment by incorrect ID, not auth', async () => {
            await request(app)
                .delete('/comments/1kcnsdk')
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- DELETE comment by incorrect ID, auth', async () => {
            await request(app)
                .delete('/comments/1kcnsdk')
                .set('authorization', `Bearer ${token}`)
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- DELETE not mine comment correct ID, auth', async () => {
            await request(app)
                .delete('/comments/' + comment1!.id)
                .set('authorization', `Bearer ${token}`)
                .expect(CodeResponsesEnum.Forbidden_403)
        })
        it('+ DELETE comment by correct ID, auth', async () => {
            await request(app)
                .delete('/comments/' + comment!.id)
                .set('authorization', `Bearer ${token}`)
                .expect(CodeResponsesEnum.Not_content_204)

            await request(app)
                .get('/comments/' + comment!.id)
                .expect(CodeResponsesEnum.Not_found_404)
        })
    })
})
