import { Router } from 'express'
import { getPostBySlug, getPostsByTopic } from './post.public.controller'
import { cache } from '../../middlewares/cache.middleware'

const router = Router()

router.get('/:slug', cache('5 minutes'), getPostBySlug)
router.get('/topic/:topicSlug', cache('5 minutes'), getPostsByTopic)

export default router
export { router as postPublicRouter }
