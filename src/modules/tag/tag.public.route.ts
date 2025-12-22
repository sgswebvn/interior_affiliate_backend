import { Router } from 'express'
import { listPublicTags } from './tag.public.controller'

const router = Router()

router.get('/', listPublicTags)

export default router
