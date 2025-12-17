import { Router } from 'express'
import { createTopic } from './topic.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createTopicSchema } from './topic.schema'

const router = Router()

router.post('/', validate(createTopicSchema), createTopic)

export default router
