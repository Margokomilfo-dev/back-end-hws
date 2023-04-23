import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { VideoType } from '../../repositores/videos-db-repository'

export const VideoSchema = new mongoose.Schema<WithId<VideoType>>({
    id: { type: Number, require: true },
    title: { type: String, require: true },
    author: { type: String, require: true },
    canBeDownloaded: { type: 'Boolean', default: false },
    minAgeRestriction: { type: Number, default: 0 },
    createdAt: { type: String, require: true },
    publicationDate: { type: String, require: true },
    availableResolutions: [{ type: String }],
})
