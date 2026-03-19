import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  markPaymentSent,
  markGoodsDelivered,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/mine', authenticate, getMyOrders);
router.patch('/:id/status', authenticate, updateOrderStatus);
router.patch('/:id/payment', authenticate, markPaymentSent);
router.patch('/:id/delivery', authenticate, markGoodsDelivered);

export default router;
