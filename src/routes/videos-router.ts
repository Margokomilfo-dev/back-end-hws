import addDays from 'date-fns/addDays'
import { Router, Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { errorResponse } from '../assets/errorResponse'

export const videosRouter = Router({})
export let videos: Array<VideoType> = [
    {
        id: 1,
        title: 'video 1',
        author: 'Margo',
        canBeDownloaded: false, //By default - false
        minAgeRestriction: 18, //maximum: 18, minimum: 1, default: null, nullable: true - null - no restriction
        createdAt: new Date().toISOString(),
        publicationDate: addDays(new Date(), 3).toISOString(), //By default - +1 day from CreatedAt
        availableResolutions: [],
    },
]

videosRouter.get('/', (req: Request, res: Response) => {
    res.status(CodeResponsesEnum.Success_200).send(videos)
})

videosRouter.post('/', (req: Request, res: Response) => {
    const title = req.body.title
    const author = req.body.author
    const availableResolutions = req.body.availableResolutions

    //------------------errors-------------------------------

    const errorsArray = []
    if (!title) {
        errorsArray.push({ field: 'title', message: 'no title' })
    }
    if (title && title.trim().length > 40) {
        errorsArray.push({
            field: 'title',
            message: 'more than 40 symbols',
        })
    }
    if (title && title.trim().length < 1) {
        errorsArray.push({
            field: 'title',
            message: 'no title',
        })
    }

    if (!author) {
        errorsArray.push({ field: 'author', message: 'no author' })
    }
    if (author && author.trim().length > 20) {
        errorsArray.push({
            field: 'author',
            message: 'more than 20 symbols',
        })
    }
    if (author && author.trim().length < 1) {
        errorsArray.push({
            field: 'author',
            message: 'no author',
        })
    }
    if (availableResolutions && availableResolutions.length) {
        availableResolutions.forEach((resolution: string) => {
            if (!Object.keys(ResolutionsEnum).includes(resolution)) {
                errorsArray.push({
                    field: 'availableResolutions',
                    message: 'exist not valid value',
                })
                return
            }
        })
    }
    if (errorsArray.length > 0) {
        const errors_ = errorResponse(errorsArray)
        res.status(CodeResponsesEnum.Incorrect_values_400).send(errors_)
        return
    }
    //------------------errors-------------------------------

    const newVideo = {
        id: new Date().getTime(),
        title: 'created new Video',
        author: 'Margo=)',
        canBeDownloaded: false, //By default - false
        minAgeRestriction: null, //maximum: 18, minimum: 1, default: null, nullable: true - null - no restriction
        createdAt: new Date().toISOString(),
        publicationDate: addDays(new Date(), 1).toISOString(), //By default - +1 day from CreatedAt
        availableResolutions: availableResolutions
            ? availableResolutions
            : null,
    }

    videos.push(newVideo)

    if (videos.find((video) => video.id === newVideo.id)) {
        res.status(CodeResponsesEnum.Created_201).send(newVideo) //если сделать sendStatus - не дойдем до send
    } else {
        res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
    }
})

videosRouter.get('/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id) //if NaN - return !id === false
    if (!id) {
        // если Ваня внесет в доку (раздизейблить след 2 строки и задизейблить 7 третью
        // const errors_ = errorResponse(['id'])
        // res.status(CodeResponsesEnum.Incorrect_values_400).send(errors_)
        res.sendStatus(CodeResponsesEnum.Not_found_404) //если send не сделать - тест будет бесконечный
        return
    }

    const video = videos.find((video) => video.id === id)
    if (video) {
        res.status(CodeResponsesEnum.Success_200).send(video)
    } else {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
    }
})

videosRouter.put('/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id) //if NaN - return !id === false
    if (!id) {
        res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        return
    }
    const title = req.body.title
    const author = req.body.author
    const availableResolutions = req.body.availableResolutions
    const canBeDownloaded = req.body.canBeDownloaded //only boolean
    const minAgeRestriction = req.body.minAgeRestriction // from 1 to 18, null, not required

    //------------------errors-------------------------------

    const errorsArray = []
    if (!title) {
        errorsArray.push({ field: 'title', message: 'no title' })
    }
    if (title && title.trim().length > 40) {
        errorsArray.push({
            field: 'title',
            message: 'more than 40 symbols',
        })
    }
    if (title && title.trim().length < 1) {
        errorsArray.push({
            field: 'title',
            message: 'no title',
        })
    }

    if (!author) {
        errorsArray.push({ field: 'author', message: 'no author' })
    }
    if (author && author.trim().length > 20) {
        errorsArray.push({
            field: 'author',
            message: 'more than 20 symbols',
        })
    }
    if (author && author.trim().length < 1) {
        errorsArray.push({
            field: 'author',
            message: 'no author',
        })
    }

    if (availableResolutions && availableResolutions.length) {
        availableResolutions.forEach((resolution: string) => {
            if (!Object.keys(ResolutionsEnum).includes(resolution)) {
                errorsArray.push({
                    field: 'availableResolutions',
                    message: 'exist not valid value',
                })
                return
            }
        })
    }
    if (canBeDownloaded && typeof canBeDownloaded !== 'boolean') {
        errorsArray.push({
            field: 'canBeDownloaded',
            message: 'not boolean',
        })
    }
    if (minAgeRestriction) {
        const res = parseInt(minAgeRestriction)
        if (!res || (res && res < 1) || (res && res > 18)) {
            errorsArray.push({
                field: 'minAgeRestriction',
                message: 'not correct',
            })
        }
    }

    if (errorsArray.length > 0) {
        const errors_ = errorResponse(errorsArray)
        res.status(CodeResponsesEnum.Incorrect_values_400).send(errors_)
        return
    }
    //------------------errors-------------------------------

    const ourVideo = videos.find((video) => video.id === id)
    if (!ourVideo) {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
        return
    }
    videos = videos.map((video) =>
        video.id === id ? { ...video, ...req.body } : video
    )
    res.sendStatus(CodeResponsesEnum.Not_content_204)
})

videosRouter.delete('/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id) //if NaN - return !id === false
    if (!id) {
        // если Ваня внесет в доку (раздизейблить след 2 строки и задизейблить 7 третью
        // const errors_ = errorResponse(['id'])
        // res.status(CodeResponsesEnum.Incorrect_values_400).send(errors_)
        res.sendStatus(CodeResponsesEnum.Not_found_404) //если send не сделать - тест будет бесконечный
        return
    }
    const video = videos.find((video) => video.id === id)
    if (video) {
        for (let i = 0; i < videos.length; i++) {
            if (videos[i].id === id) {
                videos.splice(i, 1)
                res.sendStatus(CodeResponsesEnum.Not_content_204)
                return
            }
        }
    } else {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
    }
})

type CreateVideoBodyType = {
    title: 'string'
    author: 'string'
    availableResolutions: Array<string>
}
export type VideoType = {
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    createdAt: string
    publicationDate: string
    availableResolutions: Array<string> | null
}
enum ResolutionsEnum {
    'P144' = 'P144',
    'P240' = 'P240',
    'P360' = 'P360',
    'P480' = 'P480',
    'P720' = 'P720',
    'P1080' = 'P1080',
    'P1440' = 'P1440',
    'P2160' = 'P2160',
}
