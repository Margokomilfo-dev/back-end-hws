import 'reflect-metadata'
// @ts-ignore
import request from 'supertest'
import { CodeResponsesEnum } from '../src/types'
import { app } from '../src/settings'
import { createBlog, createPost, createUser, getTokenPostAuthLogin } from './assets'
import { UserType } from '../src/repositores/users-db-repository'
import mongoose from 'mongoose'
// @ts-ignore
import dotenv from 'dotenv'
import { ExtendedPostType, PostType } from '../src/repositores/posts-db-repository'
import { CommentType } from '../src/repositores/comments-db-repository'
import { BlogType } from '../src/repositores/blogs-db-repository'
import { LikeInfoEnum } from '../src/repositores/likes-db-repository'
dotenv.config()

const dbName = 'hw'
const mongoURI = process.env.mongoURI || `mongodb://0.0.0.0:27017/${dbName}`

// const mongoURI = process.env.mongoURI || 'mongodb://0.0.0.0:27017'
//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js

describe('/posts', () => {
    let newPost: PostType | null = null
    let comment: CommentType | null = null

    let newPost1: PostType | null = null
    let newBlog: BlogType | null = null

    let user: UserType | null = null
    let token: string | null = null

    let user1: UserType | null = null
    let user2: UserType | null = null
    let token1: string | null = null
    let token2: string | null = null

    beforeAll(async () => {
        /* Connecting to the database before each test. */
        await mongoose.connect(mongoURI)
        await request(app).delete('/testing/all-data').expect(204)
    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })
    describe('preparing', () => {
        it('POST users', async () => {
            user1 = await createUser({
                login: 'Dimych_',
                email: 'dimych_@gmail.com',
                password: '123456',
            })
            user2 = await createUser({
                login: 'Natali',
                email: 'natali@gmail.com',
                password: '123456',
            })
        })

        it('POST tokens', async () => {
            token1 = await getTokenPostAuthLogin(user1!.login, '123456')
            token2 = await getTokenPostAuthLogin(user2!.login, '123456')
        })
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
            await request(app).get('/users/').set('authorization', 'Basic YWRtaW46cXdlcnR5')
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
            expect(res_.body.content).toBe('content should contain 20 - 300 symbols')
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
            await request(app).get('/posts/182018').expect(CodeResponsesEnum.Not_found_404)
        })
        it('- GET:id post by ID with incorrect id', async () => {
            await request(app).get('/posts/helloWorld').expect(CodeResponsesEnum.Not_found_404)
        })
        it('+ GET:id post by ID with correct id', async () => {
            await request(app)
                .get('/posts/' + newPost!.id)
                .expect(200, newPost)
        })
    })
    describe('GET', () => {
        it('+ GET posts - pagination pageNumber=1, pageSize=10, sortBy=createdAt(default), sortDirection=desc(default)', async () => {
            const res_ = await request(app).get('/posts/').expect(CodeResponsesEnum.Success_200)
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
                .get('/posts?pageNumber=1&pageSize=10&sortBy=id&sortDirection=asc')
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
                .get('/posts?pageNumber=1&pageSize=10&sortBy=id&sortDirection=desc')
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
    describe('PUT/:id/like-status', () => {
        it('+ PUT update post by ID with correct data', async () => {
            await request(app)
                .put('/posts/' + newPost!.id + '/like-status')
                .set('Authorization', `bearer ${token1}`)
                .send({
                    likeStatus: LikeInfoEnum.Like,
                })
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app)
                .get(`/posts/${newPost!.id}`)
                .set('Authorization', `bearer ${token1}`)

            expect(res.body.blogName).toBe(newPost!.blogName)
            expect(res.body.content).toBe('string123')
            expect(res.body.shortDescription).toBe('string123')
            expect(res.body.title).toBe('title123')
            expect(res.body.id).toBe(newPost!.id)
            expect(res.body.extendedLikesInfo).toBeDefined()
            expect(res.body.extendedLikesInfo.myStatus).toBe(LikeInfoEnum.Like)
            expect(res.body.extendedLikesInfo.likesCount).toBe(1)
            newPost = res.body

            const postsData = await request(app)
                .get(`/posts`)
                .set('Authorization', `bearer ${token1}`)
            expect(postsData.body.items.length).toBe(2)

            const ourPost = postsData.body.items.find((p: ExtendedPostType) => p.id === newPost!.id)

            expect(ourPost.extendedLikesInfo.newestLikes.length).toBe(1)
            expect(ourPost.extendedLikesInfo.newestLikes[0].userId).toBe(user1!.id)
            expect(ourPost.extendedLikesInfo.newestLikes[0].login).toBe(user1!.login)
            expect(ourPost.extendedLikesInfo.newestLikes[0].addedAt).toBeDefined()
        })
    })
    describe('DELETE', () => {
        it('- DELETE post by incorrect ID, not auth', async () => {
            await request(app).delete('/posts/1kcnsdk').expect(CodeResponsesEnum.Not_Authorized_401)

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

    /* Closing database connection after each test. */
    // afterAll(async () => {
    //     await mongoose.connection.close()
    // })
})
