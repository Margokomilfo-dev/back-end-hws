import { JwtService } from '../services/jwt-service'
import { UsersService } from '../services/users-service'
import { UsersRepository } from '../repositores/users-db-repository'
import { CryptoService } from '../services/crypto-service'

export const getBearerUserIdFromHeaders = async (
    authorization: string | undefined
): Promise<null | { userId: string; userLogin: string }> => {
    const jwtService = new JwtService()
    const usersService = new UsersService(new UsersRepository(), new CryptoService())
    if (!authorization) {
        return null
    }
    const token = authorization.split(' ')[1]
    const data = await jwtService.verifyAndGetUserIdByToken(token)

    if (data && data.userId) {
        const user = await usersService.getUserById(data.userId)
        if (!user) {
            return null
        }
        return { userId: user.id, userLogin: user.login }
    }
    return null
}
