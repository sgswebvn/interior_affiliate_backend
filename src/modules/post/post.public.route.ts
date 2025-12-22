import { Router } from 'express'
import { getPostBySlug, getPostsByTopic, listPosts } from './post.public.controller'
import { cache } from '../../middlewares/cache.middleware'
import { CACHE_TTL } from '../../config/constants'

const router = Router()

router.get('/', listPosts)
router.get('/:slug', cache(CACHE_TTL.POST_DETAIL), getPostBySlug)
router.get('/topic/:topicSlug', cache(CACHE_TTL.TOPIC_LIST), getPostsByTopic)

export default router
export { router as postPublicRouter }
