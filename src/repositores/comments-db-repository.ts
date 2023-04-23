import { CommentsModel } from '../mongo/comments/comments.model'

class CommentRepository {
    async createComment(comment: CommentType): Promise<CommentType | null> {
        await CommentsModel.insertMany(comment)
        return this.getCommentById(comment.id)
    }

    async getCommentById(id: string): Promise<CommentType | null> {
        return CommentsModel.findOne({ id }, { _id: 0, postId: 0, __v: 0 })
    }

    async getCommentsByPostId(
        postId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<CommentType[]> {
        return CommentsModel.find({ postId }, { _id: 0, postId: 0 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .lean()
    }

    async getCommentsCountByPostId(postId: string): Promise<number> {
        return CommentsModel.countDocuments({ postId })
    }

    async updateComment(id: string, content: string): Promise<boolean> {
        const res = await CommentsModel.updateOne({ id }, { content })
        return res.matchedCount === 1
    }

    async deleteComment(id: string): Promise<boolean> {
        const res = await CommentsModel.deleteOne({ id })
        return res.deletedCount === 1
    }

    async deleteAll() {
        return CommentsModel.deleteMany({})
    }
}

export const commentsRepository = new CommentRepository()

export class CommentType {
    constructor(
        public id: string,
        public content: string,
        public createdAt: string,
        public commentatorInfo: CommentatorInfoType,
        public postId: string
    ) {}
}

// export type CommentType = {
//     id: string
//     content: string
//     commentatorInfo: CommentatorInfoType
//     createdAt: string
//     postId: string
// }
export type CommentatorInfoType = {
    userId: string
    userLogin: string
}
