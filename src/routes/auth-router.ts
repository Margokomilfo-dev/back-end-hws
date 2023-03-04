import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import {
    userLoginOrEmailValidator,
    userPasswordValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { authService } from '../services/auth-service'
import { bearerAuthorizationMiddleware } from '../middlewares/bearer-authorization-middleware'
import { jwtService } from '../services/jwt-service'
import { usersService } from '../services/users-service'

export const authRouter = Router({})

authRouter.post(
    '/login',
    userLoginOrEmailValidator,
    userPasswordValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const password = req.body.password
        const loginOrEmail = req.body.loginOrEmail
        const user = await authService.checkCredentials(loginOrEmail, password)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        } else {
            const token = await jwtService.createJWTToken(user)
            res.status(CodeResponsesEnum.Success_200).send({
                accessToken: token,
            })
        }
    }
)
authRouter.get(
    '/me',
    bearerAuthorizationMiddleware,
    async (req: Request, res: Response) => {
        const user = await usersService.getUserById(req.userId!)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        } else
            res.status(CodeResponsesEnum.Success_200).send({
                email: user.email,
                login: user.login,
                userId: user.id,
            })
    }
)
