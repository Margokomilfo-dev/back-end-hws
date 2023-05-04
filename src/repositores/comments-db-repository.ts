import { CommentsModel } from '../mongo/comments/comments.model'

export class CommentRepository {
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
    async updateLikeStatus(commentId: string, status: LikeInfoEnum): Promise<CommentType | null> {
        const comment = await CommentsModel.findOne({ id: commentId })
        if (!comment) {
            return null
        }
        const filter: any = {}

        //если я еще не делала выбора myStatus === None
        if (comment.likesInfo.myStatus === LikeInfoEnum.None) {
            if (status === LikeInfoEnum.Like) {
                filter.$inc = { 'likesInfo.likesCount': 1 }
                filter['likesInfo.myStatus'] = LikeInfoEnum.Like
            }
            if (status === LikeInfoEnum.Dislike) {
                filter.$inc = { 'likesInfo.dislikeCount': 1 }
                filter['likesInfo.myStatus'] = LikeInfoEnum.Dislike
            }
        }

        //если я отклоняю свой выбор (True -> True, False -> False)
        if (comment.likesInfo.myStatus === status) {
            if (status === LikeInfoEnum.Like) {
                filter.$inc = { 'likesInfo.likesCount': -1 }
                filter['likesInfo.myStatus'] = LikeInfoEnum.None
            }
            if (status === LikeInfoEnum.Dislike) {
                filter.$inc = { 'likesInfo.dislikesCount': -1 }
                filter['likesInfo.myStatus'] = LikeInfoEnum.None
            }
        }

        //если я изменяю свой выбор
        if (comment.likesInfo.myStatus === LikeInfoEnum.Like && status === LikeInfoEnum.Dislike) {
            filter.$inc = { 'likesInfo.likesCount': -1, 'likesInfo.dislikesCount': 1 }
            filter['likesInfo.myStatus'] = LikeInfoEnum.Dislike
        }
        //если я изменяю свой выбор

        if (comment.likesInfo.myStatus === LikeInfoEnum.Dislike && status === LikeInfoEnum.Like) {
            filter.$inc = { 'likesInfo.likesCount': 1, 'likesInfo.dislikesCount': -1 }
            filter['likesInfo.myStatus'] = LikeInfoEnum.Like
        }

        return CommentsModel.findOneAndUpdate({ id: commentId }, filter, { new: true })
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

export type CommentatorInfoType = {
    userId: string
    userLogin: string
}

export type LikeInfoType = {
    likesCount: number
    dislikesCount: number
    myStatus: LikeInfoEnum
}

export enum LikeInfoEnum {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike',
}
