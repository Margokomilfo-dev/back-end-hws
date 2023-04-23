import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import { checkCookiesAndUserMiddleware } from '../middlewares/getCookiesMiddleware'
import { jwtService } from '../services/jwt-service'
import { securityService } from '../services/security-service'

export const securityRouter = Router({})
class SecurityController {
    async getDevices(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const data = await jwtService.verifyAndGetUserIdByToken(refreshToken)
        const devices = await securityService.getSessionsByUserId(data!.userId)
        res.status(CodeResponsesEnum.Success_200).send(devices)
    }
    async deleteDevices(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const data = await jwtService.verifyAndGetUserIdByToken(refreshToken)
        await securityService.deleteAllOtherSessions(data!.userId, data!.deviceId)
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteDevice(req: Request, res: Response) {
        const deviceId = req.params.deviceId
        const refreshToken = req.cookies.refreshToken
        const data = await jwtService.verifyAndGetUserIdByToken(refreshToken)
        const sessionWithThisDeviceId = await securityService.getSessionByDeviceId(deviceId)
        if (!sessionWithThisDeviceId) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        if (sessionWithThisDeviceId && sessionWithThisDeviceId.userId !== data!.userId) {
            res.sendStatus(CodeResponsesEnum.Forbidden_403)
            return
        }
        const result = await securityService.deleteSession(deviceId)
        if (!result) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
}
const securityController = new SecurityController()

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
securityRouter.get('/devices', checkCookiesAndUserMiddleware, securityController.getDevices)
securityRouter.delete('/devices', checkCookiesAndUserMiddleware, securityController.deleteDevices)
securityRouter.delete(
    '/devices/:deviceId',
    checkCookiesAndUserMiddleware,
    securityController.deleteDevice
)
