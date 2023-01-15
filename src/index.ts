import bodyParser from 'body-parser'
import express, { Response, Request } from 'express'

import { videosRouter } from './routes/videos-router'
import { CodeResponsesEnum } from './types'
import { videosRepository } from './repositores/videos-repository'
import { blogsRepository } from './repositores/blogs-repository'
import { blogsRouter } from './routes/blogs-router'
import { postsRouter } from './routes/posts-router'
import { postsRepository } from './repositores/posts-repository'

export const app = express()
const port = 3999

app.use(bodyParser({}))
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello back-end HomeWorks in it-incubator!!!')
})
app.delete('/testing/all-data', (req: Request, res: Response) => {
    videosRepository.deleteAll()
    blogsRepository.deleteAll()
    postsRepository.deleteAll()
    res.sendStatus(CodeResponsesEnum.Not_content_204)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
