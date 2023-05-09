import { AttemptType, RateRepository } from '../repositores/rate-db-repository'
import { inject, injectable } from 'inversify'

@injectable()
export class RateService {
    constructor(@inject(RateRepository) protected rateRepository: RateRepository) {}
    async createAttempt(attempt: AttemptType): Promise<void> {
        return this.rateRepository.createAttempt(attempt)
    }
    async checkAttempts(ip: string, url: string) {
        return this.rateRepository.checkAttempts(ip, url)
    }
}

//export const rateService = new RateService()
