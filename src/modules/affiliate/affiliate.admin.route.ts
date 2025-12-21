import { Router } from 'express'
import { createAffiliate, listAffiliates, getAffiliateById, updateAffiliate } from './affiliate.controller'
import { validate } from '../../middlewares/validate.middleware'
import { createAffiliateSchema } from './affiliate.schema'

const router = Router()

router.get('/', listAffiliates)
router.get('/:id', getAffiliateById)
router.post('/', validate(createAffiliateSchema), createAffiliate)
router.put('/:id', updateAffiliate)

export default router
