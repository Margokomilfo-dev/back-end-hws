import { Router } from 'express'

import { commentContentValidator } from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import {
    bearerAuthorizationMiddleware,
    commentController,
    commonMiddleware,
    paramsValidatorsMiddleware,
} from '../composition-root'

export const commentsRouter = Router({})

commentsRouter.get(
    '/:id',
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    commentController.getComment.bind(commentController)
)

commentsRouter.put(
    '/:id',
    bearerAuthorizationMiddleware.auth.bind(bearerAuthorizationMiddleware),
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    commentContentValidator,
    commonMiddleware.isMineComment.bind(commonMiddleware),
    errorsResultMiddleware,
    commentController.updateComment.bind(commentController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
commentsRouter.delete(
    '/:id',
    bearerAuthorizationMiddleware.auth.bind(bearerAuthorizationMiddleware),
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    commonMiddleware.isMineComment.bind(commonMiddleware),
    commentController.deleteComment.bind(commentController)
)
