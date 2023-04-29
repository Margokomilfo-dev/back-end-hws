import { Router } from 'express'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import {
    commentContentValidator,
    postBlogIdValidator,
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator,
} from '../assets/express-validator/field-validators'
import { basicAuthorizationMiddleware } from '../middlewares/basic-authorization-middleware'
import {
    bearerAuthorizationMiddleware,
    customValidator,
    paramsValidatorsMiddleware,
    postsController,
} from '../composition-root'

export const postsRouter = Router({})

postsRouter.get('/', postsController.getPosts.bind(postsController))

postsRouter.get(
    '/:postId/comments',
    paramsValidatorsMiddleware.postIdStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    postsController.getCommentsByPostId.bind(postsController)
)

postsRouter.post(
    '/',
    basicAuthorizationMiddleware,
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    postBlogIdValidator,
    customValidator._customIsBlogValidator,
    errorsResultMiddleware,
    postsController.createPost.bind(postsController)
)

postsRouter.post(
    '/:postId/comments',
    bearerAuthorizationMiddleware.auth.bind(bearerAuthorizationMiddleware),
    paramsValidatorsMiddleware.postIdStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    commentContentValidator,
    errorsResultMiddleware,
    postsController.createCommentByPostId.bind(postsController)
)

postsRouter.get('/:id', postsController.getComment.bind(postsController))

postsRouter.put(
    '/:id',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    postBlogIdValidator,
    customValidator._customIsBlogValidator.bind(customValidator),
    errorsResultMiddleware,
    postsController.updateComment.bind(postsController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
postsRouter.delete(
    '/:id',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    postsController.deleteComment.bind(postsController)
)
