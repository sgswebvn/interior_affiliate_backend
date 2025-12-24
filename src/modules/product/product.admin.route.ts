import { Router } from 'express';
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from './product.admin.controller';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
