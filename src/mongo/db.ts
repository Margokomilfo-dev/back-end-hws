import { MongoClient } from 'mongodb'
import { VideoType } from '../routes/videos-router'
import { BlogType } from '../routes/blogs-router'
import { PostType } from '../routes/posts-router'

import * as dotenv from 'dotenv'
dotenv.config()

const mongoURI = process.env.mongoURI || 'mongodb://0.0.0.0:27017'
console.log(mongoURI)

const client = new MongoClient(mongoURI)
const db = client.db('hw')
export const videosCollection = db.collection<VideoType>('videos')
export const blogsCollection = db.collection<BlogType>('blogs')
export const postsCollection = db.collection<PostType>('posts')

export async function runDb() {
    try {
        await client.connect()
        await db.command({ ping: 1 })
        console.log('it is ok')
    } catch (e) {
        console.log('no connection')
        await client.close()
    }
}
