import { Router } from 'express'
import { createAffiliate, listAffiliates } from './affiliate.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createAffiliateSchema } from './affiliate.schema'

const router = Router()

router.get('/', listAffiliates)
router.post('/', validate(createAffiliateSchema), createAffiliate)

export default router
