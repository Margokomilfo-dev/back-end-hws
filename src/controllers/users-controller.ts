import { UsersService } from '../services/users-service'
import { Request, Response } from 'express'
import { paginationQueries } from '../assets/pagination'
import { CodeResponsesEnum } from '../types'
import { inject, injectable } from 'inversify'

@injectable()
export class UsersController {
    constructor(@inject(UsersService) protected usersService: UsersService) {}
    async getUsers(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection } = paginationQueries(req)

        let searchLoginTerm = req.query.searchLoginTerm
            ? req.query.searchLoginTerm.toString()
            : null

        let searchEmailTerm = req.query.searchEmailTerm
            ? req.query.searchEmailTerm.toString()
            : null

        const users = await this.usersService.getUsers(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm
        )
        const usersCount = await this.usersService.getUsersCount(searchLoginTerm, searchEmailTerm)
        const result = {
            pagesCount: Math.ceil(usersCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: usersCount,
            items: users,
        }
        res.status(CodeResponsesEnum.Success_200).send(result)
    }
    async createUser(req: Request, res: Response) {
        const login = req.body.login
        const email = req.body.email
        const password = req.body.password

        const newUser = await this.usersService.createUser(login, email, password)

        if (newUser) {
            res.status(CodeResponsesEnum.Created_201).send(newUser)
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
    async deleteUser(req: Request, res: Response) {
        const id = req.params.id
        const isDeleted = await this.usersService.deleteUser(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
}
