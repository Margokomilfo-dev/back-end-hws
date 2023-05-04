import { CommentsModel } from '../mongo/comments/comments.model'
import { LikeInfoEnum, LikesRepository, StatusType } from './likes-db-repository'

export class CommentRepository {
    constructor(private likesRepository: LikesRepository) {}
    async createComment(comment: CommentType): Promise<CommentType | null> {
        await CommentsModel.insertMany(comment)
        return this.getCommentById(comment.id)
    }

    async getCommentById(id: string): Promise<CommentType | null> {
        return CommentsModel.findOne({ id }, { _id: 0, postId: 0, __v: 0 }).lean()
    }
    async getCommentById_(id: string): Promise<CommentType | null> {
        return CommentsModel.findOne({ id }).lean()
    }

    async getCommentsByPostId(
        postId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<CommentType[]> {
        return CommentsModel.find({ postId }, { _id: 0, postId: 0, __v: 0 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .lean()
    }

    async getCommentsCountByPostId(postId: string): Promise<number> {
        return CommentsModel.countDocuments({ postId })
    }
    async updateLikeStatus(
        comment: CommentType,
        status: LikeInfoEnum,
        likeStatus: StatusType
    ): Promise<boolean> {
        const filter: any = {}
        let newStatus = likeStatus.status
        console.log('What: ', likeStatus.status, status)

        //если я еще не делала выбора myStatus === None
        if (likeStatus.status === LikeInfoEnum.None) {
            if (status === LikeInfoEnum.Like) {
                filter.$inc = { 'likesInfo.likesCount': 1 }
                newStatus = LikeInfoEnum.Like
            }
            if (status === LikeInfoEnum.Dislike) {
                filter.$inc = { 'likesInfo.dislikeCount': 1 }
                newStatus = LikeInfoEnum.Dislike
            }
        }

        //если я отклоняю свой выбор (True -> True, False -> False)
        else if (likeStatus.status === status) {
            if (status === LikeInfoEnum.Like) {
                filter.$inc = { 'likesInfo.likesCount': -1 }
                newStatus = LikeInfoEnum.None
            }
            if (status === LikeInfoEnum.Dislike) {
                filter.$inc = { 'likesInfo.dislikesCount': -1 }
                newStatus = LikeInfoEnum.None
            }
        }

        //если я изменяю свой выбор
        else if (likeStatus.status === LikeInfoEnum.Like && status === LikeInfoEnum.Dislike) {
            filter.$inc = { 'likesInfo.likesCount': -1, 'likesInfo.dislikesCount': 1 }
            newStatus = LikeInfoEnum.Dislike
        }

        //если я изменяю свой выбор
        else if (likeStatus.status === LikeInfoEnum.Dislike && status === LikeInfoEnum.Like) {
            filter.$inc = { 'likesInfo.likesCount': 1, 'likesInfo.dislikesCount': -1 }
            newStatus = LikeInfoEnum.Like
        }

        await CommentsModel.findOneAndUpdate({ id: comment.id }, filter).lean()
        console.log('AfterUpdate', newStatus, await CommentsModel.findOne({ id: comment.id }))
        await this.likesRepository.updateLikeStatus(
            likeStatus.userId,
            likeStatus.commentId,
            newStatus
        )
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
