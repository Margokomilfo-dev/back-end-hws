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
import { container } from '../composition-root'
import { PostsController } from '../controllers/posts-controller'
import { ParamsValidatorsMiddleware } from '../assets/express-validator/param-validation-middleware'
import { CustomValidator } from '../assets/express-validator/custom-validators'
import { BearerAuthorizationMiddleware } from '../middlewares/bearer-authorization-middleware'

export const postsRouter = Router({})

const postsController = container.resolve(PostsController)
const paramsValidatorsMiddleware = container.resolve(ParamsValidatorsMiddleware)
const customValidator = container.resolve(CustomValidator)
const bearerAuthorizationMiddleware = container.resolve(BearerAuthorizationMiddleware)

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
