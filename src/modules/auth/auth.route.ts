import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { login } from './auth.controller'
import { loginSchema } from './auth.schema'

const router = Router()

router.post('/login', validate(loginSchema), login)

export default router
