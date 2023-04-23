import { AttemptType, rateRepository } from '../repositores/rate-db-repository'

class RateService {
    async createAttempt(attempt: AttemptType): Promise<void> {
        return rateRepository.createAttempt(attempt)
    }
    async checkAttempts(ip: string, url: string) {
        return rateRepository.checkAttempts(ip, url)
    }
}

export const rateService = new RateService()
