import { usersCollection } from '../mongo/db'
import { v4 as uuidv4 } from 'uuid'
import dateFns from 'date-fns/addMinutes'

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
        return usersCollection
            .find(filter, {
                projection: { _id: 0, passwordHash: 0, confirmationData: 0 },
            })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .toArray()
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
        return usersCollection.countDocuments(filter)
    },
    async getUserById(id: string): Promise<UserType | null> {
        return usersCollection.findOne(
            { id },
            { projection: { _id: 0, passwordHash: 0, confirmationData: 0 } }
        )
    },
    async _getUserById(id: string): Promise<UserType | null> {
        return usersCollection.findOne({ id })
    },

    async getAndUpdateUserByConfirmationCode(code: string): Promise<UserType | null> {
        const res = await usersCollection.findOneAndUpdate(
            {
                $and: [
                    { 'confirmationData.code': code },
                    { 'confirmationData.data': { $gte: new Date() } },
                ],
            },
            { $set: { 'confirmationData.isConfirmed': true } }
        )
        return res.value
    },
    async getUserByConfirmationCode(code: string): Promise<UserType | null> {
        return usersCollection.findOne({
            $and: [
                { 'confirmationData.code': code },
                { 'confirmationData.data': { $gte: new Date() } },
            ],
        })
    },
    async updateUserConfirmationCode(id: string): Promise<UserType | null> {
        await usersCollection.findOneAndUpdate(
            { id },
            {
                $set: {
                    'confirmationData.code': uuidv4(),
                    'confirmationData.data': dateFns(new Date(), 10),
                },
            }
        )
        return usersCollection.findOne({ id })
    },

    // async updateRefreshToken(
    //     id: string,
    //     refreshTokenPart: string | null,
    //     deviceId: string
    // ): Promise<UserType | null> {
    //     const user = await usersCollection.findOne({ id })
    //     if (!user) {
    //         return null
    //     }
    //     if (refreshTokenPart) {
    //         const devices = user.tokensBase.map((d) =>
    //             d.deviceId === deviceId ? { ...d, refreshTokenData: refreshTokenPart } : d
    //         )
    //         await usersCollection.findOneAndUpdate(
    //             { id, 'tokensBase.dId': deviceId },
    //             { $set: { tokensBase: devices } }
    //         )
    //     } else {
    //         const devices = user?.tokensBase.filter((d) => d.deviceId !== deviceId)
    //         await usersCollection.findOneAndUpdate(
    //             { id, 'tokensBase.deviceId': deviceId },
    //             { $set: { tokensBase: devices } }
    //         )
    //     }
    //     return usersCollection.findOne({ id })
    // },

    // async updateTokensBase(id: string, data: TokensBaseType): Promise<UserType | null> {
    //     await usersCollection.findOneAndUpdate({ id }, { $push: { tokensBase: data } })
    //     return usersCollection.findOne({ id })
    // },

    async getUserByLoginOrEmail(loginOrEmail: string) {
        return usersCollection.findOne({
            $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
        })
    },

    async createUser(newUser: UserType) {
        await usersCollection.insertOne(newUser)
        return this.getUserById(newUser.id)
    },
    async deleteUser(id: string): Promise<boolean> {
        const res = await usersCollection.deleteOne({ id })
        return res.deletedCount === 1
    },
    async deleteAll() {
        return usersCollection.deleteMany({})
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
