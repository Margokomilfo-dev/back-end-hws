import { Router } from 'express'
import { container } from '../composition-root'
import { SecurityController } from '../controllers/security-controller'
import { CheckCookiesAndUserMiddleware } from '../middlewares/getCookiesMiddleware'

export const securityRouter = Router({})

const securityController = container.resolve(SecurityController)
const checkCookiesAndUserMiddleware = container.resolve(CheckCookiesAndUserMiddleware)

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
