import { Router } from 'express'
import {
    codeValidator,
    emailValidator,
    loginValidator,
    newPasswordValidator,
    passwordValidator,
    recoveryCodeValidator,
    userLoginOrEmailValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { CheckCookiesAndUserMiddleware } from '../middlewares/getCookiesMiddleware'
import { container } from '../composition-root'
import { AuthController } from '../controllers/auth-controller'
import { CommonMiddleware } from '../middlewares/common-middleware'
import { ParamsValidatorsMiddleware } from '../assets/express-validator/param-validation-middleware'
import { CustomValidator } from '../assets/express-validator/custom-validators'
import { BearerAuthorizationMiddleware } from '../middlewares/bearer-authorization-middleware'
import { RateLimitMiddleware } from '../middlewares/rate-limit-middleware'

export const authRouter = Router({})

const authController = container.resolve(AuthController)
const commonMiddleware = container.resolve(CommonMiddleware)
const paramsValidatorsMiddleware = container.resolve(ParamsValidatorsMiddleware)
const customValidator = container.resolve(CustomValidator)
const bearerAuthorizationMiddleware = container.resolve(BearerAuthorizationMiddleware)
const rateLimitMiddleware = container.resolve(RateLimitMiddleware)
const checkCookiesAndUserMiddleware = container.resolve(CheckCookiesAndUserMiddleware)

authRouter.post(
    '/login',
    rateLimitMiddleware.middleware.bind(rateLimitMiddleware),
    userLoginOrEmailValidator,
    passwordValidator,
    errorsResultMiddleware,
    authController.login.bind(authController)
)

authRouter.post(
    '/password-recovery',
    rateLimitMiddleware.middleware.bind(rateLimitMiddleware),
    emailValidator,
    errorsResultMiddleware,
    authController.passwordRecovery.bind(authController)
)

authRouter.post(
    '/refresh-token',
    checkCookiesAndUserMiddleware.checkCookiesAndUser.bind(checkCookiesAndUserMiddleware),
    authController.refreshToken.bind(authController)
)

authRouter.post(
    '/new-password',
    rateLimitMiddleware.middleware.bind(rateLimitMiddleware),
    newPasswordValidator,
    recoveryCodeValidator,
    errorsResultMiddleware,
    commonMiddleware.userIsExist.bind(commonMiddleware),
    authController.newPassword.bind(authController)
)
authRouter.post(
    '/registration',
    rateLimitMiddleware.middleware.bind(rateLimitMiddleware),
    loginValidator,
    passwordValidator,
    emailValidator,
    paramsValidatorsMiddleware.isLoginOrEmailExistsValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    errorsResultMiddleware,
    authController.registration.bind(authController)
)
authRouter.post(
    '/registration-confirmation',
    rateLimitMiddleware.middleware.bind(rateLimitMiddleware),
    codeValidator,
    customValidator._customUserValidator.bind(customValidator),
    errorsResultMiddleware,
    authController.registrationConfirmation.bind(authController)
)

authRouter.post(
    '/registration-email-resending',
    rateLimitMiddleware.middleware.bind(rateLimitMiddleware),
    emailValidator,
    customValidator._customIsUserValidator.bind(customValidator),
    errorsResultMiddleware,
    authController.registrationEmailResending.bind(authController)
)
authRouter.post(
    '/logout',
    checkCookiesAndUserMiddleware.checkCookiesAndUser.bind(checkCookiesAndUserMiddleware),
    authController.logout.bind(authController)
)

authRouter.get(
    '/me',
    bearerAuthorizationMiddleware.auth.bind(bearerAuthorizationMiddleware),
    authController.me.bind(authController)
)
