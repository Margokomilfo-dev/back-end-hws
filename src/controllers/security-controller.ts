import { SecurityService } from '../services/security-service'
import { JwtService } from '../services/jwt-service'
import { Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'

export class SecurityController {
    constructor(private securityService: SecurityService, private jwtService: JwtService) {}
    async getDevices(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const data = await this.jwtService.verifyAndGetUserIdByToken(refreshToken)
        const devices = await this.securityService.getSessionsByUserId(data!.userId)
        res.status(CodeResponsesEnum.Success_200).send(devices)
    }
    async deleteDevices(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const data = await this.jwtService.verifyAndGetUserIdByToken(refreshToken)
        await this.securityService.deleteAllOtherSessions(data!.userId, data!.deviceId)
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteDevice(req: Request, res: Response) {
        const deviceId = req.params.deviceId
        const refreshToken = req.cookies.refreshToken
        const data = await this.jwtService.verifyAndGetUserIdByToken(refreshToken)
        const sessionWithThisDeviceId = await this.securityService.getSessionByDeviceId(deviceId)
        if (!sessionWithThisDeviceId) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        if (sessionWithThisDeviceId && sessionWithThisDeviceId.userId !== data!.userId) {
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
