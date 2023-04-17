import mongoose from 'mongoose'
import { VideoSchema } from './video.schema'

export const VideoModel = mongoose.model('videos', VideoSchema)
