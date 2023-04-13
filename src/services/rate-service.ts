import { AttemptType, rateRepository } from '../repositores/rate-db-repository'

export const rateService = {
    async createAttempt(attempt: AttemptType): Promise<void> {
        return rateRepository.createAttempt(attempt)
    },
    async checkAttempts(ip: string, url: string) {
        return rateRepository.checkAttempts(ip, url)
    },
}
