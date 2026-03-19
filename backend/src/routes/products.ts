import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from '../controllers/productController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/mine', authenticate, getMyProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, requireRole('SUPPLIER'), createProduct);
router.put('/:id', authenticate, requireRole('SUPPLIER'), updateProduct);
router.delete('/:id', authenticate, requireRole('SUPPLIER'), deleteProduct);

export default router;
