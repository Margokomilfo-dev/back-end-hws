import mongoose from 'mongoose'
import { UserSchema } from './user.schema'

export const UserModel = mongoose.model('users', UserSchema)
