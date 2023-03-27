import { VideoType } from '../routes/videos-router'
import { videosCollection } from '../mongo/db'

export const videosRepository = {
    async getVideos() {
        return videosCollection.find({}, { projection: { _id: 0 } }).toArray()
    },
    async getVideoById(id: number): Promise<VideoType | null> {
        return videosCollection.findOne({ id }, { projection: { _id: 0 } })
    },
    async createVideo(newVideo: VideoType): Promise<VideoType | null> {
        await videosCollection.insertOne(newVideo)
        return this.getVideoById(newVideo.id)
    },
    async updateVideo(id: number, body: any): Promise<boolean> {
        const res = await videosCollection.updateOne({ id }, { $set: { ...body } })
        return res.matchedCount === 1
    },

    async deleteVideo(id: number): Promise<boolean> {
        const res = await videosCollection.deleteOne({ id })
        return res.deletedCount === 1
    },
    async deleteAll() {
        return videosCollection.deleteMany({})
    },
}
