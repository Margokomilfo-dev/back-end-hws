import { VideosService } from '../services/videos-service'
import { Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { inject, injectable } from 'inversify'

@injectable()
export class VideosController {
    constructor(@inject(VideosService) protected videosService: VideosService) {}
    async getVideos(req: Request, res: Response) {
        const videos = await this.videosService.getVideos()
        res.status(CodeResponsesEnum.Success_200).send(videos)
    }
    async createVideo(req: Request, res: Response) {
        const title = req.body.title
        const author = req.body.author
        const availableResolutions = req.body.availableResolutions

        const newVideo = await this.videosService.createVideo(title, author, availableResolutions)

        if (newVideo) {
            res.status(CodeResponsesEnum.Created_201).send(newVideo) //если сделать sendStatus - не дойдем до send
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
    async getVideo(req: Request, res: Response) {
        const id = +req.params.id //if NaN - return !id === false

        const video = await this.videosService.getVideoById(id)
        if (video) {
            res.status(CodeResponsesEnum.Success_200).send(video)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
    async updateVideo(req: Request, res: Response) {
        const id = +req.params.id
        const isUpdated = await this.videosService.updateVideo(id, req.body)
        if (!isUpdated) {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
            return
        }
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
    async deleteVideo(req: Request, res: Response) {
        const id = +req.params.id
        const isDeleted = await this.videosService.deleteVideo(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}
