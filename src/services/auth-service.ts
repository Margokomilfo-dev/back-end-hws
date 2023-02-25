import { cryptoService } from './crypto-service'
import { usersService } from './users-service'

export const authService = {
    async checkCredentials(
        loginOrEmail: string,
        password: string
    ): Promise<boolean> {
        const user = await usersService.getUserByLoginOrEmail(loginOrEmail)
        console.log('user:', user)
        if (!user) return false
        return cryptoService._compareHash(password, user)
    },
}
