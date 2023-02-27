import { CodeResponsesEnum } from '../src/types'
import request from 'supertest'
import { app } from '../src/settings'
import { UserType } from '../src/repositores/users-db-repository'
import { createUser } from './assets'

describe('/auth', () => {
    let user: UserType
    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })

    describe('POST user', () => {
        it('+ POST create the user with correct data', async function () {
            user = await createUser({
                login: 'Dimych',
                email: 'dimych@gmail.com',
                password: '123456',
            })

            expect(user!.email).toBe('dimych@gmail.com')
            expect(user!.login).toBe('Dimych')

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')

            expect(res.body.items.length).toBe(1)
            expect(res.body.items[0].id).toBe(user!.id)
        })
    })

    describe('POST auth/login', () => {
        it('- POST does not login user (no authorized, no data)', async function () {
            await request(app)
                .post('/auth/login')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'loginOrEmail is required',
                            field: 'loginOrEmail',
                        },
                        { message: 'password is required', field: 'password' },
                    ],
                })
        })
        it('- POST does not login user incorrect data', async function () {
            await request(app)
                .post('/auth/login')
                .send({ loginOrEmail: 'Dimych', password: '1236' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'password should contain 6 - 20 symbols',
                            field: 'password',
                        },
                    ],
                })
        })
        it('+ POST does not login user', async function () {
            await request(app)
                .post('/auth/login')
                .send({ loginOrEmail: 'Dimych', password: '123456' })
                .expect(CodeResponsesEnum.Not_content_204)
        })
    })
    describe('DELETE user', () => {
        it('+ DELETE blog deleted with valid id, auth', async () => {
            await request(app)
                .delete('/users/' + user!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            expect(res.body.items.length).toBe(0)
        })
    })
})
