import { UsersRepository, UserType } from '../repositores/users-db-repository'
import { CryptoService } from './crypto-service'
import { v4 as uuidv4 } from 'uuid'
import dateFns from 'date-fns/addMinutes'

export class UsersService {
    constructor(private usersRepository: UsersRepository, private cryptoService: CryptoService) {}
    async getUsers(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        searchLoginTerm: string | null,
        searchEmailTerm: string | null
    ): Promise<UserType[]> {
        return this.usersRepository.getUsers(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm
        )
    }

    async getUserById(id: string): Promise<UserType | null> {
        return this.usersRepository.getUserById(id)
    }
    async getUsersCount(
        searchLoginTerm: string | null,
        searchEmailTerm: string | null
    ): Promise<number> {
        return this.usersRepository.getUsersCount(searchLoginTerm, searchEmailTerm)
    }

    async _getUserById(id: string): Promise<UserType | null> {
        return this.usersRepository._getUserById(id)
    }

    async getAndUpdateUserByConfirmationCode(code: string): Promise<UserType | null> {
        return this.usersRepository.getAndUpdateUserByConfirmationCode(code)
    }

    async getUserByConfirmationCode(code: string): Promise<UserType | null> {
        return this.usersRepository.getUserByConfirmationCode(code)
    }

    async updateUserConfirmationCode(id: string): Promise<UserType | null> {
        return this.usersRepository.updateUserConfirmationCode(id)
    }

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
        return this.usersRepository.getUserByLoginOrEmail(loginOrEmail)
    }

    async createUser(login: string, email: string, password: string): Promise<UserType | null> {
        const getUser1 = await this.usersRepository.getUserByLoginOrEmail(login)
        const getUser2 = await this.usersRepository.getUserByLoginOrEmail(email)
        if (getUser1 || getUser2) {
            return null
        }
        const salt = await this.cryptoService._generateSalt()
        const passwordHash = await this.cryptoService._generateHash(password, salt)
        const newUser = new UserType(
            new Date().getTime().toString(),
            login,
            email,
            new Date().toISOString(),
            passwordHash,
            {
                data: dateFns(new Date(), 10),
                isConfirmed: false,
                code: uuidv4(),
            }
        )
        return this.usersRepository.createUser(newUser)
    }

    async updateUserPassword(id: string, newPassword: string): Promise<UserType | null> {
        const user = await this.usersRepository.getUserById(id)
        if (!user) {
            return null
        }
        const salt = await this.cryptoService._generateSalt()
        const passwordHash = await this.cryptoService._generateHash(newPassword, salt)
        return this.usersRepository.updateUserPassword(id, passwordHash)
    }
    async deleteUser(id: string) {
        return this.usersRepository.deleteUser(id)
    }
}
