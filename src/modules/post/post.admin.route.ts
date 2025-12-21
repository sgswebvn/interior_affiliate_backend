import { Router } from 'express'
import {
    createPost,
    updatePost,
    deletePost,
    adminListPosts,
    getPostById,
} from './post.admin.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createPostSchema, updatePostSchema } from './post.schema'

const router = Router()

router.get('/', adminListPosts)
router.get('/:id', getPostById)
router.post('/', validate(createPostSchema), createPost)
router.put('/:id', validate(updatePostSchema), updatePost)
router.delete('/:id', deletePost)

export default router
