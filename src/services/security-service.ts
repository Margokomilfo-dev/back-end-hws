import { securityRepository, SecurityType } from '../repositores/security-db-repository'

class SecurityService {
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
        await securityRepository.create(data)
    }
    async getSessionByDeviceId(deviceId: string): Promise<SecurityType | null> {
        return securityRepository.getSessionByDeviceId(deviceId)
    }

    async _getSessionByUserId(userId: string): Promise<SecurityType | null> {
        return securityRepository._getSessionByDeviceId(userId)
    }

    async _getSessionByUserIdAndDeviceId(
        userId: string,
        deviceId: string
    ): Promise<SecurityType | null> {
        return securityRepository._getSessionByUserIdAndDeviceId(userId, deviceId)
    }

    async getSessionsByUserId(userId: string): Promise<SecurityType[]> {
        return securityRepository.getSessionsByUserId(userId)
    }

    async update(deviceId: string, data: SecurityType): Promise<SecurityType | null> {
        return securityRepository.update(deviceId, data)
    }
    async deleteSession(deviceId: string): Promise<boolean> {
        return securityRepository.deleteSession(deviceId)
    }
    async deleteAllSessions(userId: string): Promise<boolean> {
        return securityRepository.deleteAllSessions(userId)
    }
    async deleteAllOtherSessions(userId: string, deviceId: string): Promise<boolean> {
        return securityRepository.deleteAllOtherSessions(userId, deviceId)
    }
    async deleteAll() {
        return securityRepository.deleteAll()
    }
}
export const securityService = new SecurityService()
