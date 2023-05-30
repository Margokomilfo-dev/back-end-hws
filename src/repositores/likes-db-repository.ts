import { CommentLikesModel } from '../mongo/likes/commentLikesModel'
import { injectable } from 'inversify'
import { PostLikesModel } from '../mongo/likes/postLikesModel'

@injectable()
export class LikesRepository {
    async createCommentStatus(dto: CommentStatusType): Promise<CommentStatusType | null> {
        await CommentLikesModel.insertMany([dto])
        return this.getCommentStatus(dto.userId, dto.commentId)
    }
    async createPostStatus(dto: PostStatusType): Promise<PostStatusType | null> {
        await PostLikesModel.insertMany([dto])
        return this.getPostStatus(dto.userId, dto.postId)
    }

    async getCommentStatus(userId: string, commentId: string): Promise<CommentStatusType | null> {
        return CommentLikesModel.findOne({ userId, commentId }).lean()
    }

    async getPostStatus(userId: string, postId: string): Promise<PostStatusType | null> {
        return PostLikesModel.findOne({ userId, postId }).lean()
    }

    async findLikeStatus(userId: string, commentId: string): Promise<CommentStatusType | null> {
        return CommentLikesModel.findOne({ userId, commentId }).lean()
    }
    async getNewestPostLikes(postId: string, num: number): Promise<Array<PostStatusType>> {
        return PostLikesModel.find({ postId }).sort({ createdAt: -1 }).limit(num).lean()
    }
    async updateCommentLikeStatus(
        userId: string,
        commentId: string,
        status: LikeInfoEnum
    ): Promise<CommentStatusType | null> {
        return CommentLikesModel.findOneAndUpdate({ userId, commentId }, { status }, { new: true })
    }
    async updatePostLikeStatus(
        userId: string,
        postId: string,
        status: LikeInfoEnum
    ): Promise<CommentStatusType | null> {
        return PostLikesModel.findOneAndUpdate({ userId, postId }, { status }, { new: true })
    }
    async deleteAll() {
        return CommentLikesModel.deleteMany({})
    }
}

export class CommentStatusType {
    constructor(
        public userId: string,
        public commentId: string,
        public status: LikeInfoEnum,
        public createdAt: string //он не изменен
    ) {}
}
export class PostStatusType {
    constructor(
        public userId: string,
        public login: string,
        public postId: string,
        public status: LikeInfoEnum,
        public createdAt: string //он не изменен
    ) {}
}

export enum LikeInfoEnum {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike',
}
