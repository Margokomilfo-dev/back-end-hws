import { body } from 'express-validator'
import { blogsRepository } from '../../repositores/blogs-repository'

export const _customIsBlogValidator = body('blogId').custom((value) => {
    if (value && typeof value === 'string' && value.trim()) {
        const blog = blogsRepository.getBlogById(value)
        if (!blog) {
            throw new Error('no blog with this blogId')
        } else return true
    }
    return true
})
