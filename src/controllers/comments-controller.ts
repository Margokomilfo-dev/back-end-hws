import { CommentsService } from '../services/comments-service'
import { Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'

export class CommentsController {
    constructor(private commentsService: CommentsService) {}
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
    async updateCommentLikes(req: Request, res: Response) {
        const commentId = req.params.commentId?.toString().trim()
        const likeStatus = req.body.likeStatus
        const comment = await this.commentsService.updateLikeStatus(commentId, likeStatus)
        if (!comment) {
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
