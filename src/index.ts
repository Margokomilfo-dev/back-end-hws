import bodyParser from 'body-parser'
import express, { Response, Request } from 'express'

import { videos, videosRouter } from './routes/videos-router'
import { CodeResponsesEnum } from './types'

export const app = express()
const port = 3999

app.use(bodyParser({}))
app.use('/videos', videosRouter)

app.delete('/testing/all-data', (req: Request, res: Response) => {
    const videos_ = videos.splice(0, videos.length)
    res.send(CodeResponsesEnum.Not_content_204)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
