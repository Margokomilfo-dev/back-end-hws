import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { UserType } from '../repositores/users-db-repository'

dotenv.config()
const secret = process.env.SECRET ? process.env.SECRET : 'hello'

export class JwtService {
    async createJWTToken(user: UserType): Promise<string> {
        return jwt.sign({ userId: user.id }, secret, {
            expiresIn: '10000',
        })
    }
    async createRefreshJWTToken(user: UserType, deviceId: string): Promise<string> {
        return jwt.sign({ userId: user.id, deviceId }, secret, {
            expiresIn: '20000',
        })
    }
    async verifyAndGetUserIdByToken(
        token: string
    ): Promise<{ userId: string; deviceId: string } | null> {
        try {
            const res: any = jwt.verify(token, secret)
            return { userId: res.userId, deviceId: res.deviceId }
        } catch (e) {
            return null
        }
    }
}

//export const jwtService = new JwtService()
