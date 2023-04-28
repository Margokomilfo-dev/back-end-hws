import { NextFunction, Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { UsersService } from '../services/users-service'
import { CommentsService } from '../services/comments-service'

class CommonMiddleware {
    usersService: UsersService
    commentsService: CommentsService
    constructor() {
        this.usersService = new UsersService()
        this.commentsService = new CommentsService()
    }
    async userIsExist(req: Request, res: Response, next: NextFunction) {
        let recoveryCode = req.body.recoveryCode
        const user = await this.usersService.getUserByConfirmationCode(
            recoveryCode
        )
        if (!user) {
            res.status(CodeResponsesEnum.Incorrect_values_400).send({
                errorsMessages: [
                    {
                        message: 'recoveryCode is required',
                        field: 'recoveryCode',
                    },
                ],
            })
            return
        }
        next()
    }
    async isMineComment(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id?.toString().trim()
        const comment = await this.commentsService.getCommentById(id)

        if (id && comment && req.userId !== comment.commentatorInfo.userId) {
            res.sendStatus(CodeResponsesEnum.Forbidden_403)
            return
        }
        next()
    }
}
export const commonMiddleware = new CommonMiddleware()

// export const userIsExistMiddleware = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     let recoveryCode = req.body.recoveryCode
//     const user = await usersService.getUserByConfirmationCode(recoveryCode)
//     if (!user) {
//         res.status(CodeResponsesEnum.Incorrect_values_400).send({
//             errorsMessages: [
//                 { message: 'recoveryCode is required', field: 'recoveryCode' },
//             ],
//         })
//         return
//     }
//     next()
// }
