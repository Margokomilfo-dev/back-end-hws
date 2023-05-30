import {
    LikeInfoEnum,
    LikesRepository,
    CommentStatusType,
} from '../repositores/likes-db-repository'
import { inject, injectable } from 'inversify'

@injectable()
export class LikesService {
    constructor(@inject(LikesRepository) protected likesRepository: LikesRepository) {}

    async createStatus(userId: string, commentId: string): Promise<CommentStatusType | null> {
        const data: CommentStatusType = new CommentStatusType(
            userId,
            commentId,
            LikeInfoEnum.None,
            new Date().toISOString()
        )
        return this.likesRepository.createCommentStatus(data)
    }

    async getCommentStatus(userId: string, commentId: string): Promise<CommentStatusType | null> {
        return this.likesRepository.getCommentStatus(userId, commentId)
    }

    async deleteAll() {
        return this.likesRepository.deleteAll()
    }
}
