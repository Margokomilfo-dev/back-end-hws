import { SecurityRepository, SecurityType } from '../repositores/security-db-repository'
import { JwtService } from './jwt-service'

export class SecurityService {
    constructor(private securityRepository: SecurityRepository, private jwtService: JwtService) {}
    async create(
        deviceId: string,
        userId: string,
        dName: string,
        refreshTokenData: string,
        iAt: string,
        ip: string
    ): Promise<void> {
        const data = new SecurityType(
            userId,
            refreshTokenData,
            ip,
            dName,
            deviceId,
            new Date(iAt).toISOString()
        )
        await this.securityRepository.create(data)
    }
    async getSessionByDeviceId(deviceId: string): Promise<SecurityType | null> {
        return this.securityRepository.getSessionByDeviceId(deviceId)
    }
    async checkCookiesAndGetUserId(refreshToken: string | undefined): Promise<string | undefined> {
        if (refreshToken) {
            const data = await this.jwtService.verifyAndGetUserIdByToken(refreshToken)
            return data?.userId
        }
        return undefined
    }

    async _getSessionByUserId(userId: string): Promise<SecurityType | null> {
        return this.securityRepository._getSessionByDeviceId(userId)
    }

    async _getSessionByUserIdAndDeviceId(
        userId: string,
        deviceId: string
    ): Promise<SecurityType | null> {
        return this.securityRepository._getSessionByUserIdAndDeviceId(userId, deviceId)
    }

    async getSessionsByUserId(userId: string): Promise<SecurityType[]> {
        return this.securityRepository.getSessionsByUserId(userId)
    }

    async update(deviceId: string, data: SecurityType): Promise<SecurityType | null> {
        return this.securityRepository.update(deviceId, data)
    }
    async deleteSession(deviceId: string): Promise<boolean> {
        return this.securityRepository.deleteSession(deviceId)
    }
    async deleteAllSessions(userId: string): Promise<boolean> {
        return this.securityRepository.deleteAllSessions(userId)
    }
    async deleteAllOtherSessions(userId: string, deviceId: string): Promise<boolean> {
        return this.securityRepository.deleteAllOtherSessions(userId, deviceId)
    }
    async deleteAll() {
        return this.securityRepository.deleteAll()
    }
}
