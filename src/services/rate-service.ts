import { AttemptType, RateRepository } from '../repositores/rate-db-repository'

export class RateService {
    rateRepository: RateRepository
    constructor() {
        this.rateRepository = new RateRepository()
    }
    async createAttempt(attempt: AttemptType): Promise<void> {
        return this.rateRepository.createAttempt(attempt)
    }
    async checkAttempts(ip: string, url: string) {
        return this.rateRepository.checkAttempts(ip, url)
    }
}

//export const rateService = new RateService()
