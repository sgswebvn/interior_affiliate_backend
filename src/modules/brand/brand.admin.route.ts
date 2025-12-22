import { Router } from 'express'
import { createBrand, deleteBrand, getBrandById, listBrands, updateBrand } from './brand.controller'

const router = Router()

router.get('/', listBrands)
router.get('/:id', getBrandById)
router.post('/', createBrand)
router.put('/:id', updateBrand)
router.delete('/:id', deleteBrand)

export default router
