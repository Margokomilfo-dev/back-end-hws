import { VideosRepository } from '../repositores/videos-db-repository'
import { BlogsRepository } from '../repositores/blogs-db-repository'
import { CommentRepository } from '../repositores/comments-db-repository'
import { UsersRepository } from '../repositores/users-db-repository'
import { PostsRepository } from '../repositores/posts-db-repository'
import { SecurityRepository } from '../repositores/security-db-repository'
import { LikesRepository } from '../repositores/likes-db-repository'
import { Request, Response } from 'express'
import { CodeResponsesEnum } from '../types'
import { inject, injectable } from 'inversify'

@injectable()
export class AppController {
    constructor(
        @inject(VideosRepository) protected videosRepository: VideosRepository,
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository,
        @inject(CommentRepository) protected commentsRepository: CommentRepository,
        @inject(UsersRepository) protected usersRepository: UsersRepository,
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(SecurityRepository) protected securityRepository: SecurityRepository,
        @inject(LikesRepository) protected likesRepository: LikesRepository
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
