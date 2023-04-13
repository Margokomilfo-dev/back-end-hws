import { rateCollection } from '../mongo/db'
import dateFns from 'date-fns/addSeconds'

export const rateRepository = {
    async createAttempt(attempt: AttemptType): Promise<void> {
        await rateCollection.insertOne({
            date: new Date(),
            url: attempt.url,
            ip: attempt.ip,
        })
    },
    async checkAttempts(ip: string, url: string): Promise<AttemptType[]> {
        return rateCollection
            .find({ ip, url, date: { $gte: dateFns(new Date(), -10), $lt: new Date() } })
            .toArray()
    },
}
export type AttemptType = {
    url: string
    ip: string
    date: Date
}
