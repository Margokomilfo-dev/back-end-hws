import { SecurityModel } from '../mongo/security/security.model'
import { injectable } from 'inversify'

@injectable()
export class SecurityRepository {
    async create(data: SecurityType): Promise<void> {
        await SecurityModel.insertMany(data)
    }
    async getSessionByDeviceId(deviceId: string): Promise<SecurityType | null> {
        return SecurityModel.findOne({ deviceId })
    }

    async _getSessionByDeviceId(deviceId: string): Promise<SecurityType | null> {
        return SecurityModel.findOne({ deviceId })
    }

    async _getSessionByUserIdAndDeviceId(
        userId: string,
        deviceId: string
    ): Promise<SecurityType | null> {
        return SecurityModel.findOne({ userId, deviceId })
    }

    async getSessionsByUserId(userId: string): Promise<SecurityType[]> {
        return SecurityModel.find({ userId }, { userId: 0, refreshTokenData: 0, _id: 0, __v: 0 })
    }

    async update(deviceId: string, data: SecurityType): Promise<SecurityType | null> {
        await SecurityModel.findOneAndUpdate({ deviceId }, data)
        return SecurityModel.findOne({ deviceId })
    }

    async deleteSession(deviceId: string): Promise<boolean> {
        const res = await SecurityModel.deleteOne({ deviceId })
        return res.deletedCount > 0
    }

    async deleteAllSessions(userId: string): Promise<boolean> {
        const res = await SecurityModel.deleteMany({ userId })
        return res.deletedCount > 0
    }

    async deleteAllOtherSessions(userId: string, deviceId: string): Promise<boolean> {
        const res = await SecurityModel.deleteMany({
            userId,
            deviceId: { $ne: deviceId },
        })
        return res.deletedCount > 0
    }

    async deleteAll() {
        return SecurityModel.deleteMany({})
    }
}

export class SecurityType {
    constructor(
        public userId: string,
        public refreshTokenData: string,
        public ip: string,
        public title: string,
        public deviceId: string,
        public lastActiveDate: string
    ) {}
}
