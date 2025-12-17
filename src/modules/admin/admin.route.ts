import { Router } from 'express'
import postAdminRoutes from '../post/post.admin.route'
import topicAdminRoutes from '../topic/topic.admin.route'
import tagAdminRoutes from '../tag/tag.admin.route'
import affiliateAdminRoutes from '../affiliate/affiliate.admin.route'

const router = Router()

router.use('/posts', postAdminRoutes)
router.use('/topics', topicAdminRoutes)
router.use('/tags', tagAdminRoutes)
router.use('/affiliates', affiliateAdminRoutes)

export default router
