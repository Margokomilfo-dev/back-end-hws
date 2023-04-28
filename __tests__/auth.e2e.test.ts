import { CodeResponsesEnum } from '../src/types'
import request from 'supertest'
import { app } from '../src/settings'
import { UserType } from '../src/repositores/users-db-repository'
import { createUser } from './assets'
import { usersService } from '../src/services/users-service'
import { SecurityType } from '../src/repositores/security-db-repository'
import { securityService } from '../src/services/security-service'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const dbName = 'hw'
const mongoURI = process.env.mongoURI || `mongodb://0.0.0.0:27017/${dbName}`

describe('/auth', () => {
    let user1: UserType | null
    let cookie: string[] | null
    let sessions: SecurityType[]
    let token: string

    let cookie2: string[] | null
    let user2: UserType | null
    let token2: string

    beforeAll(async () => {
        /* Connecting to the database before each test. */
        await mongoose.connect(mongoURI)
        await request(app).delete('/testing/all-data').expect(204)
    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })

    describe('POST user', () => {
        it('+ POST create the user with correct data', async function () {
            user1 = await createUser({
                login: 'Dimych',
                email: 'dimych@gmail.com',
                password: '123456',
            })
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

            user2 = await usersService.getUserByLoginOrEmail(
                'margokomilfo.dek@gmail.com'
            )
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
                    errorsMessages: [
                        { message: 'login is already exist', field: 'login' },
                    ],
                })
        })
    })
    describe('POST auth/registration-email-resending', () => {
        it('- POST not email', async function () {
            await request(app)
                .post('/auth/registration-email-resending')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'email is required', field: 'email' },
                    ],
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

            user2 = await usersService.getUserByLoginOrEmail(
                'margokomilfo.dek@gmail.com'
            )
        })
    })
    describe('POST auth/registration-confirmation', () => {
        it('- POST not code', async function () {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'code is required', field: 'code' },
                    ],
                })
        })
        it('- POST incorrect code', async function () {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({ code: 'ncksanc-sxnck-casnk' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'user in not found', field: 'code' },
                    ],
                })
        })
        it('+ POST correct code', async function () {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({ code: user2!.confirmationData.code })
                .expect(CodeResponsesEnum.Not_content_204)
        })
    })
    describe('POST auth/password-recovery', () => {
        it('- POST no correct email', async function () {
            await request(app)
                .post('/auth/password-recovery')
                .send({ email: 'm#gmail.com' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'not correct', field: 'email' },
                    ],
                })
        })
        it('- POST no existed correct email', async function () {
            await request(app)
                .post('/auth/password-recovery')
                .send({ email: 'm@gmail.com' })
                .expect(CodeResponsesEnum.Not_content_204)
        })
        it('+ POST correct code', async function () {
            await request(app)
                .post('/auth/password-recovery')
                .send({ email: user2!.email })
                .expect(CodeResponsesEnum.Not_content_204)

            user2 = await usersService.getUserByLoginOrEmail(
                'margokomilfo.dek@gmail.com'
            )
        })
    })
    describe('POST auth/new-password', () => {
        it('- POST not correct data', async function () {
            await request(app)
                .post('/auth/new-password')
                .send({ recoveryCode: user2!.confirmationData.code })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'password is required',
                            field: 'newPassword',
                        },
                    ],
                })
        })
        it('- POST not correct data', async function () {
            await request(app)
                .post('/auth/new-password')
                .send({ newPassword: '87654321' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'recoveryCode is required',
                            field: 'recoveryCode',
                        },
                    ],
                })
        })
        it('- POST not correct data', async function () {
            await request(app)
                .post('/auth/new-password')
                .send()
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'password is required',
                            field: 'newPassword',
                        },
                        {
                            message: 'recoveryCode is required',
                            field: 'recoveryCode',
                        },
                    ],
                })
        })
        it('+ POST correct code', async function () {
            await request(app)
                .post('/auth/new-password')
                .send({
                    newPassword: '87654321',
                    recoveryCode: user2!.confirmationData.code,
                })
                .expect(CodeResponsesEnum.Not_content_204)
        })
    })

    describe('POST auth/login', () => {
        it('+ POST login user', async function () {
            const res = await request(app)
                .post('/auth/login')
                .send({ loginOrEmail: 'Dimych', password: '123456' })
                .set('User-Agent', 'Chrome')
                .expect(CodeResponsesEnum.Success_200)

            cookie = res.get('Set-Cookie')

            token = res.body.accessToken
            expect(token).toBeDefined()

            user1 = await usersService._getUserById(user1!.id)
            sessions = await securityService.getSessionsByUserId(user1!.id)

            expect(sessions.length).toBe(1)
        })
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
    })
    describe('POST auth/refresh-token', () => {
        it('- POST no correct cookies', async function () {
            await request(app)
                .post('/auth/refresh-token')
                .set('Cookie', [`refreshToken = 1csfw`])
                .send({})
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- POST no cookies', async function () {
            await request(app)
                .post('/auth/refresh-token')
                .send({})
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('+ POST returned newAccessToken and newRefreshToken authorized', async function () {
            const response = await request(app)
                .post('/auth/refresh-token')
                .set('Cookie', cookie!)
                .send({})
                .expect(CodeResponsesEnum.Success_200)

            cookie = response.get('Set-Cookie')
            expect(response.body.accessToken).toBeDefined()
        })
    })
    it('+ POST login user', async function () {
        const res = await request(app)
            .post('/auth/login')
            .send({ loginOrEmail: 'Dimych', password: '123456' })
            .set('User-Agent', 'iOS')
            .expect(CodeResponsesEnum.Success_200)

        cookie2 = res.get('Set-Cookie')

        token2 = res.body.accessToken
        expect(token).toBeDefined()

        user1 = await usersService._getUserById(user1!.id)
        sessions = await securityService.getSessionsByUserId(user1!.id)

        expect(sessions.length).toBe(2)
    })
    it('- POST login error (for 429)', async function () {
        await request(app)
            .post('/auth/login')
            .send({ loginOrEmail: 'Dimych', password: '1236' })
            .expect(CodeResponsesEnum.Incorrect_values_400)
    })
    it('- POST login error (for 429)', async function () {
        await request(app)
            .post('/auth/login')
            .send({ loginOrEmail: 'Dimych', password: '1236' })
            .expect(CodeResponsesEnum.Incorrect_values_400)
    })
    it('- POST login 429 error', async function () {
        await request(app)
            .post('/auth/login')
            .send({ loginOrEmail: 'Dimych', password: '1236' })
            // .expect(CodeResponsesEnum.Too_many_requests_429)
            .expect(CodeResponsesEnum.Incorrect_values_400) // for rate> 15
    })
    describe('POST auth/logout', () => {
        it('- POST no correct cookies', async function () {
            await request(app)
                .post('/auth/logout')
                .set('Cookie', [`refreshToken = hello`])
                .send({})
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- POST no cookies', async function () {
            await request(app)
                .post('/auth/logout')
                .send({})
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('+ POST logout', async function () {
            await request(app)
                .post('/auth/logout')
                .set('Cookie', cookie!)
                .send({})
                .expect(CodeResponsesEnum.Not_content_204)

            user1 = await usersService._getUserById(user1!.id)
            sessions = await securityService.getSessionsByUserId(user1!.id)

            expect(sessions.length).toBe(1)
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
                    email: user1!.email,
                    login: user1!.login,
                    userId: user1!.id,
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
