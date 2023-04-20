import { v4 as uuidv4 } from 'uuid'
import dateFns from 'date-fns/addMinutes'
import { UserModel } from '../mongo/user/user.model'

export const usersRepository = {
    async getUsers(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        searchLoginTerm: string | null,
        searchEmailTerm: string | null
    ): Promise<UserType[]> {
        const filter: any = {}
        if (searchLoginTerm && !searchEmailTerm) {
            filter.login = { $regex: searchLoginTerm, $options: 'i' }
        }
        if (searchEmailTerm && !searchLoginTerm) {
            filter.email = { $regex: searchEmailTerm, $options: 'i' }
        }
        if (searchEmailTerm && searchLoginTerm) {
            filter.$or = [
                { login: { $regex: searchLoginTerm, $options: 'i' } },
                { email: { $regex: searchEmailTerm, $options: 'i' } },
            ]
        }
        return UserModel.find(filter, {
            _id: 0,
            passwordHash: 0,
            confirmationData: 0,
            __v: 0,
        })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
    },
    async getUsersCount(
        searchLoginTerm: string | null,
        searchEmailTerm: string | null
    ): Promise<number> {
        const filter: any = {}
        if (searchLoginTerm && !searchEmailTerm) {
            filter.login = { $regex: searchLoginTerm, $options: 'i' }
        }
        if (searchEmailTerm && !searchLoginTerm) {
            filter.email = { $regex: searchEmailTerm, $options: 'i' }
        }
        if (searchEmailTerm && searchLoginTerm) {
            filter.$or = [
                { login: { $regex: searchLoginTerm, $options: 'i' } },
                { email: { $regex: searchEmailTerm, $options: 'i' } },
            ]
        }
        return UserModel.countDocuments(filter)
    },
    async getUserById(id: string): Promise<UserType | null> {
        return UserModel.findOne({ id }, { _id: 0, passwordHash: 0, __v: 0, confirmationData: 0 })
    },
    async _getUserById(id: string): Promise<UserType | null> {
        return UserModel.findOne({ id })
    },

    async getAndUpdateUserByConfirmationCode(code: string): Promise<UserType | null> {
        return UserModel.findOneAndUpdate(
            {
                $and: [
                    { 'confirmationData.code': code },
                    { 'confirmationData.data': { $gte: new Date() } },
                ],
            },
            { $set: { 'confirmationData.isConfirmed': true } }
        )
    },
    async getUserByConfirmationCode(code: string): Promise<UserType | null> {
        return UserModel.findOne({
            $and: [
                { 'confirmationData.code': code },
                { 'confirmationData.data': { $gte: new Date() } },
            ],
        })
    },
    async updateUserConfirmationCode(id: string): Promise<UserType | null> {
        await UserModel.findOneAndUpdate(
            { id },
            {
                $set: {
                    'confirmationData.code': uuidv4(),
                    'confirmationData.data': dateFns(new Date(), 10),
                    'confirmationData.isConfirmed': false,
                },
            }
        )
        return UserModel.findOne({ id })
    },

    async updateUserPassword(id: string, passwordHash: string): Promise<UserType | null> {
        await UserModel.findOneAndUpdate(
            { id },
            {
                $set: {
                    passwordHash,
                    'confirmationData.code': uuidv4(),
                    'confirmationData.data': dateFns(new Date(), 10),
                    'confirmationData.isConfirmed': true,
                },
            }
        )
        return UserModel.findOne({ id })
    },

    async getUserByLoginOrEmail(loginOrEmail: string) {
        return UserModel.findOne({
            $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
        })
    },

    async createUser(newUser: UserType) {
        await UserModel.insertMany(newUser)
        return this.getUserById(newUser.id)
    },
    async deleteUser(id: string): Promise<boolean> {
        const res = await UserModel.deleteOne({ id })
        return res.deletedCount === 1
    },
    async deleteAll() {
        return UserModel.deleteMany({})
    },
}
export type UserType = {
    id: string
    login: string
    email: string
    createdAt: string
    passwordHash: string
    confirmationData: ConfirmationDataType
}

export type ConfirmationDataType = {
    isConfirmed: boolean
    data: Date | null
    code: string
}
