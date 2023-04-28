import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { JwtService } from '../services/jwt-service'
import { UsersService } from '../services/users-service'

class BearerAuthorizationMiddleware {
    usersService: UsersService
    jwtService: JwtService
    constructor() {
        this.usersService = new UsersService()
        this.jwtService = new JwtService()
    }

    async auth(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
            return
        }
        const token = req.headers.authorization.split(' ')[1]
        const data = await this.jwtService.verifyAndGetUserIdByToken(token)

        if (data && data.userId) {
            const user = await this.usersService.getUserById(data.userId)
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
}
export const bearerAuthorizationMiddleware = new BearerAuthorizationMiddleware()

// export class bearerAuthorizationMiddleware = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     if (!req.headers.authorization) {
//         res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
//         return
//     }
//     const token = req.headers.authorization.split(' ')[1]
//     const data = await jwtService.verifyAndGetUserIdByToken(token)
//
//     if (data && data.userId) {
//         const user = await usersService.getUserById(data.userId)
//         if (!user) {
//             res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
//             return
//         }
//         req.userId = user.id
//         req.userLogin = user.login
//         next()
//         return
//     }
//     res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
// }
