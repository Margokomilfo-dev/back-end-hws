import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { UserType } from '../repositores/users-db-repository'

dotenv.config()

export const jwtService = {
    async createJWTToken(user: UserType): Promise<string> {
        return jwt.sign({ userId: user.id }, process.env.SECRET ? process.env.SECRET : 'hello', {
            expiresIn: '1h',
        })
    },
    async getUserIdByToken(token: string): Promise<string | null> {
        try {
            const res: any = jwt.verify(token, process.env.SECRET ? process.env.SECRET : 'hello')
            return res.userId
        } catch (e) {
            return null
        }
    },
}
