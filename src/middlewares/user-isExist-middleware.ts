import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { usersService } from '../services/users-service'

export const userIsExistMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let recoveryCode = req.body.recoveryCode
    const user = await usersService.getUserByConfirmationCode(recoveryCode)
    if (!user) {
        res.status(CodeResponsesEnum.Incorrect_values_400).send({
            errorsMessages: [{ message: 'recoveryCode is required', field: 'recoveryCode' }],
        })
        return
    }
    next()
}
