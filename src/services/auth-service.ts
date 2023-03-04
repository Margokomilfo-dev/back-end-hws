import { cryptoService } from './crypto-service'
import { usersService } from './users-service'
import { UserType } from '../repositores/users-db-repository'

export const authService = {
    async checkCredentials(
        loginOrEmail: string,
        password: string
    ): Promise<UserType | null> {
        const user = await usersService.getUserByLoginOrEmail(loginOrEmail)
        if (!user) return null
        const res = await cryptoService._compareHash(password, user)
        if (!res) return null
        return user
    },
}
