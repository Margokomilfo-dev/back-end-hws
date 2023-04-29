import { Router } from 'express'
import {
    emailValidator,
    loginValidator,
    passwordValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { basicAuthorizationMiddleware } from '../middlewares/basic-authorization-middleware'
import { paramsValidatorsMiddleware, usersController } from '../composition-root'

export const usersRouter = Router({})

usersRouter.get('/', basicAuthorizationMiddleware, usersController.getUsers.bind(usersController))
usersRouter.post(
    '/',
    basicAuthorizationMiddleware,
    loginValidator,
    passwordValidator,
    emailValidator,
    errorsResultMiddleware,
    usersController.createUser.bind(usersController)
)
usersRouter.delete(
    '/:id',
    basicAuthorizationMiddleware,
    paramsValidatorsMiddleware.userExistedParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    usersController.deleteUser.bind(usersController)
)
