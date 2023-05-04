import { LikeInfoEnum, LikesRepository, StatusType } from '../repositores/likes-db-repository'

export class LikesService {
    constructor(private likesRepository: LikesRepository) {}

    async createStatus(userId: string, commentId: string): Promise<StatusType | null> {
        const data: StatusType = new StatusType(userId, commentId, LikeInfoEnum.None)
        return this.likesRepository.createCommentStatus(data)
    }

    async getCommentStatus(userId: string, commentId: string): Promise<StatusType | null> {
        return this.likesRepository.getCommentStatus(userId, commentId)
    }

    async deleteAll() {
        return this.likesRepository.deleteAll()
    }
}
