import { Router } from 'express'
import { createTag, listTags } from './tag.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createTagSchema } from './tag.schema'

const router = Router()

router.get('/', listTags)
router.post('/', validate(createTagSchema), createTag)

export default router
