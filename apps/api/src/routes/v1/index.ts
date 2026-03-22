import { Router } from 'express';
import authRouter from './auth';
import listingsRouter from './listings';

const router = Router();

router.use('/auth', authRouter);
router.use('/listings', listingsRouter);

export default router;
