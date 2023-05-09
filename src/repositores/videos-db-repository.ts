import { VideoModel } from '../mongo/video/video.model'
import { injectable } from 'inversify'

@injectable()
export class VideosRepository {
    async getVideos() {
        return VideoModel.find({}, { _id: 0, __v: 0 })
    }

    async getVideoById(id: number): Promise<VideoType | null> {
        return VideoModel.findOne({ id }, { _id: 0, __v: 0 })
    }

    async createVideo(newVideo: VideoType): Promise<VideoType | null> {
        await VideoModel.insertMany([newVideo])
        return this.getVideoById(newVideo.id)
    }

    async updateVideo(id: number, body: any): Promise<boolean> {
        const res = await VideoModel.updateOne({ id }, body)
        return res.matchedCount === 1
    }

    async deleteVideo(id: number): Promise<boolean> {
        const res = await VideoModel.deleteOne({ id })
        return res.deletedCount === 1
    }

    async deleteAll() {
        return VideoModel.deleteMany({})
    }
}

export class VideoType {
    constructor(
        public id: number,
        public title: string,
        public author: string,
        public canBeDownloaded: boolean,
        public minAgeRestriction: number | null,
        public createdAt: string,
        public publicationDate: string,
        public availableResolutions: Array<string> | null
    ) {}
}

export enum ResolutionsEnum {
    'P144' = 'P144',
    'P240' = 'P240',
    'P360' = 'P360',
    'P480' = 'P480',
    'P720' = 'P720',
    'P1080' = 'P1080',
    'P1440' = 'P1440',
    'P2160' = 'P2160',
}
