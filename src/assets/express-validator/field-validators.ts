import { body } from 'express-validator'
import { LikeInfoEnum } from '../../repositores/likes-db-repository'

export const videoTitleValidator = body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required')
    .isLength({ min: 1, max: 40 })
    .withMessage('title should contain 1 - 40 symbols')

export const videoAuthorValidator = body('author')
    .trim()
    .notEmpty()
    .withMessage('author is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('more than 20 symbols')

export const videoCanBeDownloadedValidator = body('canBeDownloaded')
    .optional()
    .isBoolean()
    .withMessage('not boolean')

export const videoMinAgeRestrictionValidator = body('minAgeRestriction')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 18 })
    .withMessage('not correct')

export const videoPublicationDateValidator = body('publicationDate')
    .optional()
    .isISO8601()
    .matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/g)
    .withMessage('not correct')

export const blogNameValidator = body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 2, max: 15 })
    .withMessage('name should contain 2 - 15 symbols')

export const blogDescriptionValidator = body('description')
    .trim()
    .notEmpty()
    .withMessage('description is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('description should contain 2 - 500 symbols')

export const blogWebsiteUrlValidator = body('websiteUrl')
    .trim()
    .notEmpty()
    .withMessage('websiteUrl is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('websiteUrl should contain 2 - 100 symbols')
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('not correct')

export const postTitleValidator = body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('title should contain 2 - 30 symbols')

export const postShortDescriptionValidator = body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('shortDescription is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('shortDescription should contain 2 - 100 symbols')

export const postContentValidator = body('content')
    .trim()
    .notEmpty()
    .withMessage('content is required')
    .isLength({ min: 2, max: 1000 })
    .withMessage('content should contain 2 - 1000 symbols')

export const postBlogIdValidator = body('blogId')
    .trim()
    .notEmpty()
    .withMessage('blogId is required')
    .isLength({ min: 1, max: 15 })
    .withMessage('blogId contain  1 - 15 symbols')

export const loginValidator = body('login')
    .trim()
    .notEmpty()
    .withMessage('login is required')
    .isLength({ min: 3, max: 10 })
    .withMessage('login should contain 3 - 10 symbols')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('not correct')

export const passwordValidator = body('password')
    .trim()
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 6, max: 20 })
    .withMessage('password should contain 6 - 20 symbols')

export const newPasswordValidator = body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 6, max: 20 })
    .withMessage('newPassword should contain 6 - 20 symbols')

export const recoveryCodeValidator = body('recoveryCode')
    .trim()
    .notEmpty()
    .withMessage('recoveryCode is required')

export const userLoginOrEmailValidator = body('loginOrEmail')
    .trim()
    .notEmpty()
    .withMessage('loginOrEmail is required')
    .isLength({ min: 3, max: 10 })
    .withMessage('loginOrEmail should contain min 3 symbols')

export const emailValidator = body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('not correct')

export const commentContentValidator = body('content')
    .trim()
    .notEmpty()
    .withMessage('content is required')
    .isLength({ min: 20, max: 300 })
    .withMessage('content should contain 20 - 300 symbols')

export const codeValidator = body('code')
    .trim()
    .notEmpty()
    .withMessage('code is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('code should contain 5 - 100 symbols')

export const likeStatusValidator = body('likeStatus')
    .trim()
    .notEmpty()
    .withMessage('likeStatus is required')
    .isString()
    .isIn(Object.values(LikeInfoEnum))
    .withMessage('not correct')
