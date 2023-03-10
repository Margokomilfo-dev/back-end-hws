// @ts-ignore
import request from 'supertest'

import { CodeResponsesEnum } from '../src/types'
import { PostType } from '../src/routes/posts-router'
import { app } from '../src/settings'
import { BlogType } from '../src/routes/blogs-router'
import {
    createBlog,
    createPost,
    createUser,
    getTokenPostAuthLogin,
} from './assets'
import { UserType } from '../src/repositores/users-db-repository'
import { CommentType } from '../src/services/comments-service'

//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js

describe('/posts', () => {
    let newPost: PostType | null = null
    let comment: CommentType | null = null

    let newPost1: PostType | null = null
    let newBlog: BlogType | null = null

    let user: UserType | null = null
    let token: string | null = null

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })
    describe('GET', () => {
        it('GET posts = []', async () => {
            const res = await request(app).get('/posts/')
            expect(res.body.items).toEqual([])
        })
    })
    describe('POST', () => {
        it('- POST does not create the post with no data, auth', async function () {
            await request(app)
                .post('/posts/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'title is required',
                            field: 'title',
                        },
                        {
                            message: 'shortDescription is required',
                            field: 'shortDescription',
                        },
                        {
                            message: 'content is required',
                            field: 'content',
                        },
                        {
                            message: 'blogId is required',
                            field: 'blogId',
                        },
                    ],
                })

            const res = await request(app).get('/posts/')
            expect(res.body.items).toEqual([])
        })
        it('- POST does not create the post with incorrect data (not auth, not correct title, no description,no blogId ', async function () {
            await request(app)
                .post('/posts/')
                .send({
                    title: 'title more then 30 symbols and it is a big problem',
                    shortDescription: '',
                    content: 'content',
                    blogId: '',
                })
                .expect(CodeResponsesEnum.Not_Authorized_401)

            const res = await request(app).get('/posts/')
            expect(res.body.items).toEqual([])
        })
        it('- POST does not create the post with incorrect data (auth, not correct title, no description,no blogId ', async function () {
            await request(app)
                .post('/posts/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    title: 'title more then 30 symbols and it is a big problem',
                    shortDescription: '',
                    content: 'content',
                    blogId: '',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'title should contain 2 - 30 symbols',
                            field: 'title',
                        },
                        {
                            message: 'shortDescription is required',
                            field: 'shortDescription',
                        },
                        {
                            message: 'blogId is required',
                            field: 'blogId',
                        },
                    ],
                })

            const res = await request(app).get('/posts/')
            expect(res.body.items).toEqual([])
        })
        it('- POST does not create the post with incorrect data no blog with this blogId ', async function () {
            await request(app)
                .post('/posts/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    title: 'title123',
                    shortDescription: 'description123',
                    content: 'content123',
                    blogId: '1235',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'no blog with this blogId',
                            field: 'blogId',
                        },
                    ],
                })

            const res = await request(app).get('/posts/')
            expect(res.body.items).toEqual([])
        })
        describe('', () => {})
        it('+ POST blog - create the blog with correct data', async function () {
            newBlog = await createBlog({
                title: 'valid title',
                description: 'valid description',
            })
            const res = await request(app).get('/blogs/')
            expect(res.body.items).toEqual([newBlog])
        })
        it('+ POST post - create the post with correct data', async function () {
            newPost = await createPost(newBlog!.id, {
                title: 't1',
                content: 'c1',
                shortDescription: 'd1',
            })
            const res = await request(app).get('/posts/')
            expect(res.body.items).toEqual([newPost])
            expect(res.body.items[0]).toEqual(newPost)
        })
        it('+ POST post - create the post with correct data', async function () {
            newPost1 = await createPost(newBlog!.id, {
                title: 't2',
                content: 'c2',
                shortDescription: 'd2',
            })
            const res = await request(app).get('/posts/')
            expect(res.body.items.length).toBe(2)
            expect(res.body.items[1]).toEqual(newPost)
        })
    })
    describe('POST/:postId/comments', () => {
        it('POST create user', async () => {
            user = await createUser({
                login: 'Dimych',
                email: 'dimych@gmail.com',
                password: '123456',
            })
            await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
        })
        it('POST auth/login - get token', async () => {
            token = await getTokenPostAuthLogin('Dimych', '123456')
        })
        it('- POST does not create comment for existed postId - not authorized', async function () {
            await request(app)
                .post(`/posts/${newPost!.id}/comments`)
                .send({})
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- POST does not create comment for existed postId but no content data', async function () {
            await request(app)
                .post(`/posts/${newPost!.id}/comments`)
                .set('Authorization', `bearer ${token}`)
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'content is required',
                            field: 'content',
                        },
                    ],
                })
        })
        it('- POST does not create comment for not existed postId with correct correct content data', async function () {
            await request(app)
                .post(`/posts/12345/comments`)
                .set('Authorization', `bearer ${token}`)
                .send({
                    content: 'content should contain 20 - 300 symbols',
                })
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- POST does not create comment for existed postId but not correct content data', async function () {
            await request(app)
                .post(`/posts/${newPost!.id}/comments`)
                .set('Authorization', `bearer ${token}`)
                .send({
                    content: 'content',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'content should contain 20 - 300 symbols',
                            field: 'content',
                        },
                    ],
                })
        })
        it('+ POST create comment for existed postId', async function () {
            const res_ = await request(app)
                .post(`/posts/${newPost!.id}/comments`)
                .set('Authorization', `bearer ${token}`)
                .send({
                    content: 'content should contain 20 - 300 symbols',
                })
                .expect(CodeResponsesEnum.Created_201)
            expect(res_.body.content).toBe(
                'content should contain 20 - 300 symbols'
            )
            expect(res_.body.commentatorInfo).toEqual({
                userId: user!.id,
                userLogin: user!.login,
            })
            comment = res_.body
        })
    })
    describe('GET/:postId/comments', () => {
        it('GET comments by postId', async () => {
            const res_ = await request(app)
                .get('/posts/' + newPost!.id + '/comments')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(1)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(1)
            expect(res_.body.items[0].id).toBe(comment!.id)
        })
    })
    describe('GET:id', () => {
        it('- GET:id post by ID with incorrect id', async () => {
            await request(app)
                .get('/posts/182018')
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- GET:id post by ID with incorrect id', async () => {
            await request(app)
                .get('/posts/helloWorld')
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('+ GET:id post by ID with correct id', async () => {
            await request(app)
                .get('/posts/' + newPost!.id)
                .expect(200, newPost)
        })
    })
    describe('GET', () => {
        it('+ GET posts - pagination pageNumber=1, pageSize=10, sortBy=createdAt(default), sortDirection=desc(default)', async () => {
            const res_ = await request(app)
                .get('/posts/')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(2)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(2)
        })
        it('+ GET posts - pagination pageNumber=2, pageSize=1, sortBy=createdAt(default), sortDirection=desc(default)', async () => {
            const res_ = await request(app)
                .get('/posts?pageNumber=2&pageSize=1')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(1)
            expect(res_.body.pagesCount).toBe(2)
            expect(res_.body.pageSize).toBe(1)
            expect(res_.body.page).toBe(2)
            expect(res_.body.totalCount).toBe(2)
        })
        it('+ GET posts - pagination pageNumber=1, pageSize=10, sortBy=id, sortDirection=asc', async () => {
            const res_ = await request(app)
                .get(
                    '/posts?pageNumber=1&pageSize=10&sortBy=id&sortDirection=asc'
                )
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(2)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(2)
            expect(res_.body.items[0].id < res_.body.items[1].id).toBe(true)
        })
        it('+ GET posts - pagination pageNumber=1, pageSize=10, sortBy=id, sortDirection=desc', async () => {
            const res_ = await request(app)
                .get(
                    '/posts?pageNumber=1&pageSize=10&sortBy=id&sortDirection=desc'
                )
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(2)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(2)
            expect(res_.body.items[0].id > res_.body.items[1].id).toBe(true)
        })
    })
    describe('PUT', () => {
        it('- PUT update post by ID with incorrect data (not auth, no all field)', async () => {
            await request(app)
                .put('/posts/helloWorld')
                .send({
                    title: '',
                    shortDescription: '',
                    content: '',
                    blogId: '',
                })
                .expect(CodeResponsesEnum.Not_Authorized_401)

            const res = await request(app).get('/posts/')
            expect(res.body.items[0]).toEqual(newPost1)
        })
        it('- PUT update post by ID with incorrect data (auth, no all field)', async () => {
            await request(app)
                .put('/posts/helloWorld')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    title: '',
                    shortDescription: '',
                    content: '',
                    blogId: '',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'title is required',
                            field: 'title',
                        },
                        {
                            message: 'shortDescription is required',
                            field: 'shortDescription',
                        },
                        {
                            message: 'content is required',
                            field: 'content',
                        },
                        {
                            message: 'blogId is required',
                            field: 'blogId',
                        },
                    ],
                })

            const res = await request(app).get('/posts/')
            expect(res.body.items[0]).toEqual(newPost1)
        })
        it('- PUT update post by ID with incorrect data (auth, blog with this blogId not exist)', async () => {
            await request(app)
                .put('/posts/132-hsj-11')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    title: 'title',
                    shortDescription: 'string',
                    content: 'string',
                    blogId: 'string',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'no blog with this blogId',
                            field: 'blogId',
                        },
                    ],
                })

            const res = await request(app).get('/posts/')
            expect(res.body.items[0]).toEqual(newPost1)
        })
        it('+ PUT update post by ID with correct data', async () => {
            await request(app)
                .put('/posts/' + newPost!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    title: 'title123',
                    shortDescription: 'string123',
                    content: 'string123',
                    blogId: newBlog!.id,
                })
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app).get(`/posts/${newPost!.id}`)
            expect(res.body).toEqual({
                ...newPost,
                title: 'title123',
                shortDescription: 'string123',
                content: 'string123',
            })
            newPost = res.body
        })
    })
    describe('DELETE', () => {
        it('- DELETE post by incorrect ID, not auth', async () => {
            await request(app)
                .delete('/posts/1kcnsdk')
                .expect(CodeResponsesEnum.Not_Authorized_401)

            const res = await request(app).get('/posts/')
            expect(res.body.items.length).toBe(2)
        })
        it('- DELETE post by incorrect ID, auth', async () => {
            await request(app)
                .delete('/posts/1kcnsdk')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_found_404)

            const res = await request(app).get('/posts/')
            expect(res.body.items[0]).toEqual(newPost1)
        })
        it('- DELETE post by incorrect ID, auth', async () => {
            await request(app)
                .delete('/posts/876328')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_found_404)

            const res = await request(app).get('/posts/')
            expect(res.body.items[0]).toEqual(newPost1)
        })
        it('+ DELETE post by correct ID, auth', async () => {
            await request(app)
                .delete('/posts/' + newPost!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app).get('/posts/')
            expect(res.body.items.length).toBe(1)
        })
    })
})
