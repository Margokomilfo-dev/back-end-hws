import { CodeResponsesEnum } from '../src/types'
// @ts-ignore
import request from 'supertest'
import { app } from '../src/settings'
import { createBlog, createPost } from './assets'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { BlogType } from '../src/repositores/blogs-db-repository'
import { PostType } from '../src/repositores/posts-db-repository'
dotenv.config()

const dbName = 'hw'
const mongoURI = process.env.mongoURI || `mongodb://0.0.0.0:27017/${dbName}`

describe('/blogs', () => {
    let newBlog: BlogType | null = null
    let newBlog1: BlogType | null = null
    let newPost1: PostType | null = null
    let newPost2: PostType | null = null
    let newPost3: PostType | null = null
    let newPost4: PostType | null = null
    let newPost5: PostType | null = null

    beforeAll(async () => {
        /* Connecting to the database before each test. */
        await mongoose.connect(mongoURI)
        await request(app).delete('/testing/all-data').expect(204)
    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })

    describe('GET', () => {
        it('+ GET blogs = []', async () => {
            const res_ = await request(app).get('/blogs/').expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(0)
        })
    })
    describe('POST', () => {
        it('- POST does not create the blog with incorrect data (authorized, no name, no description, no websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'name is required', field: 'name' },
                        {
                            message: 'description is required',
                            field: 'description',
                        },
                        {
                            message: 'websiteUrl is required',
                            field: 'websiteUrl',
                        },
                    ],
                })
            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(0)
        })
        it('- POST does not create the blog with incorrect data (no headers, no name, no description, no websiteUrl)', async function () {
            await request(app).post('/blogs/').send({}).expect(CodeResponsesEnum.Not_Authorized_401)

            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(0)
        })
        it('- POST does not create the blog with incorrect data (auth, no name, no websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({ description: 'description' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'name is required', field: 'name' },
                        {
                            message: 'websiteUrl is required',
                            field: 'websiteUrl',
                        },
                    ],
                })

            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(0)
        })
        it('- POST does not create the blog with incorrect data (auth, incorrect name, incorrect websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    name: 'name more then 15 symbols',
                    description: 'description',
                    websiteUrl: 'http://margocommarm.pl.com',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'name should contain 2 - 15 symbols',
                            field: 'name',
                        },
                        {
                            message: 'not correct',
                            field: 'websiteUrl',
                        },
                    ],
                })

            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(0)
        })
        it('- POST does not create the blog with incorrect data (not correct token, incorrect websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .set('authorization', 'Basic YWRtaW46cXdlcn')
                .send({
                    name: 'valid title',
                    description: 'description',
                    websiteUrl:
                        'http://margocommargocommargocommargocommargocommargocommargocommargocommargocommargocommargocommarm.pl.com',
                })
                .expect(CodeResponsesEnum.Not_Authorized_401)

            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(0)
        })
        it('- POST does not create the blog with incorrect data (auth, not correct token, incorrect websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    name: 'valid title',
                    description: 'description',
                    websiteUrl:
                        'http://margocommargocommargocommargocommargocommargocommargocommargocommargocommargocommargocommarm.pl.com',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'websiteUrl should contain 2 - 100 symbols',
                            field: 'websiteUrl',
                        },
                    ],
                })

            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(0)
        })
        it('+ POST create the blog with correct data', async function () {
            newBlog = await createBlog({
                title: 'valid title',
                description: 'valid description',
            })
            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(1)
        })
        it('+ POST create the blog with correct data', async function () {
            newBlog1 = await createBlog({
                title: 'test title',
                description: 'test description',
            })
            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(2)
        })
    })
    describe('POST post', () => {
        it('- POST create not existing blogId', async function () {
            await request(app)
                .post('/blogs/123/posts')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    title: 'string',
                    shortDescription: 'string',
                    content: 'string',
                })
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- POST create existing blogId the blog with incorrect data', async function () {
            await request(app)
                .post(`/blogs/${newBlog1!.id}/posts`)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    title: 'string',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'shortDescription is required',
                            field: 'shortDescription',
                        },
                        { message: 'content is required', field: 'content' },
                    ],
                })
        })
        it('+ POST create existing blogId the blog with incorrect data', async function () {
            const res_ = await request(app)
                .post(`/blogs/${newBlog1!.id}/posts`)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    title: 'string',
                    shortDescription: 'string',
                    content: 'string',
                })
                .expect(CodeResponsesEnum.Created_201)
            expect(res_.body.title).toBe('string')
            expect(res_.body.shortDescription).toBe('string')
            expect(res_.body.content).toBe('string')

            const post = await request(app).get(`/posts/${res_.body.id}`)
            expect(res_.body).toEqual(post.body)
        })
    })

    describe('GET', () => {
        it('+ GET blogs - pagination pageNumber=1, pageSize=10, sortBy=createdAt(default), sortDirection=desc(default)', async () => {
            const res_ = await request(app).get('/blogs/').expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(2)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(2)
        })
        it('+ GET blogs - pagination pageNumber=2, pageSize=1, sortBy=createdAt(default), sortDirection=desc(default)', async () => {
            const res_ = await request(app)
                .get('/blogs?pageNumber=2&pageSize=1')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(1)
            expect(res_.body.pagesCount).toBe(2)
            expect(res_.body.pageSize).toBe(1)
            expect(res_.body.page).toBe(2)
            expect(res_.body.totalCount).toBe(2)
        })
        it('+ GET blogs - pagination pageNumber=1, pageSize=10, sortBy=id, sortDirection=asc', async () => {
            const res_ = await request(app)
                .get('/blogs?pageNumber=1&pageSize=10&sortBy=id&sortDirection=asc')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(2)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(2)
            expect(res_.body.items[0].id < res_.body.items[1].id).toBe(true)
        })
        it('+ GET blogs - pagination pageNumber=1, pageSize=10, sortBy=id, sortDirection=desc', async () => {
            const res_ = await request(app)
                .get('/blogs?pageNumber=1&pageSize=10&sortBy=id&sortDirection=desc')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(2)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(2)
            expect(res_.body.items[0].id > res_.body.items[1].id).toBe(true)
        })
        it('+ GET searchNameTerm=va', async () => {
            const res_ = await request(app)
                .get('/blogs?searchNameTerm=val')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(1)
            expect(res_.body.items[0].id).toBe(newBlog!.id)
        })
        it('+ GET searchNameTerm=te', async () => {
            const res_ = await request(app)
                .get('/blogs?searchNameTerm=te')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(1)
            expect(res_.body.items[0].id).toBe(newBlog1!.id)
        })
        it('+ GET searchNameTerm=no', async () => {
            const res_ = await request(app)
                .get('/blogs?searchNameTerm=no')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(0)
        })
    })
    describe('GET:id', () => {
        it('- GET:id - not existed id', async () => {
            await request(app).get('/blogs/245').expect(CodeResponsesEnum.Not_found_404)
        })
        it('+ GET:id - correct id', async () => {
            await request(app)
                .get('/blogs/' + newBlog!.id)
                .expect(CodeResponsesEnum.Success_200, newBlog)
        })
    })
    describe('GET:id/posts', () => {
        it('- GET:id/posts - not existed  blogId', async () => {
            await request(app).get('/blogs/245/posts').expect(CodeResponsesEnum.Not_found_404)
        })
        it('+ GET:id/posts - correct blogId, pagination', async () => {
            newPost1 = await createPost(newBlog!.id, {
                title: 't1',
                content: 'c1',
                shortDescription: 'd1',
            })
            newPost2 = await createPost(newBlog!.id, {
                title: 't2',
                content: 'c2',
                shortDescription: 'd2',
            })
            newPost3 = await createPost(newBlog!.id, {
                title: 't3',
                content: 'c3',
                shortDescription: 'd3',
            })
            newPost4 = await createPost(newBlog!.id, {
                title: 't4',
                content: 'c4',
                shortDescription: 'd4',
            })
            newPost5 = await createPost(newBlog!.id, {
                title: 't5',
                content: 'c5',
                shortDescription: 'd5',
            })
            const res = await request(app)
                .get(`/blogs/${newBlog!.id}/posts`)
                .expect(CodeResponsesEnum.Success_200)
            expect(res.body.totalCount).toBe(5)
            expect(res.body.pageSize).toBe(10)
            expect(res.body.page).toBe(1)
            expect(res.body.items.length).toBe(5)
        })
        it('+ GET:id/posts - correct  blogId, pagination - pageNumber=2, pageSize=3,sortBy=createdAt(default), sortDirection=desc(default)', async () => {
            const res = await request(app)
                .get(`/blogs/${newBlog!.id}/posts?pageNumber=2&pageSize=3`)
                .expect(CodeResponsesEnum.Success_200)

            expect(res.body.page).toBe(2)
            expect(res.body.pageSize).toBe(3)
            expect(
                new Date(res.body.items[0].createdAt).getTime() >
                    new Date(res.body.items[1].createdAt).getTime()
            ).toBe(true)
        })
        it('+ GET:id/posts - correct  blogId, pagination - pageNumber=2, pageSize=3,sortBy=id, sortDirection=desc(default)', async () => {
            const res = await request(app)
                .get(`/blogs/${newBlog!.id}/posts?pageNumber=2&pageSize=3&sortId=id`)
                .expect(CodeResponsesEnum.Success_200)

            expect(res.body.page).toBe(2)
            expect(res.body.pageSize).toBe(3)
            expect(+res.body.items[0].id > +res.body.items[1].id).toBe(true)
        })
        it('+ GET:id/posts - correct  blogId, pagination - pageNumber=2, pageSize=3,sortBy=id, sortDirection=asc', async () => {
            const res = await request(app)
                .get(
                    `/blogs/${
                        newBlog!.id
                    }/posts?pageNumber=2&pageSize=3&sortBy=id&sortDirection=asc`
                )
                .expect(CodeResponsesEnum.Success_200)
            expect(res.body.page).toBe(2)
            expect(res.body.pageSize).toBe(3)
            expect(+res.body.items[0].id < +res.body.items[1].id).toBe(true)
        })
    })
    describe('PUT', () => {
        it('- PUT does not update with incorrect data (not auth, not existed id)', async () => {
            await request(app)
                .put('/blogs/3570ht-i0u092')
                .send({
                    name: 'name',
                    description: 'description',
                    websiteUrl: 'https://hello.world',
                })
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- PUT does not update with incorrect data (auth, not existed id)', async () => {
            await request(app)
                .put('/blogs/3570ht-i0u092')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    name: 'name',
                    description: 'description',
                    websiteUrl: 'https://hello.world',
                })
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- PUT does not update with incorrect data (auth, not valid body)', async () => {
            await request(app)
                .put('/blogs/' + newBlog!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({ name: 'name' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'description is required',
                            field: 'description',
                        },
                        {
                            message: 'websiteUrl is required',
                            field: 'websiteUrl',
                        },
                    ],
                })
        })
        it('+ PUT update with correct data', async () => {
            await request(app)
                .put('/blogs/' + newBlog!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({
                    name: 'name123',
                    description: 'description123',
                    websiteUrl: 'https://hello.world',
                })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app).get('/blogs/' + newBlog!.id)
            const updatedBlog = res_.body

            const res = await request(app).get('/blogs/')
            const ourBlog = res.body.items.find((i: BlogType) => i.id === newBlog!.id)
            expect(ourBlog).toEqual({
                createdAt: updatedBlog.createdAt,
                description: updatedBlog.description,
                id: updatedBlog.id,
                isMembership: updatedBlog.isMembership,
                name: updatedBlog.name,
                websiteUrl: updatedBlog.websiteUrl,
            })
            newBlog = updatedBlog
        })
    })
    describe('DELETE', () => {
        it('- DELETE does not deleted with (no auth, notExisted id)', async () => {
            await request(app)
                .delete('/blogs/hhh-we34')
                .expect(CodeResponsesEnum.Not_Authorized_401)

            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(2)
        })
        it('- DELETE does not deleted with (auth,notExisted id)', async () => {
            await request(app)
                .delete('/blogs/hhh-we34')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_found_404)

            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(2)
        })
        it('+ DELETE blog deleted with valid id, auth', async () => {
            await request(app)
                .delete('/blogs/' + newBlog!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toEqual(1)
        })
    })
})
