import { Request, Response, NextFunction } from 'express'
import { CodeResponsesEnum } from '../../types'

export const idParamValidationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //if NaN - return !id === false
    if (req.params.id && parseInt(req.params.id)) {
        next()
    } else {
        res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        return
    }
}
