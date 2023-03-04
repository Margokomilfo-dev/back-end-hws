import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { videosRouter } from './routes/videos-router'
import { blogsRouter } from './routes/blogs-router'
import { postsRouter } from './routes/posts-router'
import { CodeResponsesEnum } from './types'
import { videosRepository } from './repositores/videos-db-repository'
import { blogsRepository } from './repositores/blogs-db-repository'
import { postsRepository } from './repositores/posts-db-repository'
import { usersRepository } from './repositores/users-db-repository'
import { usersRouter } from './routes/users-router'
import { authRouter } from './routes/auth-router'
import { commentsRouter } from './routes/comments-router'
import { commentsRepository } from './repositores/comments-db-repository'

export const app = express()

app.use(bodyParser.json())
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello back-end HomeWorks in it-incubator!!!')
})
app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await videosRepository.deleteAll()
    await blogsRepository.deleteAll()
    await postsRepository.deleteAll()
    await usersRepository.deleteAll()
    await commentsRepository.deleteAll()
    res.sendStatus(CodeResponsesEnum.Not_content_204)
})
