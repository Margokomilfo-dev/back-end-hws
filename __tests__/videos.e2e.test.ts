import request from 'supertest'

import { app } from '../src'
import { videos, VideoType } from '../src/routes/videos-router'
import { CodeResponsesEnum } from '../src/types'

//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js
describe('/videos', function () {
    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
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
                    { message: 'no title', field: 'title' },
                    { message: 'no author', field: 'author' },
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
                errorsMessages: [{ message: 'no title', field: 'title' }],
            })

        const res = await request(app).get('/videos/')
        expect(res.body).toEqual([])
    })
    it('- POST does not create the video with incorrect data (no author)', async function () {
        await request(app)
            .post('/videos/')
            .send({ title: 'title', author: '' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [{ message: 'no author', field: 'author' }],
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
                    {
                        message: 'no title',
                        field: 'title',
                    },
                    {
                        message: 'more than 20 symbols',
                        field: 'author',
                    },
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
                        message: 'more than 40 symbols',
                        field: 'title',
                    },
                    {
                        message: 'no author',
                        field: 'author',
                    },
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
            })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [
                    {
                        message: 'more than 40 symbols',
                        field: 'title',
                    },
                    {
                        message: 'more than 20 symbols',
                        field: 'author',
                    },
                ],
            })

        const res = await request(app).get('/videos/')
        expect(res.body).toEqual([])
    })
    let newVideo: VideoType | null = null
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
        await request(app).get('/videos/helloWorld').expect(404)
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
                    { message: 'no title', field: 'title' },
                    { message: 'no author', field: 'author' },
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
                errorsMessages: [{ message: 'no author', field: 'author' }],
            })

        const res = await request(app).get('/videos/')
        expect(res.body[0]).toEqual(newVideo)
    })
    it('- PUT product by ID with incorrect data (no title)', async () => {
        await request(app)
            .put('/videos/' + newVideo!.id)
            .send({ author: 'new author =)' })
            .expect(CodeResponsesEnum.Incorrect_values_400, {
                errorsMessages: [{ message: 'no title', field: 'title' }],
            })

        const res = await request(app).get('/videos/')
        expect(res.body[0]).toEqual(newVideo)
    })
    it('+ PUT product by ID with correct data', async () => {
        await request(app)
            .put('/videos/' + newVideo!.id)
            .send({ title: 'hello title', author: 'hello author' })
            .expect(CodeResponsesEnum.Not_content_204)

        const res = await request(app).get('/videos/')
        expect(res.body[0]).toEqual({
            ...newVideo,
            title: 'hello title',
            author: 'hello author',
        })
    })
})
