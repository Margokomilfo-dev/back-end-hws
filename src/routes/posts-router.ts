import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import { postsRepository } from '../repositores/posts-repository'

export const postsRouter = Router({})

postsRouter.get('/', (req: Request, res: Response) => {
    const posts = postsRepository.getPosts()
    res.status(CodeResponsesEnum.Success_200).send(posts)
})

// postsRouter.post(
//     '/',
//     videoTitleValidator,
//     videoAuthorValidator,
//     errorsResultMiddleware,
//     (req: Request, res: Response) => {
//         const title = req.body.title
//         const author = req.body.author
//         const availableResolutions = req.body.availableResolutions
//
//         const newVideo = videosRepository.createVideo(
//             title,
//             author,
//             availableResolutions
//         )
//
//         if (newVideo) {
//             res.status(CodeResponsesEnum.Created_201).send(newVideo) //если сделать sendStatus - не дойдем до send
//         } else {
//             res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
//         }
//     }
// )
// //здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
// postsRouter.get(
//     '/:id',
//     idIntParamValidationMiddleware,
//     (req: Request, res: Response) => {
//         const id = +req.params.id //if NaN - return !id === false
//
//         const video = videosRepository.getVideoById(id)
//         if (video) {
//             res.status(CodeResponsesEnum.Success_200).send(video)
//         } else {
//             res.sendStatus(CodeResponsesEnum.Not_found_404)
//         }
//     }
// )
//
// //здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
// postsRouter.put(
//     '/:id',
//     idIntParamValidationMiddleware,
//     videoTitleValidator,
//     videoAuthorValidator,
//     videoCanBeDownloadedValidator,
//     videoMinAgeRestrictionValidator,
//     videoPublicationDateValidator,
//     errorsResultMiddleware,
//     (req: Request, res: Response) => {
//         const id = +req.params.id
//         const isUpdated = videosRepository.updateVideo(id, req.body)
//         if (!isUpdated) {
//             res.sendStatus(CodeResponsesEnum.Not_found_404)
//             return
//         }
//         res.sendStatus(CodeResponsesEnum.Not_content_204)
//     }
// )
//
// //здесь может быть ошибка, так как Ваня здесь не проверяет на id и в случае ошибки лн вернет 404
// postsRouter.delete(
//     '/:id',
//     idIntParamValidationMiddleware,
//     (req: Request, res: Response) => {
//         const id = +req.params.id
//         const isDeleted = videosRepository.deleteVideo(id)
//         if (isDeleted) {
//             res.sendStatus(CodeResponsesEnum.Not_content_204)
//         } else {
//             res.sendStatus(CodeResponsesEnum.Not_found_404)
//         }
//     }
// )
export type PostType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
}
