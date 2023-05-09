import { body } from 'express-validator'
import { BlogsRepository } from '../../repositores/blogs-db-repository'
import { UsersService } from '../../services/users-service'
import { inject, injectable } from 'inversify'

@injectable()
export class CustomValidator {
    constructor(
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository,
        @inject(UsersService) protected usersService: UsersService
    ) {}
    _customUserValidator = body('code').custom(async (value) => {
        if (value && typeof value === 'string' && value.trim()) {
            const user = await this.usersService.getUserByConfirmationCode(value)
            if (!user) {
                throw new Error('user in not found')
            }
            if (user && user.confirmationData.isConfirmed) {
                throw new Error('email is already confirmed')
            } else return true
        }
        return true
    })
    _customIsUserValidator = body('email').custom(async (value) => {
        if (value && typeof value === 'string' && value.trim()) {
            const user = await this.usersService.getUserByLoginOrEmail(value)
            if (!user) {
                throw new Error('not user with this email')
            }
            if (user && user.confirmationData.isConfirmed) {
                throw new Error('email is already confirmed')
            }
        }
        return true
    })
    _customIsBlogValidator = body('blogId').custom(async (value) => {
        if (value && typeof value === 'string' && value.trim()) {
            const blog = await this.blogsRepository.getBlogById(value)
            if (!blog) {
                throw new Error('no blog with this blogId')
            } else return true
        }
        return true
    })
}
