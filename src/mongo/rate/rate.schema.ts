import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { AttemptType } from '../../repositores/rate-db-repository'

export const RateSchema = new mongoose.Schema<WithId<AttemptType>>({
    url: { type: String, require: true },
    ip: { type: String, require: true },
    date: { type: Date, require: true },
})
