import { body } from 'express-validator'
import { blogsRepository } from '../../repositores/blogs-db-repository'
import { usersService } from '../../services/users-service'

export const _customIsBlogValidator = body('blogId').custom(async (value) => {
    if (value && typeof value === 'string' && value.trim()) {
        const blog = await blogsRepository.getBlogById(value)
        if (!blog) {
            throw new Error('no blog with this blogId')
        } else return true
    }
    return true
})

export const _customUserValidator = body('code').custom(async (value) => {
    if (value && typeof value === 'string' && value.trim()) {
        const user = await usersService.getUserByLoginOrEmail(value)
        if (!user) {
            throw new Error('user is not confirmed')
        } else return true
    }
    return true
})

export const _customIsUserValidator = body('email').custom(async (value) => {
    if (value && typeof value === 'string' && value.trim()) {
        const user = await usersService.getUserByLoginOrEmail(value)
        if (!user) {
            throw new Error('not user with this email')
        } else return true
    }
    return true
})
