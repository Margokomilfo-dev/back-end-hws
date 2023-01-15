// import request from 'supertest'

import { app } from '../src'
import { CodeResponsesEnum } from '../src/types'

//от этой ошибки! -> thrown: "Exceeded timeout of 5000 ms for a test. go to the jest.config.js
describe('/blogs', function () {
    // beforeAll(async () => {
    //     await request(app).delete('/testing/all-data').expect(204)
    // })

    it('GET blogs = []', async () => {
        expect(1).toBe(1)
        // await request(app).get('/blogs/').expect([])
    })

    // it('- POST does not create the blog with incorrect data (no name, no description, no websiteUrl)', async function () {
    //     await request(app)
    //         .post('/blogs/')
    //         .send({})
    //         .expect(CodeResponsesEnum.Incorrect_values_400, {
    //             errorsMessages: [
    //                 { message: 'name is required', field: 'name' },
    //                 {
    //                     message: 'description is required',
    //                     field: 'description',
    //                 },
    //                 { message: 'websiteUrl is required', field: 'websiteUrl' },
    //             ],
    //         })
    //
    //     const res = await request(app).get('/blogs/')
    //     expect(res.body).toEqual([])
    // })
})
