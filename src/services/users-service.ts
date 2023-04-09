import { usersRepository, UserType } from '../repositores/users-db-repository'
import { cryptoService } from './crypto-service'
import { v4 as uuidv4 } from 'uuid'
import dateFns from 'date-fns/addMinutes'

export const usersService = {
    async getUsers(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        searchLoginTerm: string | null,
        searchEmailTerm: string | null
    ): Promise<UserType[]> {
        return usersRepository.getUsers(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm
        )
    },
    async getUserById(id: string): Promise<UserType | null> {
        return usersRepository.getUserById(id)
    },
    async _getUserById(id: string): Promise<UserType | null> {
        return usersRepository._getUserById(id)
    },
    async getAndUpdateUserByConfirmationCode(code: string): Promise<UserType | null> {
        return usersRepository.getAndUpdateUserByConfirmationCode(code)
    },

    async getUserByConfirmationCode(code: string): Promise<UserType | null> {
        return usersRepository.getUserByConfirmationCode(code)
    },

    async updateUserConfirmationCode(id: string): Promise<UserType | null> {
        return usersRepository.updateUserConfirmationCode(id)
    },

    async updateRefreshToken(id: string, refreshToken: string | null): Promise<UserType | null> {
        return usersRepository.updateRefreshToken(id, refreshToken)
    },

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
        return usersRepository.getUserByLoginOrEmail(loginOrEmail)
    },

    async createUser(login: string, email: string, password: string): Promise<UserType | null> {
        const getUser1 = await usersRepository.getUserByLoginOrEmail(login)
        const getUser2 = await usersRepository.getUserByLoginOrEmail(email)
        if (getUser1 || getUser2) {
            return null
        }
        const salt = await cryptoService._generateSalt()
        const passwordHash = await cryptoService._generateHash(password, salt)
        const newUser: UserType = {
            id: new Date().getTime().toString(),
            login,
            createdAt: new Date().toISOString(),
            email,
            passwordHash,
            confirmationData: {
                data: dateFns(new Date(), 10),
                isConfirmed: false,
                code: uuidv4(),
            },
            refreshToken: null,
        }
        return usersRepository.createUser(newUser)
    },
    async deleteUser(id: string) {
        return usersRepository.deleteUser(id)
    },
}
