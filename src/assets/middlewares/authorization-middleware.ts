import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../../types'

//1
const credentials = {
    login: 'admin',
    password: 'qwerty',
}
let data = `${credentials.login}:${credentials.password}`

export const authorizationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let data_ = Buffer.from(data)
    let base64data = data_.toString('base64') //закодированная string под base64
    const validAuthValue = `Basic ${base64data}` //вся кодировка 'Basic SDGSNstnsdgn' (admin:qwerty)
    let authHeader = req.headers.authorization

    if (authHeader && authHeader === validAuthValue) {
        next()
    } else res.sendStatus(CodeResponsesEnum.Not_Authorized)
}
//
// export let authorizationMiddleware = (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     let buff = Buffer.from(data) //string from auth - hcsakj23nj
//     let base64data = buff.toString('base64') //закодированная string под base64
//     const validAuthValue = `Basic ${base64data}` //вся кодировка 'Basic  SDGSNstnsdgn' (admin:qwerty)
//
//     let authHeader = req.headers.authorization
//
//     if (authHeader && authHeader === validAuthValue) {
//         next()
//     } else res.sendStatus(401)
// }
