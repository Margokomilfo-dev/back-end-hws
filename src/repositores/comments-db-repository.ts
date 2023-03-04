import { commentsCollection } from '../mongo/db'
import { CommentType } from '../services/comments-service'

export const commentsRepository = {
    async createComment(comment: CommentType): Promise<CommentType | null> {
        await commentsCollection.insertOne(comment)
        return this.getCommentById(comment.id)
    },
    async getCommentById(id: string): Promise<CommentType | null> {
        return commentsCollection.findOne(
            { id },
            { projection: { _id: 0, postId: 0 } }
        )
    },

    async getCommentsByPostId(
        postId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<CommentType[]> {
        return commentsCollection
            .find({ postId }, { projection: { _id: 0 } })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .toArray()
    },

    async getCommentsCountByPostId(postId: string): Promise<number> {
        return commentsCollection.countDocuments({ postId })
    },

    async updateComment(id: string, content: string): Promise<boolean> {
        console.log('id, content', id, content)
        const res = await commentsCollection.updateOne(
            { id },
            { $set: { content } }
        )
        console.log('res.matchedCount:', res.matchedCount)
        return res.matchedCount === 1
    },

    async deleteComment(id: string): Promise<boolean> {
        const res = await commentsCollection.deleteOne({ id })
        return res.deletedCount === 1
    },

    async deleteAll() {
        return commentsCollection.deleteMany({})
    },
}
