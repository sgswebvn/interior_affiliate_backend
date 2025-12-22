import { Router } from 'express'
import postAdminRoutes from '../post/post.admin.route'
import topicAdminRoutes from '../topic/topic.admin.route'
import tagAdminRoutes from '../tag/tag.admin.route'
import affiliateAdminRoutes from '../affiliate/affiliate.admin.route'
import brandAdminRoutes from '../brand/brand.admin.route'

import { getDashboardStats } from './dashboard.controller'

const router = Router()

router.get('/stats', getDashboardStats)
router.use('/posts', postAdminRoutes)
router.use('/topics', topicAdminRoutes)
router.use('/tags', tagAdminRoutes)
router.use('/affiliates', affiliateAdminRoutes)
router.use('/brands', brandAdminRoutes)

export default router
