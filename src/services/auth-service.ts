import { CryptoService } from './crypto-service'
import { UsersService } from './users-service'
import { UserType } from '../repositores/users-db-repository'
import { EmailService } from './email-service'

export class AuthService {
    constructor(
        private usersService: UsersService,
        private cryptoService: CryptoService,
        private emailService: EmailService
    ) {}

    async checkCredentials(loginOrEmail: string, password: string): Promise<UserType | null> {
        const user = await this.usersService.getUserByLoginOrEmail(loginOrEmail)
        if (!user) return null
        const res = await this.cryptoService._compareHash(password, user)
        if (!res) return null
        return user
    }
    async resendingEmail(email: string, code: string): Promise<boolean> {
        try {
            return await this.emailService.sendEmail(
                email,
                'Email resending confirmation',
                `<h1>Email resending confirmation</h1>
                     <p>To finish email resending please follow the link below:
                         <a href='https://hellosite.com/resending-email?code=${code}'>complete changing your email</a>
                     </p>`
            )
        } catch (e) {
            return false
        }
    }
    async registrationSendEmail(email: string, code: string): Promise<boolean> {
        try {
            return this.emailService.sendEmail(
                email,
                'Registration confirmation',
                `<h1>Thank for your registration</h1>
                     <p>To finish registration please follow the link below:
                         <a href='https://hellosite.com/confirm-email?code=${code}'>complete registration</a>
                     </p>`
            )
        } catch (e) {
            return false
        }
    }
}
