import dateFns from 'date-fns/addSeconds'
import { RateModel } from '../mongo/rate/rate.model'

export const rateRepository = {
    async createAttempt(attempt: AttemptType): Promise<void> {
        await RateModel.insertMany({
            date: new Date(),
            url: attempt.url,
            ip: attempt.ip,
        })
    },
    async checkAttempts(ip: string, url: string): Promise<AttemptType[]> {
        return RateModel.find({
            ip,
            url,
            date: { $gte: dateFns(new Date(), -10), $lt: new Date() },
        })
    },
}
export type AttemptType = {
    url: string
    ip: string
    date: Date
}
