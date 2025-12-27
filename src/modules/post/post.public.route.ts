import { Router } from 'express'
import { listPublicPosts, getPostBySlug } from './post.controller'

const router = Router()

router.get('/', listPublicPosts)
router.get('/:slug', getPostBySlug)

export default router
