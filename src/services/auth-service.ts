import { cryptoService } from './crypto-service'
import { usersService } from './users-service'

export const authService = {
    async checkCredentials(
        loginOrEmail: string,
        password: string
    ): Promise<boolean> {
        const user = await usersService.getUserByLoginOrEmail(loginOrEmail)
        if (!user) return false
        return cryptoService._compareHash(password, user)
    },
}
