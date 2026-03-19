import { Router } from 'express';
import { createReview, getSupplierReviews } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/supplier/:supplierId', getSupplierReviews);

export default router;
