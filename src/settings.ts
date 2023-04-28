import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { videosRouter } from './routes/videos-router'
import { blogsRouter } from './routes/blogs-router'
import { postsRouter } from './routes/posts-router'
import { CodeResponsesEnum } from './types'
import { VideosRepository } from './repositores/videos-db-repository'
import { BlogsRepository } from './repositores/blogs-db-repository'
import { PostsRepository } from './repositores/posts-db-repository'
import { UsersRepository } from './repositores/users-db-repository'
import { usersRouter } from './routes/users-router'
import { authRouter } from './routes/auth-router'
import { commentsRouter } from './routes/comments-router'
import { CommentRepository } from './repositores/comments-db-repository'
import cookieParser from 'cookie-parser'
import { securityRouter } from './routes/security-router'
import { SecurityRepository } from './repositores/security-db-repository'

export const app = express()
app.set('trust proxy', true)
app.use(bodyParser.json())
app.use(cookieParser())

app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/security', securityRouter)

class AppController {
    videosRepository: VideosRepository
    blogsRepository: BlogsRepository
    commentsRepository: CommentRepository
    usersRepository: UsersRepository
    postsRepository: PostsRepository
    securityRepository: SecurityRepository
    constructor() {
        this.videosRepository = new VideosRepository()
        this.blogsRepository = new BlogsRepository()
        this.commentsRepository = new CommentRepository()
        this.usersRepository = new UsersRepository()
        this.postsRepository = new PostsRepository()
        this.securityRepository = new SecurityRepository()
    }
    async deleteAll(req: Request, res: Response) {
        await this.videosRepository.deleteAll()
        await this.blogsRepository.deleteAll()
        await this.postsRepository.deleteAll()
        await this.usersRepository.deleteAll()
        await this.commentsRepository.deleteAll()
        await this.securityRepository.deleteAll()
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
}
const appController = new AppController()

app.get('/', (req: Request, res: Response) => {
    res.send('Hello back-end HomeWorks in it-incubator!!!')
})
app.delete('/testing/all-data', appController.deleteAll.bind(appController))
