import { Router } from 'express'
import {
    emailValidator,
    loginValidator,
    passwordValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { basicAuthorizationMiddleware } from '../middlewares/basic-authorization-middleware'
import { container } from '../composition-root'
import { UsersController } from '../controllers/users-controller'
import { ParamsValidatorsMiddleware } from '../assets/express-validator/param-validation-middleware'

export const usersRouter = Router({})
const usersController = container.resolve(UsersController)
const paramsValidatorsMiddleware = container.resolve(ParamsValidatorsMiddleware)

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
