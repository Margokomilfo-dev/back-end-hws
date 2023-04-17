import { VideoType } from '../routes/videos-router'
import { BlogModel } from '../mongo/blog/blog.model'

export const videosRepository = {
    async getVideos() {
        return BlogModel.find({}, { projection: { _id: 0 } })
    },
    async getVideoById(id: number): Promise<VideoType | null> {
        return BlogModel.findOne({ id }, { projection: { _id: 0 } })
    },
    async createVideo(newVideo: VideoType): Promise<VideoType | null> {
        await BlogModel.insertMany([newVideo])
        return this.getVideoById(newVideo.id)
    },
    async updateVideo(id: number, body: any): Promise<boolean> {
        const res = await BlogModel.updateOne({ id }, { $set: { ...body } })
        return res.matchedCount === 1
    },

    async deleteVideo(id: number): Promise<boolean> {
        const res = await BlogModel.deleteOne({ id })
        return res.deletedCount === 1
    },
    async deleteAll() {
        return BlogModel.deleteMany({})
    },
}
