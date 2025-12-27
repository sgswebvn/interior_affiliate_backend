import { Router } from 'express'
import { listPublicTopics, getTopicBySlug } from './topic.controller'

const router = Router()

router.get('/', listPublicTopics)
router.get('/:slug', getTopicBySlug) // Added by slug support too if needed, or just list

export default router
