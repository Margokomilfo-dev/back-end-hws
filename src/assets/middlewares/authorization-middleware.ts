import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../../types'

//1
export const authorizationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const credentials = {
        login: 'admin',
        password: 'qwerty',
    }
    let data = `${credentials.login}:${credentials.password}`
    let base64data = Buffer.from(data).toString('base64') //закодированная string под base64
    const validAuthValue = `Basic ${base64data}` //вся кодировка 'Basic SDGSNstnsdgn' (admin:qwerty)
    if (
        req.headers.authorization &&
        req.headers.authorization === validAuthValue
    ) {
        next()
    }
    return res.sendStatus(CodeResponsesEnum.Not_Authorized)
}
