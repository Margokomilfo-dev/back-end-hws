import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { RateService } from '../services/rate-service'
import { inject, injectable } from 'inversify'

@injectable()
export class RateLimitMiddleware {
    constructor(@inject(RateService) protected rateService: RateService) {}
    async middleware(req: Request, res: Response, next: NextFunction) {
        let ip = '127.0.0.1'
        if (req.ip) ip = req.ip
        const date = new Date()
        const url = req.originalUrl
        await this.rateService.createAttempt({ url, date, ip })
        const attemptsCount = await this.rateService.checkAttempts(ip, url)
        if (attemptsCount.length > 15) {
            res.sendStatus(CodeResponsesEnum.Too_many_requests_429)
            return
        }
        next()
    }
}

// export const rateLimitMiddleware = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     let ip = '127.0.0.1'
//     if (req.ip) ip = req.ip
//     const date = new Date()
//     const url = req.originalUrl
//     await rateService.createAttempt({ url, date, ip })
//     const attemptsCount = await rateService.checkAttempts(ip, url)
//     if (attemptsCount.length > 15) {
//         res.sendStatus(CodeResponsesEnum.Too_many_requests_429)
//         return
//     }
//     next()
// }
