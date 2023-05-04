import { LikesModel } from '../mongo/likes/likes.model'

export class LikesRepository {
    async createStatus(dto: StatusType): Promise<StatusType | null> {
        await LikesModel.insertMany([dto])
        return this.getStatusById(dto.id)
    }

    async getStatusById(id: string): Promise<StatusType | null> {
        return LikesModel.findOne({ id }).lean()
    }

    async findLikeStatus(userId: string, commentId: string): Promise<StatusType | null> {
        return LikesModel.findOne({ userId, commentId }).lean()
    }
    async updateLikeStatus(id: string, status: LikeInfoEnum): Promise<StatusType | null> {
        return LikesModel.findOneAndUpdate({ id }, { status }, { new: true })
    }
    async deleteAll() {
        return LikesModel.deleteMany({})
    }
}

export class StatusType {
    constructor(
        public id: string,
        public createdAt: string,
        public userId: string,
        public postId: string,
        public commentId: string,
        public status: LikeInfoEnum
    ) {}
}

export enum LikeInfoEnum {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike',
}
