import { CodeResponsesEnum } from '../src/types'
// @ts-ignore
import request from 'supertest'
import { app } from '../src/settings'
import { UserType } from '../src/repositores/users-db-repository'
import { createUser } from './assets'

describe('/auth', () => {
    let user: UserType
    let token: string
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

            // expect(user!.email).toBe('dimych@gmail.com')
            // expect(user!.login).toBe('Dimych')

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
            const res = await request(app)
                .post('/auth/login')
                .send({ loginOrEmail: 'Dimych', password: '123456' })
                .expect(CodeResponsesEnum.Success_200)

            token = res.body.accessToken
            console.log(token)
            expect(token).toBeDefined()
        })
    })
    describe('GET auth/me', () => {
        it('- GET no user (no token)', async function () {
            await request(app)
                .get('/auth/me')
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- GET no user (bad token, no data)', async function () {
            await request(app)
                .get('/auth/me')
                .set('Authorization', `bearer vxdvdsdfvx.gbrdgbdf.rtgrtdfg`)
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('+ GET', async function () {
            await request(app)
                .get('/auth/me')
                .set('Authorization', `bearer ${token}`)
                .expect(CodeResponsesEnum.Success_200, {
                    email: user.email,
                    login: user.login,
                    userId: user.id,
                })
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
