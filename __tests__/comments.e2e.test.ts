import 'reflect-metadata'
import request from 'supertest'

import { CodeResponsesEnum } from '../src/types'
import { app } from '../src/settings'
import { createBlog, createComment, createPost, createUser, getTokenPostAuthLogin } from './assets'
import { UserType } from '../src/repositores/users-db-repository'

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { BlogType } from '../src/repositores/blogs-db-repository'
import { CommentType } from '../src/repositores/comments-db-repository'
import { PostType } from '../src/repositores/posts-db-repository'
import { LikeInfoEnum } from '../src/repositores/likes-db-repository'
dotenv.config()

const dbName = 'hw'
const mongoURI = process.env.mongoURI || `mongodb://0.0.0.0:27017/${dbName}`

describe('/comments', () => {
    let user: UserType | null = null
    let newBlog: BlogType | null = null
    let newPost: PostType | null = null
    let token: string | null = null
    let comment0_1: CommentType | null = null
    let comment0_2: CommentType | null = null
    let comment0_3: CommentType | null = null
    let comment0_4: CommentType | null = null

    let user1: UserType | null = null
    let token1: string | null = null
    let comment1_1: CommentType | null = null
    let comment1_2: CommentType | null = null
    let comment1_3: CommentType | null = null

    beforeAll(async () => {
        /* Connecting to the database before each test. */
        await mongoose.connect(mongoURI)
        await request(app).delete('/testing/all-data').expect(204)
    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })

    describe('preparing', () => {
        it('POST users', async () => {
            user = await createUser({
                login: 'Dimych',
                email: 'dimych@gmail.com',
                password: '123456',
            })
            user1 = await createUser({
                login: 'Natali',
                email: 'natali@gmail.com',
                password: '123456',
            })
        })
        it('POST blog', async () => {
            newBlog = await createBlog({
                title: 'blogTitle',
                description: 'blogDescription',
            })
            const res = await request(app).get('/blogs/')
            expect(res.body.items.length).toBe(1)
            expect(res.body.items[0].id).toBe(newBlog!.id)
            expect(res.body.items[0].name).toBe(newBlog!.name)
            expect(res.body.items[0].description).toBe(newBlog!.description)
            expect(res.body.items).toEqual([newBlog])
        })

        it('POST post', async () => {
            newPost = await createPost(newBlog!.id, {
                title: 'blogTitle',
                content: 'content could be more then 20 symbols',
                shortDescription: 'shortDescription of this new post',
            })

            const res = await request(app)
                .get(`/blogs/${newBlog!.id}/posts`)
                .expect(CodeResponsesEnum.Success_200)
            expect(res.body.totalCount).toBe(1)
        })
        it('POST tokens', async () => {
            token = await getTokenPostAuthLogin(user!.login, '123456')
            token1 = await getTokenPostAuthLogin(user1!.login, '123456')
        })
    })
    describe('GET/:id', () => {
        it('POST comments bu user', async () => {
            comment0_1 = await createComment(newPost!.id, 'comment1 comment comment', user!, token!)
            comment0_2 = await createComment(newPost!.id, 'comment2 comment comment', user!, token!)
            comment0_3 = await createComment(newPost!.id, 'comment3 comment comment', user!, token!)
            comment0_4 = await createComment(newPost!.id, 'comment4 comment comment', user!, token!)
        })
        it('POST comments bu user1', async () => {
            comment1_1 = await createComment(newPost!.id, 'comment11 comment comm', user1!, token1!)
            comment1_2 = await createComment(newPost!.id, 'comment12 comment comm', user1!, token1!)
            comment1_3 = await createComment(newPost!.id, 'comment13 comment comm', user1!, token1!)
        })
        it('- GET/:id', async () => {
            await request(app).get('/comments/2324').expect(CodeResponsesEnum.Not_found_404)
        })
        it('+ GET/:id', async () => {
            const res = await request(app).get('/comments/' + comment0_1!.id)
            expect(res.body).toEqual(comment0_1)
        })
    })
    describe('PUT/:id', () => {
        it('- PUT/:id no auth', async () => {
            await request(app).put('/comments/2324').expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- PUT/:id auth, not correct id', async () => {
            await request(app)
                .put('/comments/2324')
                .set('Authorization', `bearer ${token}`)
                .expect(CodeResponsesEnum.Incorrect_values_400, {
                    errorsMessages: [{ message: 'content is required', field: 'content' }],
                })
        })
        it('- PUT/:id auth, not correct id', async () => {
            await request(app)
                .put('/comments/2324')
                .set('Authorization', `bearer ${token}`)
                .send({ content: 'contentik contentik contentik contentik' })
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- PUT/:id auth, correct id, not mine', async () => {
            await request(app)
                .put('/comments/' + comment1_1!.id)
                .set('Authorization', `bearer ${token}`)
                .send({ content: 'contentik contentik contentik contentik' })
                .expect(CodeResponsesEnum.Forbidden_403)
        })
        it('+ PUT/:id auth, correct id', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id)
                .set('Authorization', `bearer ${token}`)
                .send({ content: 'contentik contentik contentik contentik' })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app).get('/comments/' + comment0_1!.id)
            expect(res_.body.content).toBe('contentik contentik contentik contentik')
        })
    })

    describe('PUT/:commentId/like-status', () => {
        it('- PUT/:commentId/like-status auth, incorrect data', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${token}`)
                .send({ likeStatus: 'incorrect' })
                .expect(CodeResponsesEnum.Incorrect_values_400)
        })
        it('- PUT/:commentId/like-status auth, no auth, incorrect data', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${123}`)
                .send({ likeStatus: 'incorrect' })
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('+ PUT/:commentId/like-status auth, Like comment by user', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${token}`)
                .send({ likeStatus: LikeInfoEnum.Like })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app)
                .get('/comments/' + comment0_1!.id)
                .set('Authorization', `bearer ${token}`)

            expect(res_.body.likesInfo.likesCount).toBe(1)
            expect(res_.body.likesInfo.dislikesCount).toBe(0)
            expect(res_.body.likesInfo.myStatus).toBe(LikeInfoEnum.Like)
        })
        it('+ PUT/:commentId/like-status auth, disLike comment by user', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${token}`)
                .send({ likeStatus: LikeInfoEnum.Dislike })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app)
                .get('/comments/' + comment0_1!.id)
                .set('Authorization', `bearer ${token}`)
            expect(res_.body.likesInfo.likesCount).toBe(0)
            expect(res_.body.likesInfo.dislikesCount).toBe(1)
            expect(res_.body.likesInfo.myStatus).toBe(LikeInfoEnum.Dislike)
        })

        it('+ PUT/:commentId/like-status auth, None comment by user', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${token}`)
                .send({ likeStatus: LikeInfoEnum.None })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app)
                .get('/comments/' + comment0_1!.id)
                .set('Authorization', `bearer ${token}`)

            console.log('Dislike => None status', res_.body.likesInfo)
            expect(res_.body.likesInfo.likesCount).toBe(0)
            expect(res_.body.likesInfo.dislikesCount).toBe(0)
            expect(res_.body.likesInfo.myStatus).toBe(LikeInfoEnum.None)
        })
        it('+ PUT/:commentId/like-status auth, Like comment by user', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${token}`)
                .send({ likeStatus: LikeInfoEnum.Like })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app)
                .get('/comments/' + comment0_1!.id)
                .set('Authorization', `bearer ${token}`)
            expect(res_.body.likesInfo.likesCount).toBe(1)
            expect(res_.body.likesInfo.dislikesCount).toBe(0)
            expect(res_.body.likesInfo.myStatus).toBe(LikeInfoEnum.Like)
        })

        it('+ PUT/:commentId/like-status auth,  Like comment1 by user', async () => {
            console.log(1)
            await request(app)
                .put('/comments/' + comment0_2!.id + '/like-status')
                .set('Authorization', `bearer ${token}`)
                .send({ likeStatus: LikeInfoEnum.Like })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app)
                .get('/comments/' + comment0_2!.id)
                .set('Authorization', `bearer ${token}`)
            expect(res_.body.likesInfo.likesCount).toBe(1)
            expect(res_.body.likesInfo.dislikesCount).toBe(0)
            expect(res_.body.likesInfo.myStatus).toBe(LikeInfoEnum.Like)
        })

        it('+ PUT/:commentId/like-status auth, Like comment1 by user1', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${token1}`)
                .send({ likeStatus: LikeInfoEnum.Like })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app)
                .get('/comments/' + comment0_1!.id)
                .set('Authorization', `bearer ${token1}`)
            expect(res_.body.likesInfo.likesCount).toBe(2)
            expect(res_.body.likesInfo.dislikesCount).toBe(0)
            expect(res_.body.likesInfo.myStatus).toBe(LikeInfoEnum.Like)
        })
        it('+ PUT/:commentId/like-status auth, Dislike comment1 by user', async () => {
            console.log('4')
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${token}`)
                .send({ likeStatus: LikeInfoEnum.Dislike })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app)
                .get('/comments/' + comment0_1!.id)
                .set('Authorization', `bearer ${token}`)
            expect(res_.body.likesInfo.likesCount).toBe(1)
            expect(res_.body.likesInfo.dislikesCount).toBe(1)
            expect(res_.body.likesInfo.myStatus).toBe(LikeInfoEnum.Dislike)
        })
        it('+ PUT/:commentId/like-status auth, Dislike comment1 by user', async () => {
            await request(app)
                .put('/comments/' + comment0_1!.id + '/like-status')
                .set('Authorization', `bearer ${token}`)
                .send({ likeStatus: LikeInfoEnum.Dislike })
                .expect(CodeResponsesEnum.Not_content_204)

            const res_ = await request(app)
                .get('/comments/' + comment0_1!.id)
                .set('Authorization', `bearer ${token}`)
            expect(res_.body.likesInfo.likesCount).toBe(1)
            expect(res_.body.likesInfo.dislikesCount).toBe(1)
            expect(res_.body.likesInfo.myStatus).toBe(LikeInfoEnum.Dislike)
        })
    })
    describe('GET/:postId/comments', () => {
        it('GET comments by postId', async () => {
            const res_ = await request(app)
                .get('/posts/' + newPost!.id + '/comments')
                .set('Authorization', `bearer ${token}`)
                .expect(CodeResponsesEnum.Success_200)

            expect(res_.body.items.length).toBe(7)
            expect(res_.body.pagesCount).toBe(1)
            expect(res_.body.pageSize).toBe(10)
            expect(res_.body.page).toBe(1)
            expect(res_.body.totalCount).toBe(7)
        })
    })
    describe('DELETE', () => {
        it('- DELETE comment by incorrect ID, not auth', async () => {
            await request(app)
                .delete('/comments/1kcnsdk')
                .expect(CodeResponsesEnum.Not_Authorized_401)
        })
        it('- DELETE comment by incorrect ID, auth', async () => {
            await request(app)
                .delete('/comments/1kcnsdk')
                .set('authorization', `Bearer ${token}`)
                .expect(CodeResponsesEnum.Not_found_404)
        })
        it('- DELETE not mine comment correct ID, auth', async () => {
            await request(app)
                .delete('/comments/' + comment0_1!.id)
                .set('authorization', `Bearer ${token1}`)
                .expect(CodeResponsesEnum.Forbidden_403)
        })
        it('+ DELETE comment by correct ID, auth', async () => {
            await request(app)
                .delete('/comments/' + comment0_1!.id)
                .set('authorization', `Bearer ${token}`)
                .expect(CodeResponsesEnum.Not_content_204)

            await request(app)
                .get('/comments/' + comment0_1!.id)
                .expect(CodeResponsesEnum.Not_found_404)
        })
    })
})
