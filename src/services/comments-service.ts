import { CommentRepository, CommentType } from '../repositores/comments-db-repository'
import { LikesService } from './likes-service'
import { LikeInfoEnum } from '../repositores/likes-db-repository'

export class CommentsService {
    constructor(
        private commentsRepository: CommentRepository,
        private likesService: LikesService
    ) {}
    async getCommentById(id: string): Promise<CommentType | null> {
        return this.commentsRepository.getCommentById(id)
    }

    async getCommentsByPostId(
        userId: string | null,
        postId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<CommentType[]> {
        return this.commentsRepository.getCommentsByPostId(
            userId,
            postId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        )
    }

    async getCommentsCountByPostId(postId: string): Promise<number> {
        return this.commentsRepository.getCommentsCountByPostId(postId)
    }

    async createComment(
        content: string,
        userId: string,
        userLogin: string,
        postId: string
    ): Promise<CommentType | null> {
        const comment = new CommentType(
            new Date().getTime().toString(),
            content,
            new Date().toISOString(),
            {
                userLogin,
                userId,
            },
            postId,
            {
                likesCount: 0,
                dislikesCount: 0,
            }
        )
        return this.commentsRepository.createComment(comment)
    }

    async updateComment(id: string, content: string): Promise<boolean> {
        return this.commentsRepository.updateComment(id, content)
    }
    async updateLikeStatus(
        commentId: string,
        status: LikeInfoEnum,
        userId: string
    ): Promise<boolean> {
        const comment = await this.commentsRepository.getCommentById_(commentId)
        if (!comment) {
            return false
        }

        let myLikeStatusData = await this.likesService.getCommentStatus(userId, comment.id)

        if (!myLikeStatusData) {
            myLikeStatusData = await this.likesService.createStatus(userId, commentId)
        }
        if (!myLikeStatusData) {
            return false
        }
        return this.commentsRepository.updateLikeStatus(comment, status, myLikeStatusData)
    }

    async deleteComment(id: string): Promise<boolean> {
        return this.commentsRepository.deleteComment(id)
    }

    async deleteAll() {
        return this.commentsRepository.deleteAll()
    }
}
