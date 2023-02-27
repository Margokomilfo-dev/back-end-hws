import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import {
    userLoginOrEmailValidator,
    userPasswordValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { authService } from '../services/auth-service'

export const authRouter = Router({})

authRouter.post(
    '/login',
    userLoginOrEmailValidator,
    userPasswordValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const password = req.body.password
        const loginOrEmail = req.body.loginOrEmail
        const checkUser = await authService.checkCredentials(
            loginOrEmail,
            password
        )
        if (!checkUser) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        } else res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
)
