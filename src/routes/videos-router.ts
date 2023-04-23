import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import {
    videoAuthorValidator,
    videoCanBeDownloadedValidator,
    videoMinAgeRestrictionValidator,
    videoPublicationDateValidator,
    videoTitleValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { idIntParamValidationMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { videosService } from '../services/videos-service'

export const videosRouter = Router({})

class VideosController {
    async getVideos(req: Request, res: Response) {
        const videos = await videosService.getVideos()
        res.status(CodeResponsesEnum.Success_200).send(videos)
    }
    async createVideo(req: Request, res: Response) {
        const title = req.body.title
        const author = req.body.author
        const availableResolutions = req.body.availableResolutions

        const newVideo = await videosService.createVideo(title, author, availableResolutions)

        if (newVideo) {
            res.status(CodeResponsesEnum.Created_201).send(newVideo) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
    async getVideo(req: Request, res: Response) {
        const id = +req.params.id //if NaN - return !id === false

        const video = await videosService.getVideoById(id)
        if (video) {
            res.status(CodeResponsesEnum.Success_200).send(video)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
    async updateVideo(req: Request, res: Response) {
        const id = +req.params.id
        const isUpdated = await videosService.updateVideo(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteVideo(req: Request, res: Response) {
        const id = +req.params.id
        const isDeleted = await videosService.deleteVideo(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}
const videosController = new VideosController()
videosRouter.get('/', videosController.getVideos)

videosRouter.post(
    '/',
    videoTitleValidator,
    videoAuthorValidator,
    errorsResultMiddleware,
    videosController.createVideo
)
//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.get('/:id', idIntParamValidationMiddleware, videosController.getVideo)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.put(
    '/:id',
    idIntParamValidationMiddleware,
    videoTitleValidator,
    videoAuthorValidator,
    videoCanBeDownloadedValidator,
    videoMinAgeRestrictionValidator,
    videoPublicationDateValidator,
    errorsResultMiddleware,
    videosController.updateVideo
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.delete('/:id', idIntParamValidationMiddleware, videosController.deleteVideo)
