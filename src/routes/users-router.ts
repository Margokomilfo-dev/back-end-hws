import { Request, Response, Router } from 'express'
import { CodeResponsesEnum } from '../types'
import {
    userEmailValidator,
    userLoginValidator,
    userPasswordValidator,
} from '../assets/express-validator/field-validators'
import { errorsResultMiddleware } from '../assets/express-validator/errors-result-middleware'
import { userExistedParamValidationMiddleware } from '../assets/express-validator/id-int-param-validation-middleware'
import { usersService } from '../services/users-service'
import { paginationQueries } from '../assets/pagination'
import { usersRepository } from '../repositores/users-db-repository'
import { basicAuthorizationMiddleware } from '../middlewares/basic-authorization-middleware'

export const usersRouter = Router({})

usersRouter.get(
    '/',
    basicAuthorizationMiddleware,
    async (req: Request, res: Response) => {
        // searchLoginTerm: string, searchEmailTerm: string
        const { pageNumber, pageSize, sortBy, sortDirection } =
            paginationQueries(req)

        let searchLoginTerm = req.query.searchLoginTerm
            ? req.query.searchLoginTerm.toString()
            : null

        let searchEmailTerm = req.query.searchEmailTerm
            ? req.query.searchEmailTerm.toString()
            : null

        const users = await usersService.getUsers(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm
        )
        const usersCount = await usersRepository.getUsersCount(
            searchLoginTerm,
            searchEmailTerm
        )
        const result = {
            pagesCount: Math.ceil(usersCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: usersCount,
            items: users,
        }
        res.status(CodeResponsesEnum.Success_200).send(result)
    }
)

usersRouter.post(
    '/',
    basicAuthorizationMiddleware,
    userLoginValidator,
    userPasswordValidator,
    userEmailValidator,
    errorsResultMiddleware,
    async (req: Request, res: Response) => {
        const login = req.body.login
        const email = req.body.email
        const password = req.body.password

        const newUser = await usersService.createUser(login, email, password)

        if (newUser) {
            res.status(CodeResponsesEnum.Created_201).send(newUser)
        } else {
            res.sendStatus(CodeResponsesEnum.Incorrect_values_400)
        }
    }
)

usersRouter.delete(
    '/:id',
    basicAuthorizationMiddleware,
    userExistedParamValidationMiddleware,
    async (req: Request, res: Response) => {
        const id = req.params.id
        const isDeleted = await usersService.deleteUser(id)
        if (isDeleted) {
            res.sendStatus(CodeResponsesEnum.Not_content_204)
        } else {
            res.sendStatus(CodeResponsesEnum.Not_found_404)
        }
    }
)
