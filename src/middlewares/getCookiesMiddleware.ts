import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { jwtService } from '../services/jwt-service'
import { usersService } from '../services/users-service'

export const checkCookiesAndUserMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        return
    }
    const userId = await jwtService.getUserIdByToken(refreshToken)
    if (!userId) {
        res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        return
    }
    const user = await usersService._getUserById(userId)
    if (!user) {
        res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        return
    }
    next()
}
