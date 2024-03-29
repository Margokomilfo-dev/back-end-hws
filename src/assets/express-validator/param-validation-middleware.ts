import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../../types'
import { UsersService } from '../../services/users-service'
import { BlogsService } from '../../services/blogs-service'
import { inject, injectable } from 'inversify'

@injectable()
export class ParamsValidatorsMiddleware {
    constructor(
        @inject(UsersService) protected usersService: UsersService,
        @inject(BlogsService) protected blogService: BlogsService
    ) {}
    idIntParamValidationMiddleware(req: Request, res: Response, next: NextFunction) {
        //if NaN - return !id === false
        if (req.params.id) {
            const result = Number(req.params.id)
            if (isNaN(result)) {
                res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
                return
            }
            next()
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
            return
        }
    }

    idStringParamValidationMiddleware(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id?.toString().trim()
        if (!id) {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
            return
        } else next()
    }
    async blogIdStringParamValidationMiddleware(req: Request, res: Response, next: NextFunction) {
        let blogId = req.params.blogId?.toString().trim()
        if (blogId) {
            const res_ = await this.blogService.getBlogById(blogId)
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

    async userExistedParamValidationMiddleware(req: Request, res: Response, next: NextFunction) {
        let userId = req.params.id?.toString().trim()
        if (userId) {
            const res_ = await this.usersService.getUserById(userId)
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
    async postIdStringParamValidationMiddleware(req: Request, res: Response, next: NextFunction) {
        const postId = req.params.postId?.toString().trim()
        if (!postId) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        } else next()
    }

    async isLoginOrEmailExistsValidationMiddleware(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const isUser1 = await this.usersService.getUserByLoginOrEmail(req.body.login)
        const isUser2 = await this.usersService.getUserByLoginOrEmail(req.body.email)
        if (isUser1 && !isUser2) {
            res.status(CodeResponsesEnum.Incorrect_values_400).send({
                errorsMessages: [
                    {
                        message: 'login is already exist',
                        field: 'login',
                    },
                ],
            })
            return
        }
        if (!isUser1 && isUser2) {
            res.status(CodeResponsesEnum.Incorrect_values_400).send({
                errorsMessages: [
                    {
                        message: 'email is already exist',
                        field: 'email',
                    },
                ],
            })
            return
        }
        if (isUser1 && isUser2) {
            res.status(CodeResponsesEnum.Incorrect_values_400).send({
                errorsMessages: [
                    {
                        message: 'login is already exist',
                        field: 'login',
                    },
                    {
                        message: 'email is already exist',
                        field: 'email',
                    },
                ],
            })
            return
        }
        next()
    }
}
