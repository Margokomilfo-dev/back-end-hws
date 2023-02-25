import { Request, Response, NextFunction } from 'express'
import { CodeResponsesEnum } from '../../types'
import { blogsService } from '../../services/blogs-service'
import { usersService } from '../../services/users-service'

export const idIntParamValidationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //if NaN - return !id === false
    if (req.params.id && parseInt(req.params.id)) {
        next()
    } else {
        res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        return
    }
}

export const idStringParamValidationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id?.toString().trim()
    if (!id) {
        res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        return
    } else next()
}

export const blogIdStringParamValidationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let blogId = req.params.blogId?.toString().trim()
    if (blogId) {
        const res_ = await blogsService.getBlogById(blogId)
        if (res_) {
            next()
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
    } else {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
        return
    }
}

export const userExistedParamValidationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let userId = req.params.id?.toString().trim()
    if (userId) {
        const res_ = await usersService.getUserById(userId)
        if (res_) {
            next()
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
    } else {
        res.sendStatus(CodeResponsesEnum.Not_found_404)
        return
    }
}
