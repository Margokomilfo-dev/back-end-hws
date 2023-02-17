import { CodeResponsesEnum } from '../src/types'
import { BlogType } from '../src/routes/blogs-router'
import request from 'supertest'
import { app } from '../src/settings'
import { createBlog } from './assets'

//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js

describe('/blogs', () => {
    let newBlog: BlogType | null = null
    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })

    it('GET blogs = []', async () => {
        await request(app).get('/blogs/').expect([])
    })
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
        expect(res.body).toEqual([])
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
            .set('authorization', 'Basic YWRtaW46cXdlcn')
            .send({
                name: 'valid title',
                description: 'description',
                websiteUrl:
                    'http://margocommargocommargocommargocommargocommargocommargocommargocommargocommargocommargocommarm.pl.com',
            })
            .expect(CodeResponsesEnum.Not_Authorized)

        const res = await request(app).get('/blogs/')
        expect(res.body).toEqual([])
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
                        message: 'websiteUrl should contain  2 - 100 symbols',
                        field: 'websiteUrl',
                    },
                ],
            })

        const res = await request(app).get('/blogs/')
        expect(res.body).toEqual([])
    })
    it('+ POST create the blog with correct data', async function () {
        newBlog = await createBlog()
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
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_found_404)

        const res = await request(app).get('/blogs/')
        expect(res.body.length).toBe(1)
    })
    it('+ DELETE blog deleted with valid id, auth', async () => {
        await request(app)
            .delete('/blogs/' + newBlog!.id)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(CodeResponsesEnum.Not_content_204)

        const res = await request(app).get('/blogs/')
        expect(res.body).toEqual([])
    })
})
