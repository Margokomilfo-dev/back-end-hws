import mongoose from 'mongoose'
import { SecuritySchema } from './security.schema'

export const SecurityModel = mongoose.model('security', SecuritySchema)
