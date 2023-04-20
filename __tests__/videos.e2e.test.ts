import request from 'supertest'
import { VideoType } from '../src/routes/videos-router'
import { CodeResponsesEnum } from '../src/types'
import { app } from '../src/settings'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const dbName = 'hw'
const mongoURI = process.env.mongoURI || `mongodb://0.0.0.0:27017/${dbName}`

//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js

describe('/videos', () => {
    let newVideo: VideoType | null = null

    beforeAll(async () => {
        /* Connecting to the database before each test. */
        await mongoose.connect(mongoURI)
        await request(app).delete('/testing/all-data').expect(204)
    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })

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
                errorsMessages: [{ message: 'title is required', field: 'title' }],
            })

        const res = await request(app).get('/videos/')
        expect(res.body).toEqual([])
    })
    it('- POST does not create the video with incorrect data (no author)', async function () {
        await request(app)
            .post('/videos/')
            .send({ title: 'title', author: '' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [{ message: 'author is required', field: 'author' }],
            })

        const res = await request(app).get('/videos/')
        expect(res.body).toEqual([])
    })
    it('- POST does not create the video with incorrect data (author more 20)', async function () {
        await request(app)
            .post('/videos/')
            .send({ title: 'title', author: 'author more 20 symbols' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [{ message: 'more than 20 symbols', field: 'author' }],
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
                        message: 'title should contain 1 - 40 symbols',
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
                        message: 'title should contain 1 - 40 symbols',
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
                        message: 'title should contain 1 - 40 symbols',
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
                errorsMessages: [{ message: 'author is required', field: 'author' }],
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
        await request(app).delete('/videos/1kcnsdk').expect(CodeResponsesEnum.Incorrect_values_400)

        const res = await request(app).get('/videos/')
        expect(res.body[0]).toEqual(newVideo)
    })
    it('- DELETE product by incorrect ID', async () => {
        await request(app).delete('/videos/111').expect(CodeResponsesEnum.Not_found_404)

        const res = await request(app).get('/videos/')
        expect(res.body[0]).toEqual(newVideo)
    })
    it('+ DELETE product by correct ID, auth', async () => {
        await request(app)
            .delete('/videos/' + newVideo!.id)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_content_204)

        const res = await request(app).get('/videos/')
        expect(res.body.length).toBe(0)
    })
})
