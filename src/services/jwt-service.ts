import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { UserType } from '../repositores/users-db-repository'

dotenv.config()
const secret = process.env.SECRET ? process.env.SECRET : 'hello'
export const jwtService = {
    async createJWTToken(user: UserType): Promise<string> {
        return jwt.sign({ userId: user.id }, secret, {
            expiresIn: '10000',
        })
    },
    async createRefreshJWTToken(user: UserType): Promise<string> {
        return jwt.sign({ userId: user.id }, secret, {
            expiresIn: '20000',
        })
    },
    async getUserIdByToken(token: string): Promise<string | null> {
        try {
            const res: any = jwt.verify(token, secret)
            return res.userId
        } catch (e) {
            return null
        }
    },
}
