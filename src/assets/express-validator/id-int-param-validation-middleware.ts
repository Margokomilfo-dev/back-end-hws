import { Request, Response, NextFunction } from 'express'
import { CodeResponsesEnum } from '../../types'

export const idIntParamValidationMiddleware = (
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
export const idStringParamValidationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id?.toString().trim()
    if (!id) {
        res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        return
    } else next()
}
