import { Router } from 'express';
import { getProductBySlug, listPublicProducts } from './product.public.controller';

const router = Router();

router.get('/', listPublicProducts);
router.get('/:slug', getProductBySlug);

export default router;
