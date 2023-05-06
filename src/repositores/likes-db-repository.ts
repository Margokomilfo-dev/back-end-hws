import { LikesModel } from '../mongo/likes/likes.model'

export class LikesRepository {
    async createCommentStatus(dto: StatusType): Promise<StatusType | null> {
        await LikesModel.insertMany([dto])
        return this.getCommentStatus(dto.userId, dto.commentId)
    }

    async getCommentStatus(userId: string, commentId: string): Promise<StatusType | null> {
        return LikesModel.findOne({ userId, commentId }).lean()
    }

    async findLikeStatus(userId: string, commentId: string): Promise<StatusType | null> {
        return LikesModel.findOne({ userId, commentId }).lean()
    }
    async updateLikeStatus(
        userId: string,
        commentId: string,
        status: LikeInfoEnum
    ): Promise<StatusType | null> {
        return LikesModel.findOneAndUpdate({ userId, commentId }, { status }, { new: true })
    }
    async deleteAll() {
        return LikesModel.deleteMany({})
    }
}

export class StatusType {
    constructor(
        public userId: string,
        public commentId: string,
        public status: LikeInfoEnum,
        public createdAt: string //он не изменен
    ) {}
}

export enum LikeInfoEnum {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike',
}
