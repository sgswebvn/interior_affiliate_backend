import { Router } from 'express'
import { listTopics } from './topic.controller'

const router = Router()

router.get('/', listTopics)

export default router
