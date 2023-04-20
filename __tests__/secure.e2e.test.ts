import { CodeResponsesEnum } from '../src/types'
// @ts-ignore
import request from 'supertest'
import { app } from '../src/settings'
import { UserType } from '../src/repositores/users-db-repository'
import { userLogin } from './assets'
import { usersService } from '../src/services/users-service'
import { SecurityType } from '../src/repositores/security-db-repository'
import { securityService } from '../src/services/security-service'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const dbName = 'hw'
const mongoURI = process.env.mongoURI || `mongodb://0.0.0.0:27017/${dbName}`

describe('/secure', () => {
    let sessions: SecurityType[]
    let cookie_1: string[]
    let cookie_2: string[]
    let cookie_3: string[]
    let cookie_4: string[]
    let user: UserType | null

    let sessions2: SecurityType[]
    let cookie2: string[]
    let user2: UserType | null

    beforeAll(async () => {
        /* Connecting to the database before each test. */
        await mongoose.connect(mongoURI)
        await request(app).delete('/testing/all-data').expect(204)
    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })

    describe('POST auth/registration', () => {
        it('+ POST registration', async function () {
            await request(app)
                .post('/auth/registration')
                .send({
                    login: 'admin',
                    password: 'admin123',
                    email: 'margokomilfo.dek@gmail.com',
                })
                .expect(CodeResponsesEnum.Not_content_204)

            user = await usersService.getUserByLoginOrEmail('margokomilfo.dek@gmail.com')
        })
        it('+ POST registration', async function () {
            await request(app)
                .post('/auth/registration')
                .send({
                    login: 'margo',
                    password: 'margo123456',
                    email: 'margokomilfo@gmail.com',
                })
                .expect(CodeResponsesEnum.Not_content_204)

            user2 = await usersService.getUserByLoginOrEmail('margokomilfo@gmail.com')
        })
    })
    describe('POST auth/registration-confirmation', () => {
        it('+ POST correct code', async function () {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({ code: user!.confirmationData.code })
                .expect(CodeResponsesEnum.Not_content_204)
        })
        it('+ POST correct code', async function () {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({ code: user2!.confirmationData.code })
                .expect(CodeResponsesEnum.Not_content_204)
        })
    })
    describe('POST auth/login', () => {
        it('+ POST login user', async function () {
            const { _cookie } = await userLogin(
                { loginOrEmail: 'admin', password: 'admin123' },
                'Chrome'
            )

            cookie_1 = _cookie
            user = await usersService._getUserById(user!.id)
            sessions = await securityService.getSessionsByUserId(user!.id)

            expect(sessions.length).toBe(1)
        })
        it('+ POST login user', async function () {
            const { _cookie } = await userLogin(
                { loginOrEmail: 'admin', password: 'admin123' },
                'iMac'
            )

            cookie_2 = _cookie
            user = await usersService._getUserById(user!.id)
            sessions = await securityService.getSessionsByUserId(user!.id)

            expect(sessions.length).toBe(2)
        })
        it('+ POST login user', async function () {
            const { _cookie } = await userLogin(
                { loginOrEmail: 'admin', password: 'admin123' },
                'iPhone'
            )

            cookie_3 = _cookie
            user = await usersService._getUserById(user!.id)
            sessions = await securityService.getSessionsByUserId(user!.id)

            expect(sessions.length).toBe(3)
        })
        it('+ POST login user', async function () {
            const { _cookie } = await userLogin(
                { loginOrEmail: 'admin', password: 'admin123' },
                'Other'
            )

            cookie_4 = _cookie
            user = await usersService._getUserById(user!.id)
            sessions = await securityService.getSessionsByUserId(user!.id)

            expect(sessions.length).toBe(4)
        })
        it('+ POST login user', async function () {
            const { _cookie } = await userLogin(
                { loginOrEmail: 'margo', password: 'margo123456' },
                'Other'
            )

            cookie2 = _cookie
            user2 = await usersService._getUserById(user2!.id)
            sessions2 = await securityService.getSessionsByUserId(user2!.id)

            expect(sessions2.length).toBe(1)
        })
    })
    describe('GET devices', () => {
        it('GET devices', async () => {
            const res = await request(app)
                .get('/security/devices')
                .set('User-Agent', 'Chrome')
                .set('Cookie', cookie_1!)
                .expect(CodeResponsesEnum.Success_200)

            expect(res.body.length).toBe(4)
        })
    })
    describe('POST auth/refresh-token', () => {
        it('+ POST returned newAccessToken and newRefreshToken authorized', async function () {
            const response = await request(app)
                .post('/auth/refresh-token')
                .set('Cookie', cookie_1!)
                .send({})
                .expect(CodeResponsesEnum.Success_200)

            cookie_1 = response.get('Set-Cookie')
            expect(response.body.accessToken).toBeDefined()
        })
    })
    describe('POST auth/logout', () => {
        it('+ POST logout', async function () {
            await request(app)
                .post('/auth/logout')
                .set('Cookie', cookie_4!)
                .send({})
                .expect(CodeResponsesEnum.Not_content_204)

            user = await usersService._getUserById(user!.id)
            sessions = await securityService.getSessionsByUserId(user!.id)

            expect(sessions.length).toBe(3)
        })
    })
    describe('DELETE session', () => {
        it('- DELETE session with not correct deviceId', async () => {
            await request(app)
                .delete('/security/devices/1234')
                .set('Cookie', cookie_1!)
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- DELETE session with not correct deviceId', async () => {
            await request(app)
                .delete('/security/devices/' + sessions2[0]!.deviceId)
                .set('Cookie', cookie_1!)
                .expect(CodeResponsesEnum.Forbidden_403)
        })
        it('+ DELETE session with correct deviceId', async () => {
            await request(app)
                .delete('/security/devices/' + sessions[2]!.deviceId)
                .set('Cookie', cookie_1!)
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app)
                .get('/security/devices')
                .set('User-Agent', 'Chrome')
                .set('Cookie', cookie_1!)
                .expect(CodeResponsesEnum.Success_200)

            expect(res.body.length).toBe(2)
        })
    })
    describe('DELETE sessions', () => {
        it('+ DELETE all sessions without current', async () => {
            await request(app)
                .delete('/security/devices')
                .set('Cookie', cookie_1!)
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app).get('/security/devices').set('Cookie', cookie_1!)
            expect(res.body.length).toBe(1)
        })
    })
})
