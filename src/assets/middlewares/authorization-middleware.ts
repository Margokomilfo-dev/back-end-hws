import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../../types'

export const authorizationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let auth
    if (req.headers['authorization']) {
        auth = new Buffer(req.headers.authorization.substring(6), 'base64')
            .toString()
            .split(':')
    }
    if (!auth || auth[0] !== 'admin' || auth[1] !== 'qwerty') {
        res.sendStatus(CodeResponsesEnum.Not_Authorized)
        return
    } else next()
}
