import { LikeInfoEnum, LikesRepository, StatusType } from '../repositores/likes-db-repository'

export class LikesService {
    constructor(private likesRepository: LikesRepository) {}

    async createStatus(
        userId: string,
        postId: string,
        commentId: string
    ): Promise<StatusType | null> {
        const data: StatusType = new StatusType(
            new Date().getTime().toString(),
            new Date().toISOString(),
            userId,
            postId,
            commentId,
            LikeInfoEnum.None
        )
        return this.likesRepository.createStatus(data)
    }

    async getStatusById(_id: string): Promise<StatusType | null> {
        return this.likesRepository.getStatusById(_id)
    }

    async findLikeStatus(userId: string, commentId: string): Promise<StatusType | null> {
        return this.likesRepository.findLikeStatus(userId, commentId)
    }

    async updateLikeStatus(id: string, status: LikeInfoEnum): Promise<StatusType | null> {
        return this.likesRepository.updateLikeStatus(id, status)
    }
    async deleteAll() {
        return this.likesRepository.deleteAll()
    }
}
