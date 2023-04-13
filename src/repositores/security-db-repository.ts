import { securityCollection } from '../mongo/db'

export const securityRepository = {
    async create(data: SecurityType): Promise<void> {
        await securityCollection.insertOne(data)
    },
    async getSessionByDeviceId(deviceId: string): Promise<SecurityType | null> {
        return securityCollection.findOne({ deviceId })
    },

    async _getSessionByDeviceId(deviceId: string): Promise<SecurityType | null> {
        return securityCollection.findOne({ deviceId })
    },

    async _getSessionByUserIdAndDeviceId(
        userId: string,
        deviceId: string
    ): Promise<SecurityType | null> {
        return securityCollection.findOne({ userId, deviceId })
    },

    async getSessionsByUserId(userId: string): Promise<SecurityType[]> {
        return securityCollection
            .find({ userId }, { projection: { userId: 0, refreshTokenData: 0 } })
            .toArray()
    },

    async update(deviceId: string, data: SecurityType): Promise<SecurityType | null> {
        await securityCollection.findOneAndUpdate({ deviceId }, { $set: data })
        return securityCollection.findOne({ deviceId })
    },
    async deleteSession(deviceId: string): Promise<boolean> {
        const res = await securityCollection.deleteOne({ deviceId })
        return res.deletedCount > 0
    },
    async deleteAllSessions(userId: string): Promise<boolean> {
        const res = await securityCollection.deleteMany({ userId })
        return res.deletedCount > 0
    },
    async deleteAllOtherSessions(userId: string, deviceId: string): Promise<boolean> {
        const res = await securityCollection.deleteMany({ userId, deviceId: { $ne: deviceId } })
        return res.deletedCount > 0
    },
    async deleteAll() {
        return securityCollection.deleteMany({})
    },
}
export type SecurityType = {
    userId: string
    refreshTokenData: string

    ip: string
    title: string
    deviceId: string
    lastActiveDate: string
}
