import { CommentRepository } from './repositores/comments-db-repository'
import { CommentsService } from './services/comments-service'
import { CommentsController } from './controllers/comments-controller'
import { PostsRepository } from './repositores/posts-db-repository'
import { PostsService } from './services/posts-service'
import { PostsController } from './controllers/posts-controller'
import { BlogsRepository } from './repositores/blogs-db-repository'
import { BlogsService } from './services/blogs-service'
import { BlogsController } from './controllers/blogs-controller'
import { ParamsValidatorsMiddleware } from './assets/express-validator/param-validation-middleware'
import { UsersRepository } from './repositores/users-db-repository'
import { UsersService } from './services/users-service'
import { CryptoService } from './services/crypto-service'
import { UsersController } from './controllers/users-controller'
import { VideosRepository } from './repositores/videos-db-repository'
import { VideosService } from './services/videos-service'
import { VideosController } from './controllers/video-controller'
import { AuthService } from './services/auth-service'
import { EmailService } from './services/email-service'
import { AuthController } from './controllers/auth-controller'
import { SecurityService } from './services/security-service'
import { JwtService } from './services/jwt-service'
import { SecurityController } from './controllers/security-controller'
import { CustomValidator } from './assets/express-validator/custom-validators'
import { BearerAuthorizationMiddleware } from './middlewares/bearer-authorization-middleware'
import { CommonMiddleware } from './middlewares/common-middleware'

//repos
const commentsRepository = new CommentRepository()
const postsRepository = new PostsRepository()
const blogsRepository = new BlogsRepository()
const usersRepository = new UsersRepository()
const videosRepository = new VideosRepository()

//services
const commentsService = new CommentsService(commentsRepository)
const postsService = new PostsService(postsRepository)
const blogsService = new BlogsService(blogsRepository)
const cryptoService = new CryptoService()
const usersService = new UsersService(usersRepository, cryptoService)
const videosService = new VideosService(videosRepository)
const emailService = new EmailService()
const authService = new AuthService(usersService, cryptoService, emailService)
const securityService = new SecurityService()
const jwtService = new JwtService()

//controllers
export const commentController = new CommentsController(commentsService)
export const postsController = new PostsController(postsService, commentsService, blogsService)
export const blogsController = new BlogsController(postsService, blogsService)
export const usersController = new UsersController(usersService)
export const videosController = new VideosController(videosService)
export const authController = new AuthController(
    usersService,
    authService,
    securityService,
    jwtService,
    emailService
)
export const securityController = new SecurityController(securityService, jwtService)

//common
export const paramsValidatorsMiddleware = new ParamsValidatorsMiddleware(usersService, blogsService)
export const customValidator = new CustomValidator(blogsRepository, usersService)
export const bearerAuthorizationMiddleware = new BearerAuthorizationMiddleware(
    usersService,
    jwtService
)
export const commonMiddleware = new CommonMiddleware(usersService, commentsService)
