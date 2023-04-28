import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'

import { commentContentValidator } from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { paramsValidatorsMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { bearerAuthorizationMiddleware } from '../middlewares/bearer-authorization-middleware'
import { CommentsService } from '../services/comments-service'
import { commonMiddleware } from '../middlewares/common-middleware'

export const commentsRouter = Router({})
class CommentsController {
    commentsService: CommentsService
    constructor() {
        this.commentsService = new CommentsService()
    }
    async getComment(req: Request, res: Response) {
        const id = req.params.id

        const comment = await this.commentsService.getCommentById(id)
        if (comment) {
            res.status(CodeResponsesEnum.Success_200).send(comment)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
    async updateComment(req: Request, res: Response) {
        const id = req.params.id?.toString().trim()
        const content = req.body.content

        const isUpdated = await this.commentsService.updateComment(id, content)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteComment(req: Request, res: Response) {
        const id = req.params.id
        const isDeleted = await this.commentsService.deleteComment(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}
const commentController = new CommentsController()

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
commentsRouter.get(
    '/:id',
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    commentController.getComment.bind(commentController)
)

commentsRouter.put(
    '/:id',
    bearerAuthorizationMiddleware.auth.bind(bearerAuthorizationMiddleware),
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    commentContentValidator,
    commonMiddleware.isMineComment.bind(commonMiddleware),
    errorsResultMiddleware,
    commentController.updateComment.bind(commentController)
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
commentsRouter.delete(
    '/:id',
    bearerAuthorizationMiddleware.auth.bind(bearerAuthorizationMiddleware),
    paramsValidatorsMiddleware.idStringParamValidationMiddleware.bind(
        paramsValidatorsMiddleware
    ),
    commonMiddleware.isMineComment.bind(commonMiddleware),
    commentController.deleteComment.bind(commentController)
)
