import request from 'supertest'

import { CodeResponsesEnum } from '../src/types'
import { PostType } from '../src/routes/posts-router'
import { app } from '../src/settings'
import { BlogType } from '../src/routes/blogs-router'
import { createBlog } from './assets'

//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js

describe('/posts', () => {
    let newPost: PostType | null = null
    let newBlog: BlogType | null = null
    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })
    it('GET posts = []', async () => {
        await request(app).get('/posts/').expect([])
    })
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
        expect(res.body).toEqual([])
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
            .expect(CodeResponsesEnum.Not_Authorized)

        const res = await request(app).get('/posts/')
        expect(res.body).toEqual([])
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
                        message: 'title should contain  2 - 30 symbols',
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
        expect(res.body).toEqual([])
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
        expect(res.body).toEqual([])
    })
    describe('', () => {})
    it('+ POST create the blog with correct data', async function () {
        newBlog = await createBlog()
        const res = await request(app).get('/blogs/')
        expect(res.body).toEqual([newBlog])
    })
    it('POST  create the post with correct data', async function () {
        const res_ = await request(app)
            .post('/posts/')
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                title: 'title123',
                shortDescription: 'description123',
                content: 'content123',
                blogId: newBlog!.id,
            })
            .expect(CodeResponsesEnum.Created_201)
        newPost = res_.body
        const res = await request(app).get('/posts/')
        expect(res.body).toEqual([newPost])
    })

    it('- GET post by ID with incorrect id', async () => {
        await request(app)
            .get('/posts/182018')
            .expect(CodeResponsesEnum.Not_found_404)
    })
    it('- GET post by ID with incorrect id', async () => {
        await request(app)
            .get('/posts/helloWorld')
            .expect(CodeResponsesEnum.Not_found_404)
    })
    it('+ GET post by ID with correct id', async () => {
        await request(app)
            .get('/posts/' + newPost!.id)
            .expect(200, newPost)
    })

    it('- PUT update post by ID with incorrect data (not auth, no all field)', async () => {
        await request(app)
            .put('/posts/helloWorld')
            .send({
                title: '',
                shortDescription: '',
                content: '',
                blogId: '',
            })
            .expect(CodeResponsesEnum.Not_Authorized)

        const res = await request(app).get('/posts/')
        expect(res.body[0]).toEqual(newPost)
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
        expect(res.body[0]).toEqual(newPost)
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
        expect(res.body[0]).toEqual(newPost)
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

        const res = await request(app).get('/posts/')
        expect(res.body[0]).toEqual({
            ...newPost,
            title: 'title123',
            shortDescription: 'string123',
            content: 'string123',
        })
        newPost = res.body[0]
    })

    it('- DELETE post by incorrect ID, not auth', async () => {
        await request(app)
            .delete('/posts/1kcnsdk')
            .expect(CodeResponsesEnum.Not_Authorized)

        const res = await request(app).get('/posts/')
        expect(res.body[0]).toEqual(newPost)
    })
    it('- DELETE post by incorrect ID, auth', async () => {
        await request(app)
            .delete('/posts/1kcnsdk')
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_found_404)

        const res = await request(app).get('/posts/')
        expect(res.body[0]).toEqual(newPost)
    })
    it('- DELETE post by incorrect ID, auth', async () => {
        await request(app)
            .delete('/posts/876328')
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_found_404)

        const res = await request(app).get('/posts/')
        expect(res.body[0]).toEqual(newPost)
    })
    it('+ DELETE post by correct ID, auth', async () => {
        await request(app)
            .delete('/posts/' + newPost!.id)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_content_204)

        const res = await request(app).get('/posts/')
        expect(res.body.length).toBe(0)
    })
})
