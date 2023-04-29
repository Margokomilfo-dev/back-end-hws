import { Router } from 'express'
import { checkCookiesAndUserMiddleware } from '../middlewares/getCookiesMiddleware'
import { securityController } from '../composition-root'

export const securityRouter = Router({})

securityRouter.get(
    '/devices',
    checkCookiesAndUserMiddleware.checkCookiesAndUser.bind(checkCookiesAndUserMiddleware),
    securityController.getDevices.bind(securityController)
)
securityRouter.delete(
    '/devices',
    checkCookiesAndUserMiddleware.checkCookiesAndUser.bind(checkCookiesAndUserMiddleware),
    securityController.deleteDevices.bind(securityController)
)
securityRouter.delete(
    '/devices/:deviceId',
    checkCookiesAndUserMiddleware.checkCookiesAndUser.bind(checkCookiesAndUserMiddleware),
    securityController.deleteDevice.bind(securityController)
)
