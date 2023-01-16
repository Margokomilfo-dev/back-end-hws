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
    //данные логина и пароля обязательны снаружи! Почему??? хзиначе не работает кодирование с переменными внутри
    let base64data = Buffer.from(data).toString('base64') //закодированная string под base64
    const validAuthValue = `Basic ${base64data}` //вся кодировка 'Basic SDGSNstnsdgn' (admin:qwerty)
    let authHeader = req.headers.authorization

    if (authHeader && authHeader === validAuthValue) {
        next()
    } else res.sendStatus(CodeResponsesEnum.Not_Authorized)
}
