import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import {
    codeValidator,
    emailValidator,
    loginValidator,
    passwordValidator,
    userLoginOrEmailValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { authService } from '../services/auth-service'
import { bearerAuthorizationMiddleware } from '../middlewares/bearer-authorization-middleware'
import { jwtService } from '../services/jwt-service'
import { usersService } from '../services/users-service'
import {
    _customIsUserValidator,
    _customUserValidator,
} from '../assets/express-validator/custom-validators'
import { isLoginOrEmailExistsValidationMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { checkCookiesAndUserMiddleware } from '../middlewares/getCookiesMiddleware'

export const authRouter = Router({})

authRouter.post(
    '/login',
    userLoginOrEmailValidator,
    passwordValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const password = req.body.password
        const loginOrEmail = req.body.loginOrEmail
        const user = await authService.checkCredentials(loginOrEmail, password)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        } else {
            const token = await jwtService.createJWTToken(user)
            const refreshToken = await jwtService.createRefreshJWTToken(user)
            await usersService.updateRefreshToken(user.id, refreshToken)
            res.cookie('refreshToken', refreshToken, {
                //maxAge: 20000,
                httpOnly: true,
                secure: true,
            })
            res.status(CodeResponsesEnum.Success_200).send({
                accessToken: token,
            })
        }
    }
)

authRouter.post(
    '/refresh-token',
    checkCookiesAndUserMiddleware,
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken
        const userId = await jwtService.getUserIdByToken(refreshToken)
        const user = await usersService._getUserById(userId!)
        const token = await jwtService.createJWTToken(user!)
        const newRefreshToken = await jwtService.createRefreshJWTToken(user!)
        await usersService.updateRefreshToken(user!.id, newRefreshToken)
        res.cookie('refreshToken', newRefreshToken, {
            //maxAge: 20000,
            httpOnly: true,
            secure: true,
        })
        res.status(CodeResponsesEnum.Success_200).send({
            accessToken: token,
        })
    }
)

authRouter.post(
    '/registration',
    loginValidator,
    passwordValidator,
    emailValidator,
    isLoginOrEmailExistsValidationMiddleware,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const login = req.body.login
        const password = req.body.password
        const email = req.body.email

        const createdUser = await usersService.createUser(login, email, password)

        if (!createdUser) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        const user = await usersService._getUserById(createdUser.id)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        const sendEmail = await authService.registrationSendEmail(email, user.confirmationData.code)
        if (!sendEmail) {
            res.status(CodeResponsesEnum.Incorrect_values_400).send({
                errorsMessages: [
                    {
                        message:
                            'сообщение не отправилось на почту, попробуй произвести регистрацию на другой почтовый адрес',
                        field: 'email',
                    },
                ],
            })
            return
        }

        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
)
authRouter.post(
    '/registration-confirmation',
    codeValidator,
    _customUserValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const code = req.body.code
        await usersService.getAndUpdateUserByConfirmationCode(code)
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
)

authRouter.post(
    '/registration-email-resending',
    emailValidator,
    _customIsUserValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const email = req.body.email
        const user = await usersService.getUserByLoginOrEmail(email)
        const updUser = await usersService.updateUserConfirmationCode(user!.id)
        if (!updUser) {
            res.sendStatus(405)
            return
        }
        const sendEmail = await authService.resendingEmail(email, updUser.confirmationData.code)
        if (!sendEmail) {
            res.sendStatus(406)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
)
authRouter.post('/logout', checkCookiesAndUserMiddleware, async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken
    const userId = await jwtService.getUserIdByToken(refreshToken)
    const user = await usersService._getUserById(userId!)
    await usersService.updateRefreshToken(user!.id, null)
    res.sendStatus(CodeResponsesEnum.Not_content_204)
})

authRouter.get('/me', bearerAuthorizationMiddleware, async (req: Request, res: Response) => {
    const user = await usersService.getUserById(req.userId!)
    if (!user) {
        res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        return
    }
    const { id, email, login } = user
    res.status(CodeResponsesEnum.Success_200).send({
        email,
        login,
        userId: id,
    })
})
