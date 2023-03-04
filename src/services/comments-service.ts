import { commentsRepository } from '../repositores/comments-db-repository'

export const commentsService = {
    async getCommentById(id: string): Promise<CommentType | null> {
        return commentsRepository.getCommentById(id)
    },

    async getCommentsByPostId(
        postId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<CommentType[]> {
        return commentsRepository.getCommentsByPostId(
            postId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        )
    },

    async getCommentsCountByPostId(postId: string): Promise<number> {
        return commentsRepository.getCommentsCountByPostId(postId)
    },

    async createComment(
        content: string,
        userId: string,
        userLogin: string,
        postId: string
    ): Promise<CommentType | null> {
        const comment: CommentType = {
            id: new Date().getTime().toString(),
            content,
            createdAt: new Date().toISOString(),
            commentatorInfo: {
                userLogin,
                userId,
            },
            postId,
        }
        return commentsRepository.createComment(comment)
    },

    async updateComment(id: string, content: string): Promise<boolean> {
        return commentsRepository.updateComment(id, content)
    },

    async deleteComment(id: string): Promise<boolean> {
        return commentsRepository.deleteComment(id)
    },
    async deleteAll() {
        return commentsRepository.deleteAll()
    },
}

export type CommentType = {
    id: string
    content: string
    commentatorInfo: CommentatorInfoType
    createdAt: string
    postId: string
}
export type CommentatorInfoType = {
    userId: string
    userLogin: string
}
