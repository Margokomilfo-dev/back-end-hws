import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import { errorResponse } from '../assets/errorResponse'
import {
    authorFieldValidator,
    availableResolutionsFieldValidator,
    canBeDownloadedFieldValidator,
    minAgeRestrictionFieldValidator,
    publicationDateFieldValidator,
    titleFieldValidator,
} from '../assets/field-validator'
import { videosRepository } from '../repositores/videos-repository'

export const videosRouter = Router({})

videosRouter.get('/', (req: Request, res: Response) => {
    const videos = videosRepository.getVideos()
    res.status(CodeResponsesEnum.Success_200).send(videos)
})

videosRouter.post('/', (req: Request, res: Response) => {
    const title = req.body.title
    const author = req.body.author
    const availableResolutions = req.body.availableResolutions

    //------------------errors-------------------------------

    const errorsArray: Array<{ field: string; message: string }> = []
    titleFieldValidator(title, errorsArray)
    authorFieldValidator(author, errorsArray)
    availableResolutionsFieldValidator(availableResolutions, errorsArray)

    if (errorsArray.length > 0) {
        const errors_ = errorResponse(errorsArray)
        res.status(CodeResponsesEnum.Incorrect_values_400).send(errors_)
        return
    }
    //------------------errors-------------------------------

    const newVideo = videosRepository.createVideo(
        title,
        author,
        availableResolutions
    )

    if (newVideo) {
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

    const video = videosRepository.getVideoById(id)
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
    const publicationDate = req.body.publicationDate // string, not required

    //------------------errors-------------------------------

    const errorsArray: Array<{ field: string; message: string }> = []
    titleFieldValidator(title, errorsArray)
    authorFieldValidator(author, errorsArray)
    availableResolutionsFieldValidator(availableResolutions, errorsArray)
    canBeDownloadedFieldValidator(canBeDownloaded, errorsArray)
    minAgeRestrictionFieldValidator(minAgeRestriction, errorsArray)
    publicationDateFieldValidator(publicationDate, errorsArray)

    if (errorsArray.length > 0) {
        const errors_ = errorResponse(errorsArray)
        res.status(CodeResponsesEnum.Incorrect_values_400).send(errors_)
        return
    }
    //------------------errors-------------------------------

    const isUpdated = videosRepository.updateVideo(id, req.body)
    if (!isUpdated) {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
        return
    }
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
    const isDeleted = videosRepository.deleteVideo(id)
    if (isDeleted) {
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    } else {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
    }
})

// type CreateVideoBodyType = {
//     title: 'string'
//     author: 'string'
//     availableResolutions: Array<string>
// }
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
export enum ResolutionsEnum {
    'P144' = 'P144',
    'P240' = 'P240',
    'P360' = 'P360',
    'P480' = 'P480',
    'P720' = 'P720',
    'P1080' = 'P1080',
    'P1440' = 'P1440',
    'P2160' = 'P2160',
}
