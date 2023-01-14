import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import { videosRepository } from '../repositores/videos-repository'

import {
    authorValidator,
    canBeDownloadedValidator,
    minAgeRestrictionValidator,
    publicationDateValidator,
    titleValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { idParamValidationMiddleware } from '../assets/express-validator/id-param-validation-middleware'

export const videosRouter = Router({})

videosRouter.get('/', (req: Request, res: Response) => {
    const videos = videosRepository.getVideos()
    res.status(CodeResponsesEnum.Success_200).send(videos)
})

videosRouter.post(
    '/',
    titleValidator,
    authorValidator,
    errorsResultMiddleware,
    (req: Request, res: Response) => {
        const title = req.body.title
        const author = req.body.author
        const availableResolutions = req.body.availableResolutions

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
    }
)
//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.get(
    '/:id',
    idParamValidationMiddleware,
    (req: Request, res: Response) => {
        const id = +req.params.id //if NaN - return !id === false

        const video = videosRepository.getVideoById(id)
        if (video) {
            res.status(CodeResponsesEnum.Success_200).send(video)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.put(
    '/:id',
    idParamValidationMiddleware,
    titleValidator,
    authorValidator,
    canBeDownloadedValidator,
    minAgeRestrictionValidator,
    publicationDateValidator,
    errorsResultMiddleware,
    (req: Request, res: Response) => {
        const id = +req.params.id
        const isUpdated = videosRepository.updateVideo(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.delete(
    '/:id',
    idParamValidationMiddleware,
    (req: Request, res: Response) => {
        const id = +req.params.id
        const isDeleted = videosRepository.deleteVideo(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
)

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
