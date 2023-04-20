import { VideoType } from '../routes/videos-router'
import { VideoModel } from '../mongo/video/video.model'

export const videosRepository = {
    async getVideos() {
        return VideoModel.find({}, { projection: { _id: 0 } })
    },
    async getVideoById(id: number): Promise<VideoType | null> {
        return VideoModel.findOne({ id }, { projection: { _id: 0 } })
    },
    async createVideo(newVideo: VideoType): Promise<VideoType | null> {
        await VideoModel.insertMany([newVideo])
        return this.getVideoById(newVideo.id)
    },
    async updateVideo(id: number, body: any): Promise<boolean> {
        const res = await VideoModel.updateOne({ id }, { $set: { ...body } })
        return res.matchedCount === 1
    },

    async deleteVideo(id: number): Promise<boolean> {
        const res = await VideoModel.deleteOne({ id })
        return res.deletedCount === 1
    },
    async deleteAll() {
        return VideoModel.deleteMany({})
    },
}
