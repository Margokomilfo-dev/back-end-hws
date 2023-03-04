// @ts-ignore

declare global {
    namespace Express {
        export interface Request {
            userId: string | null
            userLogin: string | null
        }
    }
}
