import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const dbName = 'hw'
//const mongoURI = process.env.mongoURI || `mongodb://0.0.0.0:27017/${dbName}`
const mongoURI = process.env.MONGO_URI_FOR_STUDENTS || `mongodb://0.0.0.0:27017/${dbName}`

// const client = new MongoClient(mongoURI)
// const db = client.db('hw')
// export const blogsCollection = db.collection<BlogType>('blogs')

export async function runDb() {
    try {
        await mongoose.connect(mongoURI)
        console.log('it is ok')
    } catch (e) {
        console.log('no connection')
        await mongoose.disconnect()
    }
}
