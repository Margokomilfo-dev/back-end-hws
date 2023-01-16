// @ts-ignore
import request from 'supertest'

import { app } from '../src'
import { VideoType } from '../src/routes/videos-router'
import { CodeResponsesEnum } from '../src/types'
import { BlogType } from '../src/routes/blogs-router'
import { PostType } from '../src/routes/posts-router'

//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js
describe('all tests', function () {
    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })
    let newVideo: VideoType | null = null
    let newBlog: BlogType | null = null
    let newPost: PostType | null = null
    describe('/videos', () => {
        it('GET products = []', async () => {
            await request(app).get('/videos/').expect([])
        })

        it('- POST does not create the video with incorrect data (no title, no author)', async function () {
            await request(app)
                .post('/videos/')
                .send({ title: '', author: '' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'title is required', field: 'title' },
                        { message: 'author is required', field: 'author' },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the video with incorrect data (no title)', async function () {
            await request(app)
                .post('/videos/')
                .send({ title: '', author: 'author' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'title is required', field: 'title' },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the video with incorrect data (no author)', async function () {
            await request(app)
                .post('/videos/')
                .send({ title: 'title', author: '' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'author is required', field: 'author' },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the video with incorrect data (author more 20)', async function () {
            await request(app)
                .post('/videos/')
                .send({ title: 'title', author: 'author more 20 symbols' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'more than 20 symbols', field: 'author' },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the video with incorrect data (no title, author more 20)', async function () {
            await request(app)
                .post('/videos/')
                .send({ author: 'author more 20 symbols' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'title is required', field: 'title' },
                        { message: 'more than 20 symbols', field: 'author' },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the video with incorrect data (title more 40, no author )', async function () {
            await request(app)
                .post('/videos/')
                .send({
                    title: 'title more then forty symbols. It is the biiig error =)',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'title should contain  1 - 40 symbols',
                            field: 'title',
                        },
                        { message: 'author is required', field: 'author' },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the video with incorrect data (title more 40, author more 20 )', async function () {
            await request(app)
                .post('/videos/')
                .send({
                    title: 'title more then forty symbols. It is the biiig error =)',
                    author: 'author more 20 symbols',
                    availableResolutions: ['P144', 'P720'],
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'title should contain  1 - 40 symbols',
                            field: 'title',
                        },
                        { message: 'more than 20 symbols', field: 'author' },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the video with incorrect data (title more 40, notCorrect availableResolutions )', async function () {
            await request(app)
                .post('/videos/')
                .send({
                    title: 'title more then forty symbols. It is the biiig error =)',
                    author: 'author',
                    availableResolutions: ['P144', 'Invalid', 'P720'],
                    canBeDownloaded: true,
                    minAgeRestriction: null,
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'title should contain  1 - 40 symbols',
                            field: 'title',
                        },
                        {
                            message: 'exist not valid value',
                            field: 'availableResolutions',
                        },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body).toEqual([])
        })

        it('+ POST create the video with correct data', async function () {
            const res = await request(app)
                .post('/videos/')
                .send({ title: 'new Title', author: 'new Author' })
                .expect(CodeResponsesEnum.Created_201)
            newVideo = res.body
            const videos = await request(app).get('/videos/')
            expect(videos.body.length).toBe(1)
            expect(videos.body[0].id).toBe(newVideo!.id)
        })

        it('- GET product by ID with incorrect id', async () => {
            await request(app)
                .get('/videos/' + 182018)
                .expect(404)
        })
        it('- GET product by ID with incorrect id', async () => {
            await request(app).get('/videos/helloWorld').expect(400)
        })
        it('+ GET product by ID with correct id', async () => {
            await request(app)
                .get('/videos/' + newVideo!.id)
                .expect(200, newVideo)
        })

        it('- PUT product by ID with incorrect data', async () => {
            await request(app)
                .put('/videos/' + 1223)
                .send({ title: 'title', author: 'title' })
                .expect(CodeResponsesEnum.Not_found_404)

            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
        it('- PUT product by ID with incorrect data', async () => {
            await request(app)
                .put('/videos/helloWorld')
                .send({ title: '', author: '' })
                .expect(CodeResponsesEnum.Incorrect_values_400)

            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
        it('- PUT product by ID with incorrect data (no author, no title)', async () => {
            await request(app)
                .put('/videos/' + newVideo!.id)
                .send({ title: '', author: '' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'title is required', field: 'title' },
                        { message: 'author is required', field: 'author' },
                    ],
                })
            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
        it('- PUT product by ID with incorrect data (no author)', async () => {
            await request(app)
                .put('/videos/' + newVideo!.id)
                .send({ title: 'new Title =)', author: '' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'author is required', field: 'author' },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
        it('- PUT product by ID with incorrect data (no title, not correct minAgeRestriction)', async () => {
            await request(app)
                .put('/videos/' + newVideo!.id)
                .send({ author: 'new author =)', minAgeRestriction: 47 })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'title is required', field: 'title' },
                        {
                            field: 'minAgeRestriction',
                            message: 'not correct',
                        },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
        it('- PUT product by ID with incorrect data (no title, notCorrect availableResolutions, not valid canBeDownloaded )', async () => {
            await request(app)
                .put('/videos/' + newVideo!.id)
                .send({
                    author: 'new author =)',
                    canBeDownloaded: 'hello',
                    availableResolutions: ['P144', 'Invalid', 'P720'],
                    minAgeRestriction: 18,
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'title is required', field: 'title' },
                        { message: 'not boolean', field: 'canBeDownloaded' },
                        {
                            message: 'exist not valid value',
                            field: 'availableResolutions',
                        },
                    ],
                })

            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
        it('- PUT product by ID with incorrect data (publicationDate)', async () => {
            await request(app)
                .put('/videos/' + newVideo!.id)
                .send({
                    title: 'hello title',
                    author: 'hello author',
                    publicationDate: 1995,
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            field: 'publicationDate',
                            message: 'not correct',
                        },
                    ],
                })
            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
        it('+ PUT product by ID with correct data', async () => {
            await request(app)
                .put('/videos/' + newVideo!.id)
                .send({
                    title: 'hello title',
                    author: 'hello author',
                    publicationDate: '2023-01-12T08:12:39.261Z',
                })
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual({
                ...newVideo,
                title: 'hello title',
                author: 'hello author',
                publicationDate: '2023-01-12T08:12:39.261Z',
            })
            newVideo = res.body[0]
        })

        it('- DELETE product by incorrect ID', async () => {
            await request(app)
                .delete('/videos/1kcnsdk')
                .expect(CodeResponsesEnum.Not_found_404)

            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
        it('- DELETE product by incorrect ID', async () => {
            await request(app)
                .delete('/videos/876328')
                .expect(CodeResponsesEnum.Not_found_404)

            const res = await request(app).get('/videos/')
            expect(res.body[0]).toEqual(newVideo)
        })
    })
    describe('/blogs', () => {
        it('GET blogs = []', async () => {
            await request(app).get('/blogs/').expect([])
        })
        it('- POST does not create the blog with incorrect data (authorized, no name, no description, no websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .send({})
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
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
            expect(res.body).toEqual([])
        })
        it('- POST does not create the blog with incorrect data (no headers, no name, no description, no websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .send({})
                .expect(CodeResponsesEnum.Not_Authorized)

            const res = await request(app).get('/blogs/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the blog with incorrect data (auth, no name, no websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .send({ description: 'description' })
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
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
            expect(res.body).toEqual([])
        })
        it('- POST does not create the blog with incorrect data (auth, incorrect name, incorrect websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .send({
                    name: 'name more then 15 symbols',
                    description: 'description',
                    websiteUrl: 'http://margocommarm.pl.com',
                })
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'name should contain  2 - 15 symbols',
                            field: 'name',
                        },
                        {
                            message: 'not correct',
                            field: 'websiteUrl',
                        },
                    ],
                })

            const res = await request(app).get('/blogs/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the blog with incorrect data (not correct token, incorrect websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')
                .send({
                    name: 'valid title',
                    description: 'description',
                    websiteUrl:
                        'http://margocommargocommargocommargocommargocommargocommargocommargocommargocommargocommargocommarm.pl.com',
                })
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_Authorized)

            const res = await request(app).get('/blogs/')
            expect(res.body).toEqual([])
        })
        it('- POST does not create the blog with incorrect data (auth, not correct token, incorrect websiteUrl)', async function () {
            await request(app)
                .post('/blogs/')

                .send({
                    name: 'valid title',
                    description: 'description',
                    websiteUrl:
                        'http://margocommargocommargocommargocommargocommargocommargocommargocommargocommargocommargocommarm.pl.com',
                })
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message:
                                'websiteUrl should contain  2 - 100 symbols',
                            field: 'websiteUrl',
                        },
                    ],
                })

            const res = await request(app).get('/blogs/')
            expect(res.body).toEqual([])
        })
        it('+ POST create the blog with correct data', async function () {
            const res_ = await request(app)
                .post('/blogs/')
                .send({
                    name: 'valid title',
                    description: 'valid description',
                    websiteUrl: 'https://margocommm.pl.com',
                })
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Created_201)
            newBlog = res_.body

            const res = await request(app).get('/blogs/')
            expect(res.body).toEqual([newBlog])
        })

        it('- GET:id- not existed id', async () => {
            await request(app)
                .get('/blogs/245')
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('+ GET:id- correct id', async () => {
            await request(app)
                .get('/blogs/' + newBlog!.id)
                .expect(CodeResponsesEnum.Success_200, newBlog)
        })

        it('- PUT does not update with incorrect data (not auth, not existed id)', async () => {
            await request(app)
                .put('/blogs/3570ht-i0u092')
                .send({
                    name: 'name',
                    description: 'description',
                    websiteUrl: 'https://hello.world',
                })
                .expect(CodeResponsesEnum.Not_Authorized)
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
                .set('authorization', 'Basic SDGSNstnsdgn')
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
                .set('authorization', 'Basic SDGSNstnsdgn')
                .send({
                    name: 'name123',
                    description: 'description123',
                    websiteUrl: 'https://hello.world',
                })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app).get('/blogs/' + newBlog!.id)
            const updatedBlog = res_.body

            const res = await request(app).get('/blogs/')
            expect(res.body).toEqual([updatedBlog])
            newBlog = updatedBlog
        })

        it('- DELETE does not deleted with (no auth, notExisted id)', async () => {
            await request(app)
                .delete('/blogs/hhh-we34')
                .expect(CodeResponsesEnum.Not_Authorized)

            const res = await request(app).get('/blogs/')
            expect(res.body.length).toBe(1)
        })
        it('- DELETE does not deleted with (auth,notExisted id)', async () => {
            await request(app)
                .delete('/blogs/hhh-we34')
                .set('authorization', 'Basic SDGSNstnsdgn')
                .expect(CodeResponsesEnum.Not_found_404)

            const res = await request(app).get('/blogs/')
            expect(res.body.length).toBe(1)
        })
    })
    describe('/posts', () => {
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
    })
    describe('deleted all data', () => {
        it('+ DELETE deleted with valid id, auth', async () => {
            await request(app)
                .delete('/blogs/' + newBlog!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app).get('/blogs/')
            expect(res.body).toEqual([])
        })
        it('+ DELETE product by correct ID, auth', async () => {
            await request(app)
                .delete('/videos/' + newVideo!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app).get('/videos/')
            expect(res.body.length).toBe(0)
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
})
