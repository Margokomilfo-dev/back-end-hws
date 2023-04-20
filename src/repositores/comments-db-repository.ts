import { CommentType } from '../services/comments-service'
import { CommentsModel } from '../mongo/comments/comments.model'

export const commentsRepository = {
    async createComment(comment: CommentType): Promise<CommentType | null> {
        await CommentsModel.insertMany(comment)
        return this.getCommentById(comment.id)
    },
    async getCommentById(id: string): Promise<CommentType | null> {
        return CommentsModel.findOne({ id }, { projection: { _id: 0, postId: 0 } })
    },

    async getCommentsByPostId(
        postId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<CommentType[]> {
        return CommentsModel.find({ postId }, { projection: { _id: 0, postId: 0 } })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
    },

    async getCommentsCountByPostId(postId: string): Promise<number> {
        return CommentsModel.countDocuments({ postId })
    },

    async updateComment(id: string, content: string): Promise<boolean> {
        const res = await CommentsModel.updateOne({ id }, { $set: { content } })
        return res.matchedCount === 1
    },

    async deleteComment(id: string): Promise<boolean> {
        const res = await CommentsModel.deleteOne({ id })
        return res.deletedCount === 1
    },

    async deleteAll() {
        return CommentsModel.deleteMany({})
    },
}
