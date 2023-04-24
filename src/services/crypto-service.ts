import bcrypt from 'bcrypt'
import { UserType } from '../repositores/users-db-repository'

class CryptoService {
    async _generateSalt() {
        return bcrypt.genSalt(10)
    }
    async _generateHash(password: string, salt: string) {
        return bcrypt.hash(password, salt)
    }
    async _compareHash(password: string, user: UserType) {
        return bcrypt.compare(password, user.passwordHash)
    }
}

export const cryptoService = new CryptoService()
