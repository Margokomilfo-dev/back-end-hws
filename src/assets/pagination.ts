import { Request } from 'express'

export const paginationQueries = (req: Request) => {
    let pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1
    let pageSize = req.query.pageSize ? +req.query.pageSize : 10
    let sortBy = req.query.sortBy ? req.query.sortBy.toString() : 'createdAt'
    let sortDirection =
        req.query.sortDirection && req.query.sortDirection.toString() === 'asc' ? 'asc' : 'desc'

    return { pageNumber, pageSize, sortBy, sortDirection }
}
