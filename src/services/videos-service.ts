import addDays from 'date-fns/addDays'
import { videosRepository, VideoType } from '../repositores/videos-db-repository'

class VideoService {
    async getVideos() {
        return videosRepository.getVideos()
    }

    async getVideoById(id: number): Promise<VideoType | null> {
        return videosRepository.getVideoById(id)
    }

    async createVideo(
        title: string,
        author: string,
        availableResolutions: Array<string> | null | undefined
    ): Promise<VideoType | null> {
        const newVideo = new VideoType(
            new Date().getTime(),
            title,
            author,
            false, //By default - false
            null, //maximum: 18, minimum: 1, default: null, nullable: true - null - no restriction
            new Date().toISOString(),
            addDays(new Date(), 1).toISOString(), //By default - +1 day from CreatedAt
            availableResolutions ? availableResolutions : null
        )

        return videosRepository.createVideo(newVideo)
    }

    async updateVideo(id: number, body: any): Promise<boolean> {
        return videosRepository.updateVideo(id, body)
    }

    async deleteVideo(id: number): Promise<boolean> {
        return videosRepository.deleteVideo(id)
    }

    async deleteAll() {
        return videosRepository.deleteAll()
    }
}

export const videosService = new VideoService()
