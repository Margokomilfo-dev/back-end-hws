import { body, check } from 'express-validator'

export const titleValidator = body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required')
    .isLength({ min: 1, max: 40 })
    .withMessage('title should contain  1 - 40 symbols')

export const authorValidator = body('author')
    .trim()
    .notEmpty()
    .withMessage('author is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('more than 20 symbols')

export const canBeDownloadedValidator = body('canBeDownloaded')
    .optional()
    .isBoolean()
    .withMessage('not boolean')

export const minAgeRestrictionValidator = body('minAgeRestriction')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 18 })
    .withMessage('not correct')

export const publicationDateValidator = check('publicationDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('not correct')
