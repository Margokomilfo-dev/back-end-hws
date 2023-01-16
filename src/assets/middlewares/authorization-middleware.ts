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
    console.log(validAuthValue)
    console.log(req.headers)
    console.log(req.headers.authorization === validAuthValue)
    if (
        req.headers.authorization &&
        req.headers.authorization === validAuthValue
    ) {
        next()
    }
    res.sendStatus(CodeResponsesEnum.Not_Authorized)
}

//2
export let basicAuth = (req: Request, res: Response, next: NextFunction) => {
    const credentials = {
        login: 'admin',
        password: 'qwerty',
    }
    let data = `${credentials.login}:${credentials.password}`
    let buff = Buffer.from(data) //string from auth - hcsakj23nj
    let base64data = buff.toString('base64') //закодированная string под base64
    const validAuthValue = `Basic ${base64data}` //вся кодировка 'Basic  SDGSNstnsdgn' (admin:qwerty)

    let authHeader = req.headers.authorization

    if (authHeader && authHeader === validAuthValue) {
        next()
    } else res.sendStatus(401)
}
