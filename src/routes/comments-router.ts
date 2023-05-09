import { Router } from 'express'

import {
    commentContentValidator,
    likeStatusValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { container } from '../composition-root'
import { ParamsValidatorsMiddleware } from '../assets/express-validator/param-validation-middleware'
import { CommentsController } from '../controllers/comments-controller'
import { CommonMiddleware } from '../middlewares/common-middleware'
import { BearerAuthorizationMiddleware } from '../middlewares/bearer-authorization-middleware'

export const commentsRouter = Router({})

const commentController = container.resolve(CommentsController)
const paramsValidatorsMiddleware = container.resolve(ParamsValidatorsMiddleware)
const commonMiddleware = container.resolve(CommonMiddleware)
const bearerAuthorizationMiddleware = container.resolve(BearerAuthorizationMiddleware)

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
commentsRouter.put(
    '/:commentId/like-status',
    bearerAuthorizationMiddleware.auth.bind(bearerAuthorizationMiddleware),
    likeStatusValidator,
    errorsResultMiddleware,
    commentController.updateCommentLikes.bind(commentController)
)

commentsRouter.delete(
    '/:id',
    bearerAuthorizationMiddleware.auth.bind(bearerAuthorizationMiddleware),
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    commonMiddleware.isMineComment.bind(commonMiddleware),
    commentController.deleteComment.bind(commentController)
)
