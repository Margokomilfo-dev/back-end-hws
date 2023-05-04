import { CommentsService } from '../services/comments-service'
import { Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { JwtService } from '../services/jwt-service'
import { LikeInfoEnum } from '../repositores/likes-db-repository'
import { LikesService } from '../services/likes-service'

export class CommentsController {
    constructor(
        private commentsService: CommentsService,
        private jwtService: JwtService,
        private likesService: LikesService
    ) {}
    async getComment(req: Request, res: Response) {
        const id = req.params.id

        const comment = await this.commentsService.getCommentById(id)

        //если пользователь не залогинен
        const token = req.headers.authorization?.split(' ')[1]
        let data = null
        if (token) data = await this.jwtService.verifyAndGetUserIdByToken(token)

        if (comment && !data?.userId) {
            const comment_ = {
                ...comment,
                likesInfo: { ...comment.likesInfo, myStatus: LikeInfoEnum.None },
            }
            res.status(CodeResponsesEnum.Success_200).send(comment_)
            return
        }

        if (comment && data && data.userId) {
            const usersStatusInfo = await this.likesService.getCommentStatus(
                data.userId,
                comment.id
            )

            res.status(CodeResponsesEnum.Success_200).send({
                ...comment,
                likesInfo: {
                    ...comment.likesInfo,
                    myStatus: usersStatusInfo ? usersStatusInfo.status : LikeInfoEnum.None,
                },
            })
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
        const userId = req.userId

        const comment = await this.commentsService.updateLikeStatus(commentId, likeStatus, userId!)
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
