import { Router } from 'express'
import { getPostBySlug, getPostsByTopic } from './post.public.controller'

const router = Router()

router.get('/:slug', getPostBySlug)
router.get('/topic/:topicSlug', getPostsByTopic)

export default router
export { router as postPublicRouter }
