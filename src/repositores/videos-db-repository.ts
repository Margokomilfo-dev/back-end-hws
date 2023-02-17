import addDays from 'date-fns/addDays'
import { VideoType } from '../routes/videos-router'
import { videosCollection } from './db'

export const videosRepository = {
    async getVideos() {
        return videosCollection.find({}, { projection: { _id: 0 } }).toArray()
    },
    async getVideoById(id: number): Promise<VideoType | null> {
        return videosCollection.findOne({ id }, { projection: { _id: 0 } })
    },
    async createVideo(
        title: string,
        author: string,
        availableResolutions: Array<string> | null | undefined
    ): Promise<VideoType | null> {
        const newVideo = {
            id: new Date().getTime(),
            title,
            author,
            canBeDownloaded: false, //By default - false
            minAgeRestriction: null, //maximum: 18, minimum: 1, default: null, nullable: true - null - no restriction
            createdAt: new Date().toISOString(),
            publicationDate: addDays(new Date(), 1).toISOString(), //By default - +1 day from CreatedAt
            availableResolutions: availableResolutions
                ? availableResolutions
                : null,
        }
        await videosCollection.insertOne(newVideo)
        return this.getVideoById(newVideo.id)
    },
    async updateVideo(id: number, body: any): Promise<boolean> {
        // const ourVideo = await this.getVideoById(id)
        // if (!ourVideo) {
        //     return false
        // }
        const res = await videosCollection.updateOne(
            { id },
            { $set: { ...body } }
        )
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
