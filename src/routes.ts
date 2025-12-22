import { Router } from 'express'
import postRoutes from './modules/post/post.public.route'
import topicRoutes from './modules/topic/topic.public.route'
import tagRoutes from './modules/tag/tag.public.route'
import affiliateRoutes from './modules/affiliate/affiliate.public.route'
import adminRoutes from './modules/admin/admin.route'
import loginRoutes from './modules/auth/auth.route'
import aiRoutes from './modules/ai/ai.route'
import subscriberRoutes from './modules/subscriber/subscriber.route'
import { authenticate } from './middlewares/auth.middleware'

const router = Router()

// Auth

// Public SEO API
router.use('/posts', postRoutes)
router.use('/topics', topicRoutes)
router.use('/tags', tagRoutes)
router.use('/redirect', affiliateRoutes)
router.use('/auth', loginRoutes)
router.use('/ai', aiRoutes)
router.use('/', subscriberRoutes) // Exposes /subscribe 
// Wait, ai.route.ts has both. 
// generate-seo has 'authenticate'. chat has none.
// So mounting at root /ai is fine.

// Admin CMS API
router.use('/admin', authenticate, adminRoutes)
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString()
    })
})
export default router
