import addDays from 'date-fns/addDays'
import { VideosRepository, VideoType } from '../repositores/videos-db-repository'

export class VideosService {
    constructor(private videosRepository: VideosRepository) {}
    async getVideos() {
        return this.videosRepository.getVideos()
    }

    async getVideoById(id: number): Promise<VideoType | null> {
        return this.videosRepository.getVideoById(id)
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

        return this.videosRepository.createVideo(newVideo)
    }

    async updateVideo(id: number, body: any): Promise<boolean> {
        return this.videosRepository.updateVideo(id, body)
    }

    async deleteVideo(id: number): Promise<boolean> {
        return this.videosRepository.deleteVideo(id)
    }

    async deleteAll() {
        return this.videosRepository.deleteAll()
    }
}
