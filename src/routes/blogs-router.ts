import { Router } from 'express'
import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator,
    postContentValidator,
    postShortDescriptionValidator,
    postTitleValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { basicAuthorizationMiddleware } from '../middlewares/basic-authorization-middleware'
import { container } from '../composition-root'
import { BlogsController } from '../controllers/blogs-controller'
import { ParamsValidatorsMiddleware } from '../assets/express-validator/param-validation-middleware'

export const blogsRouter = Router({})
const blogsController = container.resolve(BlogsController)
const paramsValidatorsMiddleware = container.resolve(ParamsValidatorsMiddleware)

blogsRouter.get('/', blogsController.getBlogs.bind(blogsController))
blogsRouter.post(
    '/',
    basicAuthorizationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorsResultMiddleware,
    blogsController.createBlog.bind(blogsController)
)

blogsRouter.post(
    '/:blogId/posts',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.blogIdStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    postTitleValidator,
    postShortDescriptionValidator,
    postContentValidator,
    errorsResultMiddleware,
    blogsController.createPostForBlog.bind(blogsController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.get(
    '/:id',
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    blogsController.getBlog.bind(blogsController)
)

blogsRouter.get(
    '/:blogId/posts',
    paramsValidatorsMiddleware.blogIdStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    blogsController.getPostsByBlogId.bind(blogsController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.put(
    '/:id',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorsResultMiddleware,
    blogsController.updateBlog.bind(blogsController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
blogsRouter.delete(
    '/:id',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(paramsValidatorsMiddleware),
    blogsController.deleteBlog.bind(blogsController)
)
