import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { SecurityType } from '../../repositores/security-db-repository'

export const SecuritySchema = new mongoose.Schema<WithId<SecurityType>>({
    userId: { type: String, require: true },
    refreshTokenData: { type: String, require: true },
    ip: { type: String, require: true },
    title: { type: String, require: true },
    deviceId: { type: String, require: true },
    lastActiveDate: { type: String, require: true },
})
