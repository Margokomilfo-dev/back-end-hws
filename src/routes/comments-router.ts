import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'

import { commentContentValidator } from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import {
    idStringParamValidationMiddleware,
    isMineCommentValidationMiddleware,
} from '../assets/express-validator/id-int-param-validation-middleware'
import { bearerAuthorizationMiddleware } from '../middlewares/bearer-authorization-middleware'
import { commentsService } from '../services/comments-service'

export const commentsRouter = Router({})
class CommentsController {
    async getComment(req: Request, res: Response) {
        const id = req.params.id

        const comment = await commentsService.getCommentById(id)
        if (comment) {
            res.status(CodeResponsesEnum.Success_200).send(comment)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
    async updateComment(req: Request, res: Response) {
        const id = req.params.id?.toString().trim()
        const content = req.body.content

        const isUpdated = await commentsService.updateComment(id, content)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteComment(req: Request, res: Response) {
        const id = req.params.id
        const isDeleted = await commentsService.deleteComment(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}
const commentController = new CommentsController()
//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
commentsRouter.get('/:id', idStringParamValidationMiddleware, commentController.getComment)

commentsRouter.put(
    '/:id',
    bearerAuthorizationMiddleware,
    idStringParamValidationMiddleware,
    commentContentValidator,
    isMineCommentValidationMiddleware,
    errorsResultMiddleware,
    commentController.updateComment
)

//здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
commentsRouter.delete(
    '/:id',
    bearerAuthorizationMiddleware,
    idStringParamValidationMiddleware,
    isMineCommentValidationMiddleware,
    commentController.deleteComment
)
