import bodyParser from 'body-parser'
import express, { Response, Request } from 'express'

import { videosRouter } from './routes/videos-router'
import { CodeResponsesEnum } from './types'
import { videosRepository } from './repositores/videos-repository'

export const app = express()
const port = 3999

app.use(bodyParser({}))
app.use('/videos', videosRouter)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello back-end HomeWorks in it-incubator!!!')
})
app.delete('/testing/all-data', (req: Request, res: Response) => {
    const videos = videosRepository.deleteAll()
    res.status(CodeResponsesEnum.Not_content_204).send(videos)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
