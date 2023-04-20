import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { UserType } from '../../repositores/users-db-repository'

export const UserSchema = new mongoose.Schema<WithId<UserType>>({
    id: { type: String, require: true },
    login: { type: String, require: true },
    email: { type: String, require: true },
    createdAt: { type: String, require: true },
    passwordHash: { type: String, require: true },
    confirmationData: {
        isConfirmed: { type: Boolean, default: false },
        data: { type: Date, default: null },
        code: { type: String, require: true },
    },
})
