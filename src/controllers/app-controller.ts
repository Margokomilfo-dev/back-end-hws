import { VideosRepository } from '../repositores/videos-db-repository'
import { BlogsRepository } from '../repositores/blogs-db-repository'
import { CommentRepository } from '../repositores/comments-db-repository'
import { UsersRepository } from '../repositores/users-db-repository'
import { PostsRepository } from '../repositores/posts-db-repository'
import { SecurityRepository } from '../repositores/security-db-repository'
import { LikesRepository } from '../repositores/likes-db-repository'
import { Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'

export class AppController {
    constructor(
        private videosRepository: VideosRepository,
        private blogsRepository: BlogsRepository,
        private commentsRepository: CommentRepository,
        private usersRepository: UsersRepository,
        private postsRepository: PostsRepository,
        private securityRepository: SecurityRepository,
        private likesRepository: LikesRepository
    ) {}
    async deleteAll(req: Request, res: Response) {
        await this.videosRepository.deleteAll()
        await this.blogsRepository.deleteAll()
        await this.postsRepository.deleteAll()
        await this.usersRepository.deleteAll()
        await this.commentsRepository.deleteAll()
        await this.securityRepository.deleteAll()
        await this.likesRepository.deleteAll()
        res.sendStatus(CodeResponsesEnum.Not_content_204)
    }
}
