import { CommentRepository, CommentType } from '../repositores/comments-db-repository'

export class CommentsService {
    constructor(private commentsRepository: CommentRepository) {}
    async getCommentById(id: string): Promise<CommentType | null> {
        return this.commentsRepository.getCommentById(id)
    }

    async getCommentsByPostId(
        postId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<CommentType[]> {
        return this.commentsRepository.getCommentsByPostId(
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
            postId
        )
        return this.commentsRepository.createComment(comment)
    }

    async updateComment(id: string, content: string): Promise<boolean> {
        return this.commentsRepository.updateComment(id, content)
    }

    async deleteComment(id: string): Promise<boolean> {
        return this.commentsRepository.deleteComment(id)
    }

    async deleteAll() {
        return this.commentsRepository.deleteAll()
    }
}
