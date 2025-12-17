import { Router } from 'express'
import postRoutes from './modules/post/post.public.route'
import topicRoutes from './modules/topic/topic.public.route'
import affiliateRoutes from './modules/affiliate/affiliate.public.route'
import adminRoutes from './modules/admin/admin.route'
import { authenticate } from './middlewares/auth.middleware'

const router = Router()

// Auth

// Public SEO API
router.use('/posts', postRoutes)
router.use('/topics', topicRoutes)
router.use('/redirect', affiliateRoutes)

// Admin CMS API
router.use('/admin', authenticate, adminRoutes)
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString()
    })
})
export default router
