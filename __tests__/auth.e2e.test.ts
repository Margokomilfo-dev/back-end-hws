import { CodeResponsesEnum } from '../src/types'
// @ts-ignore
import request from 'supertest'
import { app } from '../src/settings'
import { UserType } from '../src/repositores/users-db-repository'
import { createUser } from './assets'
import { usersService } from '../src/services/users-service'

describe('/auth', () => {
    let user1: UserType
    let user2: UserType | null
    let token: string
    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })

    describe('POST user', () => {
        it('+ POST create the user with correct data', async function () {
            user1 = await createUser({
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
            expect(res.body.items[0].id).toBe(user1!.id)
        })
    })
    describe('POST auth/registration', () => {
        it('- POST not data of user', async function () {
            await request(app)
                .post('/auth/registration')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'login is required',
                            field: 'login',
                        },
                        { message: 'password is required', field: 'password' },
                        { message: 'email is required', field: 'email' },
                    ],
                })
        })
        it('- POST not correct data of user', async function () {
            await request(app)
                .post('/auth/registration')
                .send({
                    login: 'admin',
                    password: 'admin',
                    email: 'email',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'password should contain 6 - 20 symbols',
                            field: 'password',
                        },
                        { message: 'not correct', field: 'email' },
                    ],
                })
        })
        it('+ POST registration', async function () {
            await request(app)
                .post('/auth/registration')
                .send({
                    login: 'admin',
                    password: 'admin123',
                    email: 'margokomilfo.dek@gmail.com',
                })
                .expect(CodeResponsesEnum.Not_content_204)

            user2 = await usersService.getUserByLoginOrEmail('margokomilfo.dek@gmail.com')
        })
        it('- POST not created with the same data of user', async function () {
            await request(app)
                .post('/auth/registration')
                .send({
                    login: 'admin',
                    password: 'admin123',
                    email: 'margokomilfo.dek@gmail.com',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'login is already exist', field: 'login' },
                        { message: 'email is already exist', field: 'email' },
                    ],
                })
        })
        it('- POST not created with the same login of user', async function () {
            await request(app)
                .post('/auth/registration')
                .send({
                    login: 'admin',
                    password: 'admin123',
                    email: 'margokomilfo@gmail.com',
                })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [{ message: 'login is already exist', field: 'login' }],
                })
        })
    })
    describe('POST auth/registration-email-resending', () => {
        it('- POST not email', async function () {
            await request(app)
                .post('/auth/registration-email-resending')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [{ message: 'email is required', field: 'email' }],
                })
        })
        it('- POST not user with this email', async function () {
            await request(app)
                .post('/auth/registration-email-resending')
                .send({ email: 'hello@email.ru' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'not user with this email',
                            field: 'email',
                        },
                    ],
                })
        })

        it('+ POST correct email', async function () {
            await request(app)
                .post('/auth/registration-email-resending')
                .send({ email: user2!.email })
                .expect(CodeResponsesEnum.Not_content_204)

            user2 = await usersService.getUserByLoginOrEmail('margokomilfo.dek@gmail.com')
        })
    })
    describe('POST auth/registration-confirmation', () => {
        it('- POST not code', async function () {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [{ message: 'code is required', field: 'code' }],
                })
        })
        it('- POST incorrect code', async function () {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({ code: 'ncksanc-sxnck-casnk' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [{ message: 'user in not found', field: 'code' }],
                })
        })
        it('+ POST correct code', async function () {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({ code: user2!.confirmationData.code })
                .expect(CodeResponsesEnum.Not_content_204)
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
            expect(token).toBeDefined()
        })
    })
    describe('GET auth/me', () => {
        it('- GET no user (no token)', async function () {
            await request(app).get('/auth/me').expect(CodeResponsesEnum.Not_Authorized_401)
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
                    email: user1.email,
                    login: user1.login,
                    userId: user1.id,
                })
        })
    })
    describe('DELETE user', () => {
        it('+ DELETE blog deleted with valid id, auth', async () => {
            await request(app)
                .delete('/users/' + user1!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            expect(res.body.items.length).toBe(1)
        })
    })
})
