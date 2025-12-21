import { Router } from 'express'
import { getPostBySlug, getPostsByTopic } from './post.public.controller'
import { cache } from '../../middlewares/cache.middleware'
import { CACHE_TTL } from '../../config/constants'

const router = Router()

router.get('/:slug', cache(CACHE_TTL.POST_DETAIL), getPostBySlug)
router.get('/topic/:topicSlug', cache(CACHE_TTL.TOPIC_LIST), getPostsByTopic)

export default router
export { router as postPublicRouter }
