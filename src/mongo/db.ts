import { MongoClient } from 'mongodb'
import { PostType } from '../routes/posts-router'

import { UserType } from '../repositores/users-db-repository'
import dotenv from 'dotenv'
import { CommentType } from '../services/comments-service'
import { SecurityType } from '../repositores/security-db-repository'
import { AttemptType } from '../repositores/rate-db-repository'
import mongoose from 'mongoose'

dotenv.config()

const mongoURI = process.env.mongoURI || 'mongodb://0.0.0.0:27017'
console.log(mongoURI)
//const mongoURI = process.env.MONGO_URI_FOR_STUDENTS || 'mongodb://0.0.0.0:27017'
const dbName = 'hw'

const client = new MongoClient(mongoURI)
const db = client.db('hw')

//export const videosCollection = db.collection<VideoType>('videos')
// export const blogsCollection = db.collection<BlogType>('blogs')

export const postsCollection = db.collection<PostType>('posts')
export const usersCollection = db.collection<UserType>('users')
export const commentsCollection = db.collection<CommentType>('comments')
export const securityCollection = db.collection<SecurityType>('security')
export const rateCollection = db.collection<AttemptType>('rate')

export async function runDb() {
    try {
        await mongoose.connect(mongoURI + '/' + dbName)
        // await client.connect()
        await db.command({ ping: 1 })
        console.log('it is ok')
    } catch (e) {
        console.log('no connection')
        await mongoose.disconnect()
        // await client.close()
    }
}
