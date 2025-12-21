import { Router } from 'express'
import { createTag, listTags, getTagById, updateTag, deleteTag } from './tag.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createTagSchema } from './tag.schema'

const router = Router()

router.get('/', listTags)
router.get('/:id', getTagById)
router.post('/', validate(createTagSchema), createTag)
router.put('/:id', updateTag)
router.delete('/:id', deleteTag)

export default router
