import { Router } from 'express'
import { loginController } from './auth.controller'
import { validate } from '../../middlewares/validate.middleware'
import { loginSchema } from './auth.schema'

const router = Router()

router.post('/login', validate(loginSchema), loginController)

export default router
