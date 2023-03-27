import addDays from 'date-fns/addDays'
import { VideoType } from '../routes/videos-router'
import { videosRepository } from '../repositores/videos-db-repository'

export const videosService = {
    async getVideos() {
        return videosRepository.getVideos()
    },
    async getVideoById(id: number): Promise<VideoType | null> {
        return videosRepository.getVideoById(id)
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
            availableResolutions: availableResolutions ? availableResolutions : null,
        }
        return videosRepository.createVideo(newVideo)
    },
    async updateVideo(id: number, body: any): Promise<boolean> {
        return videosRepository.updateVideo(id, body)
    },

    async deleteVideo(id: number): Promise<boolean> {
        return videosRepository.deleteVideo(id)
    },
    async deleteAll() {
        return videosRepository.deleteAll()
    },
}
