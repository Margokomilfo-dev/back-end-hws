import dateFns from 'date-fns/addSeconds'
import { RateModel } from '../mongo/rate/rate.model'
import { injectable } from 'inversify'

@injectable()
export class RateRepository {
    async createAttempt(attempt: AttemptType): Promise<void> {
        await RateModel.insertMany({
            date: new Date(),
            url: attempt.url,
            ip: attempt.ip,
        })
    }
    async checkAttempts(ip: string, url: string): Promise<AttemptType[]> {
        return RateModel.find({
            ip,
            url,
            date: { $gte: dateFns(new Date(), -10), $lt: new Date() },
        })
    }
}

export class AttemptType {
    constructor(public url: string, public ip: string, public date: Date) {}
}
