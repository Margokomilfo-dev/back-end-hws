import mongoose from 'mongoose'
import { RateSchema } from './rate.schema'

export const RateModel = mongoose.model('rate', RateSchema)
