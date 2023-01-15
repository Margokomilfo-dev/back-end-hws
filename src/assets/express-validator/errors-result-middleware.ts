import { validationResult } from 'express-validator'
import { NextFunction, Request, Response } from 'express'
import { ResolutionsEnum } from '../../routes/videos-router'

export const errorsResultMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req)
    if (req.body.availableResolutions && req.body.availableResolutions.length) {
        req.body.availableResolutions.forEach((resolution: string) => {
            if (!Object.keys(ResolutionsEnum).includes(resolution)) {
                // @ts-ignore
                errors.errors.push({
                    param: 'availableResolutions',
                    msg: 'exist not valid value',
                    value: 'some value',
                    location: 'body',
                })
                return
            }
        })
    }
    if (!errors.isEmpty()) {
        res.status(400).send({
            errorsMessages: errors
                .array({ onlyFirstError: true })
                .map((err) => {
                    return { message: err.msg, field: err.param }
                }),
        })
        return
    } else {
        next()
    }
}
