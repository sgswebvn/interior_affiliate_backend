import { Router } from 'express'
import { createTopic, listTopics, getTopicById, updateTopic, deleteTopic } from './topic.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createTopicSchema } from './topic.schema'

const router = Router()

router.get('/', listTopics)
router.get('/:id', getTopicById)
router.post('/', validate(createTopicSchema), createTopic)
router.put('/:id', updateTopic)
router.delete('/:id', deleteTopic)

export default router
