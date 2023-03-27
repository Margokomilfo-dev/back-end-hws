import { CodeResponsesEnum } from '../src/types'
// @ts-ignore
import request from 'supertest'
import { app } from '../src/settings'
import { UserType } from '../src/repositores/users-db-repository'
import { createUser } from './assets'

describe('/users', () => {
    let user1: UserType | null = null
    let user2: UserType | null = null
    let user3: UserType | null = null

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })

    describe('GET', () => {
        it('- GET users not authorized', async () => {
            await request(app).get('/users/').expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('+ GET users = [] authorized', async () => {
            const res_ = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(0)
        })
    })

    describe('POST', () => {
        it('- POST does not create the user (no authorized)', async function () {
            await request(app).post('/users/').send({}).expect(CodeResponsesEnum.Not_Authorized_401)
            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            expect(res.body.items.length).toBe(0)
        })
        it('- POST does not create the user with incorrect data (authorized, no login, no email, no password)', async function () {
            await request(app)
                .post('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({})
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        { message: 'login is required', field: 'login' },
                        { message: 'password is required', field: 'password' },
                        { message: 'email is required', field: 'email' },
                    ],
                })
            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            expect(res.body.items.length).toBe(0)
        })
        it('- POST does not create the user with incorrect data (authorized, login is more then 10 symbols, not correct email, no password)', async function () {
            await request(app)
                .post('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .send({ login: 'hello world!', email: 'hello' })
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [
                        {
                            message: 'login should contain 3 - 10 symbols',
                            field: 'login',
                        },
                        { message: 'password is required', field: 'password' },
                        { message: 'not correct', field: 'email' },
                    ],
                })
            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            expect(res.body.items.length).toBe(0)
        })
        it('+ POST create the user with correct data', async function () {
            user1 = await createUser({
                login: 'hello1',
                email: 'hello1@mail.com',
                password: '123456',
            })

            // expect(user1!.email).toBe('hello1@mail.com')
            // expect(user1!.login).toBe('hello1')

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')

            expect(res.body.items.length).toBe(1)
            expect(res.body.items[0].id).toBe(user1!.id)
        })
        it('+ POST create the user with correct data', async function () {
            user2 = await createUser({
                login: 'Dimych',
                email: 'dimych@gmail.com',
                password: '123456',
            })

            // expect(user2!.email).toBe('dimych@gmail.com')
            // expect(user2!.login).toBe('Dimych')

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')

            expect(res.body.items.length).toBe(2)
            expect(res.body.items[0].id).toBe(user2!.id)
        })
        it('+ POST create the user with correct data', async function () {
            user3 = await createUser({
                login: 'Natalia',
                email: 'kuzyuberdina@gmail.com',
                password: '123456',
            })

            // expect(user3!.email).toBe('kuzyuberdina@gmail.com')
            // expect(user3!.login).toBe('Natalia')

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')

            expect(res.body.items.length).toBe(3)
            expect(res.body.items[0].id).toBe(user3!.id)
        })
    })

    describe('GET', () => {
        it('+ GET users - pagination pageNumber=1, pageSize=10, sortBy=createdAt(default), sortDirection=desc(default)', async () => {
            const res_ = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(3)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(3)
        })
        it('+ GET users - pagination pageNumber=2, pageSize=2, sortBy=createdAt(default), sortDirection=desc(default)', async () => {
            const res_ = await request(app)
                .get('/users?pageNumber=2&pageSize=2')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(1)
            expect(res_.body.pagesCount).toBe(2)
            expect(res_.body.pageSize).toBe(2)
            expect(res_.body.page).toBe(2)
            expect(res_.body.totalCount).toBe(3)
        })
        it('+ GET users - pagination pageNumber=1, pageSize=10, sortBy=id, sortDirection=asc', async () => {
            const res_ = await request(app)
                .get('/users?pageNumber=1&pageSize=10&sortBy=id&sortDirection=asc')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(3)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(3)
            expect(res_.body.items[0].id < res_.body.items[1].id).toBe(true)
        })
        it('+ GET users - pagination pageNumber=1, pageSize=10, sortBy=id, sortDirection=desc', async () => {
            const res_ = await request(app)
                .get('/users?pageNumber=1&pageSize=10&sortBy=id&sortDirection=desc')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(3)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(3)
            expect(res_.body.items[0].id > res_.body.items[1].id).toBe(true)
        })
        it('+ GET searchLoginTerm=D', async () => {
            const res_ = await request(app)
                .get('/users?searchLoginTerm=D')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(1)
            expect(res_.body.items[0].id).toBe(user2!.id)
        })
        it('+ GET searchEmailTerm=K', async () => {
            const res_ = await request(app)
                .get('/users?searchEmailTerm=K')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(1)
            expect(res_.body.items[0].id).toBe(user3!.id)
        })
        it('+ GET searchLoginTerm=D и  searchEmailTerm=K', async () => {
            const res_ = await request(app)
                .get('/users?searchLoginTerm=D&searchEmailTerm=K')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Success_200)
            expect(res_.body.items.length).toBe(2)
            expect(res_.body.items[0]).toEqual(user3)
            expect(res_.body.items[1]).toEqual(user2)
        })
    })

    describe('DELETE', () => {
        it('- DELETE does not deleted with (no auth)', async () => {
            await request(app)
                .delete('/users/hhh-we34')
                .expect(CodeResponsesEnum.Not_Authorized_401)

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            expect(res.body.items.length).toBe(3)
        })
        it('- DELETE does not deleted with (auth,notExisted id)', async () => {
            await request(app)
                .delete('/users/hhh-we34')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_found_404)

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            expect(res.body.items.length).toBe(3)
        })
        it('+ DELETE blog deleted with valid id, auth', async () => {
            await request(app)
                .delete('/users/' + user1!.id)
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
                .expect(CodeResponsesEnum.Not_content_204)

            const res = await request(app)
                .get('/users/')
                .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            expect(res.body.items.length).toBe(2)
        })
    })
})
