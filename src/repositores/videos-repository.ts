import addDays from 'date-fns/addDays'
import { VideoType } from '../routes/videos-router'

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
    getVideos() {
        return videos
    },
    getVideoById(id: number): VideoType | null {
        const video = videos.find((video) => video.id === id)
        if (video) {
            return video
        } else {
            return null
        }
    },
    createVideo(
        title: string,
        author: string,
        availableResolutions: Array<string> | null | undefined
    ): VideoType | null {
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
        videos.push(newVideo)
        if (videos.find((video) => video.id === newVideo.id)) {
            return newVideo
        } else {
            return null
        }
    },
    updateVideo(id: number, body: any): boolean {
        const ourVideo = videos.find((video) => video.id === id)
        if (!ourVideo) {
            return false
        }
        videos = videos.map((video) =>
            video.id === id ? { ...video, ...body } : video
        )
        return true
    },
    deleteVideo(id: number): boolean {
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
    deleteAll() {
        videos.splice(0, videos.length)
        return videos
    },
}
