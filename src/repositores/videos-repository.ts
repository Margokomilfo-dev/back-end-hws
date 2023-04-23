import addDays from 'date-fns/addDays'
import { VideoType } from './videos-db-repository'

let videos: Array<VideoType> = [
    {
        id: 1,
        title: 'video 1',
        author: 'Margo',
        canBeDownloaded: false, //By default - false
        minAgeRestriction: 18, //maximum: 18, minimum: 1, default: null, nullable: true - null - no restriction
        createdAt: new Date().toISOString(),
        publicationDate: addDays(new Date(), 3).toISOString(), //By default - +1 day from CreatedAt
        availableResolutions: [],
    },
]

export const videosRepository = {
    async getVideos() {
        return videos
    },
    async getVideoById(id: number): Promise<VideoType | null> {
        const video = videos.find((video) => video.id === id)
        if (video) {
            return video
        } else {
            return null
        }
    },
    async createVideo(newVideo: VideoType): Promise<VideoType | null> {
        videos.push(newVideo)
        if (videos.find((video) => video.id === newVideo.id)) {
            return newVideo
        } else {
            return null
        }
    },
    async updateVideo(id: number, body: any): Promise<boolean> {
        const ourVideo = videos.find((video) => video.id === id)
        if (!ourVideo) {
            return false
        }
        videos = videos.map((video) => (video.id === id ? { ...video, ...body } : video))
        return true
    },
    async deleteVideo(id: number): Promise<boolean> {
        const video = videos.find((video) => video.id === id)
        if (video) {
            for (let i = 0; i < videos.length; i++) {
                if (videos[i].id === id) {
                    videos.splice(i, 1)
                    return true
                }
            }
            return false
        } else return false
    },
    async deleteAll() {
        videos.splice(0, videos.length)
        return videos
    },
}
