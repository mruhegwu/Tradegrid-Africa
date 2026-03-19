import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplierId, rating, comment, orderId } = req.body;
    if (!supplierId || !rating) {
      res.status(400).json({ message: 'supplierId and rating are required' });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5' });
      return;
    }
    const review = await prisma.review.create({
      data: {
        reviewerId: req.userId!,
        supplierId,
        rating: parseInt(rating),
        comment,
        orderId,
      },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSupplierReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { supplierId: req.params.supplierId },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    res.json({ reviews, avgRating, total: reviews.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
