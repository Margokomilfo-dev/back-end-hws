import bodyParser from 'body-parser'
import express, { Response, Request } from 'express'

import { videos, videosRouter } from './routes/videos-router'
import { CodeResponsesEnum } from './types'

export const app = express()
const port = 3999

app.use(bodyParser({}))
app.use('/videos', videosRouter)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello back-end HomeWorks in it-incubator!!!')
})
app.delete('/testing/all-data', (req: Request, res: Response) => {
    videos.splice(0, videos.length)
    res.send(CodeResponsesEnum.Not_content_204)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
