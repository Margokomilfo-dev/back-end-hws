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
import { checkCookiesAndUserMiddleware } from '../middlewares/getCookiesMiddleware'
import { rateLimitMiddleware } from '../middlewares/rate-limit-middleware'
import {
    authController,
    bearerAuthorizationMiddleware,
    commonMiddleware,
    customValidator,
    paramsValidatorsMiddleware,
} from '../composition-root'

export const authRouter = Router({})

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
