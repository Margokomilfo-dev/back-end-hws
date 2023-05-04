import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { videosRouter } from './routes/videos-router'
import { blogsRouter } from './routes/blogs-router'
import { postsRouter } from './routes/posts-router'
import { usersRouter } from './routes/users-router'
import { authRouter } from './routes/auth-router'
import { commentsRouter } from './routes/comments-router'
import cookieParser from 'cookie-parser'
import { securityRouter } from './routes/security-router'
import { appController } from './composition-root'

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

app.get('/', (req: Request, res: Response) => {
    res.send('Hello back-end HomeWorks in it-incubator!!!')
})
app.delete('/testing/all-data', appController.deleteAll.bind(appController))
