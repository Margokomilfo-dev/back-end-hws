import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { jwtService } from '../services/jwt-service'
import { usersService } from '../services/users-service'

export const bearerAuthorizationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.headers.authorization) {
        res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        return
    }
    const token = req.headers.authorization.split(' ')[1]
    const userId = await jwtService.getUserIdByToken(token)

    if (userId) {
        const user = await usersService.getUserById(userId)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
            return
        }
        req.userId = user.id
        req.userLogin = user.login
        next()
        return
    }
    res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
}
