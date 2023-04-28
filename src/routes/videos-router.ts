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
import { paramsValidatorsMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { VideosService } from '../services/videos-service'

export const videosRouter = Router({})

class VideosController {
    videosService: VideosService
    constructor() {
        this.videosService = new VideosService()
    }
    async getVideos(req: Request, res: Response) {
        const videos = await this.videosService.getVideos()
        res.status(CodeResponsesEnum.Success_200).send(videos)
    }
    async createVideo(req: Request, res: Response) {
        const title = req.body.title
        const author = req.body.author
        const availableResolutions = req.body.availableResolutions

        const newVideo = await this.videosService.createVideo(
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
    async getVideo(req: Request, res: Response) {
        const id = +req.params.id //if NaN - return !id === false

        const video = await this.videosService.getVideoById(id)
        if (video) {
            res.status(CodeResponsesEnum.Success_200).send(video)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
    async updateVideo(req: Request, res: Response) {
        const id = +req.params.id
        const isUpdated = await this.videosService.updateVideo(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteVideo(req: Request, res: Response) {
        const id = +req.params.id
        const isDeleted = await this.videosService.deleteVideo(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}
const videosController = new VideosController()

videosRouter.get('/', videosController.getVideos.bind(videosController))

videosRouter.post(
    '/',
    videoTitleValidator,
    videoAuthorValidator,
    errorsResultMiddleware,
    videosController.createVideo.bind(videosController)
)
//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.get(
    '/:id',
    paramsValidatorsMiddleware.idIntParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    videosController.getVideo.bind(videosController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.put(
    '/:id',
    paramsValidatorsMiddleware.idIntParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    videoTitleValidator,
    videoAuthorValidator,
    videoCanBeDownloadedValidator,
    videoMinAgeRestrictionValidator,
    videoPublicationDateValidator,
    errorsResultMiddleware,
    videosController.updateVideo.bind(videosController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.delete(
    '/:id',
    paramsValidatorsMiddleware.idIntParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    videosController.deleteVideo.bind(videosController)
)
