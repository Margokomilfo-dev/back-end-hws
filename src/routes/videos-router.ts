import { Router } from 'express'
import {
    videoAuthorValidator,
    videoCanBeDownloadedValidator,
    videoMinAgeRestrictionValidator,
    videoPublicationDateValidator,
    videoTitleValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { paramsValidatorsMiddleware, videosController } from '../composition-root'

export const videosRouter = Router({})

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
    paramsValidatorsMiddleware.idIntParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    videosController.getVideo.bind(videosController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
videosRouter.put(
    '/:id',
    paramsValidatorsMiddleware.idIntParamValidationMiddleware.bind(paramsValidatorsMiddleware),
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
    paramsValidatorsMiddleware.idIntParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    videosController.deleteVideo.bind(videosController)
)
