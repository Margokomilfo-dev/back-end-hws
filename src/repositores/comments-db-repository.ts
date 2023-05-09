import { CommentsModel } from '../mongo/comments/comments.model'
import { LikeInfoEnum, LikesRepository, StatusType } from './likes-db-repository'

export class CommentRepository {
    constructor(private likesRepository: LikesRepository) {}
    async createComment(comment: CommentType): Promise<ExtendedCommentType | null> {
        await CommentsModel.insertMany(comment)
        const res = await this.getCommentById(comment.id)
        if (!res) return null
        return { ...res, likesInfo: { ...res.likesInfo, myStatus: LikeInfoEnum.None } }
    }

    async getCommentById(id: string): Promise<CommentType | null> {
        return CommentsModel.findOne({ id }, { _id: 0, postId: 0, __v: 0 }).lean()
    }
    async getCommentById_(id: string): Promise<CommentType | null> {
        return CommentsModel.findOne({ id }).lean()
    }

    async getCommentsByPostId(
        userId: string | null,
        postId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<CommentType[]> {
        const res = await CommentsModel.find({ postId }, { _id: 0, postId: 0, __v: 0 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .lean()

        if (!userId) {
            return res.map((comment) => ({
                ...comment,
                likesInfo: { ...comment.likesInfo, myStatus: LikeInfoEnum.None },
            }))
        }
        const promises = res.map(async (comment) => {
            const myStatus = await this.likesRepository.getCommentStatus(userId, comment.id)
            return {
                ...comment,
                likesInfo: {
                    ...comment.likesInfo,
                    myStatus: myStatus ? myStatus.status : LikeInfoEnum.None,
                },
            }
        })
        return await Promise.all(promises)
    }

    async getCommentsCountByPostId(postId: string): Promise<number> {
        return CommentsModel.countDocuments({ postId })
    }
    async updateLikeStatus(
        comment: CommentType,
        checkedStatus: LikeInfoEnum,
        myLikeStatusData: StatusType
    ): Promise<boolean> {
        const filter: any = {}
        let newStatus = checkedStatus
        const { status, commentId, userId } = myLikeStatusData

        if (checkedStatus === LikeInfoEnum.None) {
            if (status === LikeInfoEnum.Like) {
                filter.$inc = { 'likesInfo.likesCount': -1 }
                newStatus = LikeInfoEnum.None
            }
            if (status === LikeInfoEnum.Dislike) {
                filter.$inc = { 'likesInfo.dislikesCount': -1 }
                newStatus = LikeInfoEnum.None
            }
            if (status === LikeInfoEnum.None) {
                newStatus = LikeInfoEnum.None
            }
        }
        if (checkedStatus === LikeInfoEnum.Like) {
            if (status === LikeInfoEnum.None) {
                filter.$inc = { 'likesInfo.likesCount': 1 }
                newStatus = LikeInfoEnum.Like
            }
            if (status === LikeInfoEnum.Dislike) {
                filter.$inc = { 'likesInfo.likesCount': 1, 'likesInfo.dislikesCount': -1 }
                newStatus = LikeInfoEnum.Like
            }
            if (status === LikeInfoEnum.Like) {
                newStatus = LikeInfoEnum.Like
            }
        }
        if (checkedStatus === LikeInfoEnum.Dislike) {
            if (status === LikeInfoEnum.None) {
                filter.$inc = { 'likesInfo.dislikesCount': 1 }
                newStatus = LikeInfoEnum.Dislike
            }
            if (status === LikeInfoEnum.Like) {
                filter.$inc = { 'likesInfo.likesCount': -1, 'likesInfo.dislikesCount': 1 }
                newStatus = LikeInfoEnum.Dislike
            }
            if (status === LikeInfoEnum.Dislike) {
                newStatus = LikeInfoEnum.Dislike
            }
        }

        await CommentsModel.findOneAndUpdate({ id: comment.id }, filter).lean()
        await this.likesRepository.updateLikeStatus(userId, commentId, newStatus)
        return true
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

export class CommentType {
    constructor(
        public id: string,
        public content: string,
        public createdAt: string,
        public commentatorInfo: CommentatorInfoType,
        public postId: string,
        public likesInfo: LikeInfoType
    ) {}
}

export class ExtendedCommentType {
    constructor(
        public id: string,
        public content: string,
        public createdAt: string,
        public commentatorInfo: CommentatorInfoType,
        public postId: string,
        public likesInfo: {
            likesCount: number
            dislikesCount: number
            myStatus: LikeInfoEnum
        }
    ) {}
}
export type CommentatorInfoType = {
    userId: string
    userLogin: string
}

export type LikeInfoType = {
    likesCount: number
    dislikesCount: number
}
