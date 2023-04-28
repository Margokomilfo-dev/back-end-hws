import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { JwtService } from '../services/jwt-service'
import { firstPartsOfJWTToken } from '../assets/jwt-parse'
import { SecurityRepository } from '../repositores/security-db-repository'

class CheckCookiesAndUserMiddleware {
    securityRepository: SecurityRepository
    jwtService: JwtService
    constructor() {
        this.securityRepository = new SecurityRepository()
        this.jwtService = new JwtService()
    }
    async checkCookiesAndUser(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
            return
        }
        const firstPartOfToken = firstPartsOfJWTToken(refreshToken)
        const data = await this.jwtService.verifyAndGetUserIdByToken(
            refreshToken
        )

        if (!data) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
            return
        }
        const session =
            await this.securityRepository._getSessionByUserIdAndDeviceId(
                data.userId,
                data.deviceId
            )

        if (
            !session ||
            (session && session.refreshTokenData !== firstPartOfToken)
        ) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
            return
        }

        next()
    }
}
export const checkCookiesAndUserMiddleware = new CheckCookiesAndUserMiddleware()

// export const checkCookiesAndUserMiddleware = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     const refreshToken = req.cookies.refreshToken
//     if (!refreshToken) {
//         res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
//         return
//     }
//     const firstPartOfToken = firstPartsOfJWTToken(refreshToken)
//     const data = await jwtService.verifyAndGetUserIdByToken(refreshToken)
//
//     if (!data) {
//         res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
//         return
//     }
//     const session = await securityRepository._getSessionByUserIdAndDeviceId(
//         data.userId,
//         data.deviceId
//     )
//
//     if (
//         !session ||
//         (session && session.refreshTokenData !== firstPartOfToken)
//     ) {
//         res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
//         return
//     }
//
//     next()
// }
