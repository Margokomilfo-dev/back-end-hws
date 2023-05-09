import { UsersService } from '../services/users-service'
import { AuthService } from '../services/auth-service'
import { SecurityService } from '../services/security-service'
import { JwtService } from '../services/jwt-service'
import { EmailService } from '../services/email-service'
import { Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { firstPartsOfJWTToken, getJWTPayload } from '../assets/jwt-parse'
import { inject, injectable } from 'inversify'

@injectable()
export class AuthController {
    constructor(
        @inject(UsersService) protected usersService: UsersService,
        @inject(AuthService) protected authService: AuthService,
        @inject(SecurityService) protected securityService: SecurityService,
        @inject(JwtService) protected jwtService: JwtService,
        @inject(EmailService) protected emailService: EmailService
    ) {}
    async login(req: Request, res: Response) {
        let dName = 'non'
        let ipAddress = '127.0.0.1'
        if (req.headers['user-agent']) dName = req.headers['user-agent']
        if (req.ip) ipAddress = req.ip

        const password = req.body.password
        const loginOrEmail = req.body.loginOrEmail

        const user = await this.authService.checkCredentials(loginOrEmail, password)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
        } else {
            const deviceId = uuidv4()
            const token = await this.jwtService.createJWTToken(user)

            const refreshToken = await this.jwtService.createRefreshJWTToken(user, deviceId)
            const refreshTokenPart = firstPartsOfJWTToken(refreshToken)
            const payload = getJWTPayload(refreshToken)
            await this.securityService.create(
                deviceId,
                user.id,
                dName,
                refreshTokenPart,
                payload!.iat,
                ipAddress
            )

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
            })

            res.status(CodeResponsesEnum.Success_200).send({
                accessToken: token,
            })
        }
    }
    async passwordRecovery(req: Request, res: Response) {
        let email = req.body.email

        const user = await this.usersService.getUserByLoginOrEmail(email)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
            return
        }
        const updatedUser = await this.usersService.updateUserConfirmationCode(user.id)
        await this.emailService.sendEmail(
            email,
            'Email resending confirmation',
            `<h1>Password recovery confirmation</h1>
                     <p>To finish password recovery please follow the link below:
                        <a href='https://somesite.com/password-recovery?recoveryCode=${
                            updatedUser!.confirmationData.code
                        }'>recovery password</a>
                     </p>`
        )
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async refreshToken(req: Request, res: Response) {
        let dName = 'non'
        let ipAddress = '127.0.0.1'
        if (req.headers['user-agent']) dName = req.headers['user-agent']
        if (req.ip) ipAddress = req.ip
        const refreshToken = req.cookies.refreshToken
        const payload = getJWTPayload(refreshToken)

        const data = await this.jwtService.verifyAndGetUserIdByToken(refreshToken)
        const user = await this.usersService._getUserById(data!.userId)

        const token = await this.jwtService.createJWTToken(user!)
        const newRefreshToken = await this.jwtService.createRefreshJWTToken(
            user!,
            payload!.deviceId
        )
        const newRefreshTokenPart = firstPartsOfJWTToken(newRefreshToken)
        const newPayload = getJWTPayload(newRefreshToken)

        await this.securityService.update(payload!.deviceId, {
            deviceId: payload!.deviceId,
            userId: user!.id,
            ip: ipAddress,
            refreshTokenData: newRefreshTokenPart,
            title: dName,
            lastActiveDate: new Date(newPayload!.iat).toISOString(),
        })

        res.cookie('refreshToken', newRefreshToken, {
            //maxAge: 20000,
            httpOnly: true,
            secure: true,
        })
        res.status(CodeResponsesEnum.Success_200).send({
            accessToken: token,
        })
    }
    async newPassword(req: Request, res: Response) {
        let newPassword = req.body.newPassword
        let recoveryCode = req.body.recoveryCode

        const user = await this.usersService.getUserByConfirmationCode(recoveryCode)
        const updatedUser = await this.usersService.updateUserPassword(user!.id, newPassword)

        if (updatedUser) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async registration(req: Request, res: Response) {
        const login = req.body.login
        const password = req.body.password
        const email = req.body.email

        const createdUser = await this.usersService.createUser(login, email, password)

        if (!createdUser) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        const user = await this.usersService._getUserById(createdUser.id)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        const sendEmail = await this.authService.registrationSendEmail(
            email,
            user.confirmationData.code
        )
        if (!sendEmail) {
            res.status(CodeResponsesEnum.Incorrect_values_400).send({
                errorsMessages: [
                    {
                        message:
                            'сообщение не отправилось на почту, попробуй произвести регистрацию на другой почтовый адрес',
                        field: 'email',
                    },
                ],
            })
            return
        }

        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async registrationConfirmation(req: Request, res: Response) {
        const code = req.body.code
        await this.usersService.getAndUpdateUserByConfirmationCode(code)
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async registrationEmailResending(req: Request, res: Response) {
        const email = req.body.email
        const user = await this.usersService.getUserByLoginOrEmail(email)
        const updUser = await this.usersService.updateUserConfirmationCode(user!.id)
        if (!updUser) {
            res.sendStatus(405)
            return
        }
        const sendEmail = await this.authService.resendingEmail(
            email,
            updUser.confirmationData.code
        )
        if (!sendEmail) {
            res.sendStatus(406)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async logout(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken
        const data = await this.jwtService.verifyAndGetUserIdByToken(refreshToken)
        await this.securityService.deleteSession(data!.deviceId)
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async me(req: Request, res: Response) {
        const user = await this.usersService.getUserById(req.userId!)
        if (!user) {
            res.sendStatus(CodeResponsesEnum.Not_Authorized_401)
            return
        }
        const { id, email, login } = user
        res.status(CodeResponsesEnum.Success_200).send({
            email,
            login,
            userId: id,
        })
    }
}
