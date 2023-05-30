import { PostsModel } from '../mongo/posts/posts.model'
import { injectable } from 'inversify'
import { LikeInfoEnum, LikesRepository, PostStatusType } from './likes-db-repository'

@injectable()
export class PostsRepository {
    constructor(public likesRepository: LikesRepository) {}
    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        userId: string | null
    ): Promise<ExtendedPostType[]> {
        const posts = await PostsModel.find({}, { _id: 0, __v: 0 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .lean()

        return await this.postsCorrectModelCreator(posts, userId)
    }
    async getPostsCount(): Promise<number> {
        return PostsModel.countDocuments({})
    }
    async getPostById(id: string, userId: string | null): Promise<ExtendedPostType | null> {
        let myStatus = LikeInfoEnum.None
        if (userId) {
            const postStatusData = await this.likesRepository.getPostStatus(userId, id)
            if (postStatusData) myStatus = postStatusData.status
        }

        const res = await PostsModel.findOne({ id }, { _id: 0, __v: 0 }).lean()
        if (!res) return null
        const newestLikes = await this.likesRepository.getNewestPostLikes(res.id, 3)
        return {
            ...res,
            extendedLikesInfo: {
                ...res.extendedLikesInfo,
                myStatus,
                newestLikes: newestLikes.map((l) => ({
                    addedAt: l.createdAt,
                    userId: l.userId,
                    login: l.login,
                })),
            },
        }
    }

    async getPostsByBlogId(
        blogId: string,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string,
        userId: string | null
    ): Promise<Array<ExtendedPostType>> {
        const posts = await PostsModel.find({ blogId }, { _id: 0, __v: 0 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
            .lean()

        return await this.postsCorrectModelCreator(posts, userId)
    }

    async getPostsCountByBlogId(blogId: string): Promise<number> {
        return PostsModel.countDocuments({ blogId })
    }

    async createPost(newPost: PostType, userId: string): Promise<ExtendedPostType | null> {
        await PostsModel.insertMany(newPost)
        const res = await this.getPostById(newPost.id, userId)
        if (!res) return null
        return {
            ...res,
            extendedLikesInfo: { ...res.extendedLikesInfo, myStatus: LikeInfoEnum.None },
        }
    }

    async updatePost(
        id: string,
        body: {
            title: string
            content: string
            blogId: string
            shortDescription: string
        }
    ): Promise<boolean> {
        const ourPost = await PostsModel.updateOne({ id }, body)
        return ourPost.matchedCount === 1
    }

    async updateLikeStatus(
        post: PostType,
        myLikeStatusData: PostStatusType,
        checkedStatus: LikeInfoEnum
    ): Promise<boolean> {
        const filter: any = {}
        let newStatus = checkedStatus
        const { status, postId, userId } = myLikeStatusData
        if (checkedStatus === LikeInfoEnum.None) {
            if (status === LikeInfoEnum.Like) {
                filter.$inc = { 'extendedLikesInfo.likesCount': -1 }
                newStatus = LikeInfoEnum.None
            }
            if (status === LikeInfoEnum.Dislike) {
                filter.$inc = { 'extendedLikesInfo.dislikesCount': -1 }
                newStatus = LikeInfoEnum.None
            }
            if (status === LikeInfoEnum.None) {
                newStatus = LikeInfoEnum.None
            }
        }
        if (checkedStatus === LikeInfoEnum.Like) {
            if (status === LikeInfoEnum.None) {
                filter.$inc = { 'extendedLikesInfo.likesCount': 1 }
                newStatus = LikeInfoEnum.Like
            }
            if (status === LikeInfoEnum.Dislike) {
                filter.$inc = {
                    'extendedLikesInfo.likesCount': 1,
                    'extendedLikesInfo.dislikesCount': -1,
                }
                newStatus = LikeInfoEnum.Like
            }
            if (status === LikeInfoEnum.Like) {
                newStatus = LikeInfoEnum.Like
            }
        }
        if (checkedStatus === LikeInfoEnum.Dislike) {
            if (status === LikeInfoEnum.None) {
                filter.$inc = { 'extendedLikesInfo.dislikesCount': 1 }
                newStatus = LikeInfoEnum.Dislike
            }
            if (status === LikeInfoEnum.Like) {
                filter.$inc = {
                    'extendedLikesInfo.likesCount': -1,
                    'extendedLikesInfo.dislikesCount': 1,
                }
                newStatus = LikeInfoEnum.Dislike
            }
            if (status === LikeInfoEnum.Dislike) {
                newStatus = LikeInfoEnum.Dislike
            }
        }

        await PostsModel.findOneAndUpdate({ id: post.id }, filter).lean()
        await this.likesRepository.updatePostLikeStatus(userId, postId, newStatus)
        return true
    }
    async deletePost(id: string): Promise<boolean> {
        const res = await PostsModel.deleteOne({ id })
        return res.deletedCount === 1
    }
    async deleteAll() {
        return PostsModel.deleteMany({})
    }

    private async postsCorrectModelCreator(
        posts: PostType[],
        userId: null | string
    ): Promise<ExtendedPostType[]> {
        const promises = posts.map(async (post) => {
            let myStatus = LikeInfoEnum.None
            if (userId) {
                const postStatus = await this.likesRepository.getPostStatus(userId, post.id)
                if (postStatus) myStatus = postStatus.status
            }
            const newestLikes = await this.likesRepository.getNewestPostLikes(post.id, 3)
            return {
                ...post,
                extendedLikesInfo: {
                    ...post.extendedLikesInfo,
                    myStatus,
                    newestLikes: newestLikes.map((l) => ({
                        addedAt: l.createdAt,
                        userId: l.userId,
                        login: l.login,
                    })),
                },
            }
        })
        return await Promise.all(promises)
    }
}

export class PostType {
    constructor(
        public id: string,
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
        public createdAt: string,
        public extendedLikesInfo: ExtendedLikesInfoType
    ) {}
}

export class ExtendedPostType {
    constructor(
        public id: string,
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
        public createdAt: string,
        public extendedLikesInfo: _ExtendedLikesInfoType
    ) {}
}

export class ExtendedLikesInfoType {
    constructor(
        public likesCount: number,
        public dislikesCount: number,
        //public myStatus: LikeInfoEnum,
        public newestLikes: Array<{
            addedAt: string
            userId: string
            login: string
        }>
    ) {}
}

export class _ExtendedLikesInfoType {
    constructor(
        public likesCount: number,
        public dislikesCount: number,
        public myStatus: LikeInfoEnum,
        public newestLikes: Array<{
            addedAt: string
            userId: string
            login: string
        }>
    ) {}
}
