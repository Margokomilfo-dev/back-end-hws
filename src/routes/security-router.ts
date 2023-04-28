import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import { checkCookiesAndUserMiddleware } from '../middlewares/getCookiesMiddleware'
import { JwtService } from '../services/jwt-service'
import { SecurityService } from '../services/security-service'

export const securityRouter = Router({})
class SecurityController {
    securityService: SecurityService
    jwtService: JwtService
    constructor() {
        this.securityService = new SecurityService()
        this.jwtService = new JwtService()
    }
    async getDevices(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const data = await this.jwtService.verifyAndGetUserIdByToken(
            refreshToken
        )
        const devices = await this.securityService.getSessionsByUserId(
            data!.userId
        )
        res.status(CodeResponsesEnum.Success_200).send(devices)
    }
    async deleteDevices(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const data = await this.jwtService.verifyAndGetUserIdByToken(
            refreshToken
        )
        await this.securityService.deleteAllOtherSessions(
            data!.userId,
            data!.deviceId
        )
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteDevice(req: Request, res: Response) {
        const deviceId = req.params.deviceId
        const refreshToken = req.cookies.refreshToken
        const data = await this.jwtService.verifyAndGetUserIdByToken(
            refreshToken
        )
        const sessionWithThisDeviceId =
            await this.securityService.getSessionByDeviceId(deviceId)
        if (!sessionWithThisDeviceId) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        if (
            sessionWithThisDeviceId &&
            sessionWithThisDeviceId.userId !== data!.userId
        ) {
            res.sendStatus(CodeResponsesEnum.Forbidden_403)
            return
        }
        const result = await this.securityService.deleteSession(deviceId)
        if (!result) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
}
const securityController = new SecurityController()

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
securityRouter.get(
    '/devices',
    checkCookiesAndUserMiddleware.checkCookiesAndUser.bind(
        checkCookiesAndUserMiddleware
    ),
    securityController.getDevices.bind(securityController)
)
securityRouter.delete(
    '/devices',
    checkCookiesAndUserMiddleware.checkCookiesAndUser.bind(
        checkCookiesAndUserMiddleware
    ),
    securityController.deleteDevices.bind(securityController)
)
securityRouter.delete(
    '/devices/:deviceId',
    checkCookiesAndUserMiddleware.checkCookiesAndUser.bind(
        checkCookiesAndUserMiddleware
    ),
    securityController.deleteDevice.bind(securityController)
)
