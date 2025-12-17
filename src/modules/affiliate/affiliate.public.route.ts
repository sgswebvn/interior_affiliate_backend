import { Router } from 'express'
import { redirectAffiliate } from './affiliate.controller'

const router = Router()

router.get('/:affiliateId', redirectAffiliate)

export default router
