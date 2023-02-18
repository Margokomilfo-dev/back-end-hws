import { body } from 'express-validator'
import { blogsRepository } from '../../repositores/blogs-db-repository'

export const _customIsBlogValidator = body('blogId').custom(async (value) => {
    if (value && typeof value === 'string' && value.trim()) {
        const blog = await blogsRepository.getBlogById(value)
        if (!blog) {
            throw new Error('no blog with this blogId')
        } else return true
    }
    return true
})
