import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { createListingSchema, updateListingSchema, listingsQuerySchema } from '../../lib/schemas';
import { authenticate } from '../../middleware/auth';
import { InMemoryStore } from '../../lib/store';
import { Listing } from '../../types/models';
import { createError } from '../../middleware/errorHandler';

const router = Router();
export const listingStore = new InMemoryStore<Listing>();

/**
 * GET /api/v1/listings
 * Returns a paginated, filterable list of active listings.
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listingsQuerySchema.parse(req.query);

    let items = listingStore.findAll().filter(l => l.status === 'active');

    if (query.category) {
      items = items.filter(l => l.category.toLowerCase() === query.category!.toLowerCase());
    }
    if (query.condition) {
      items = items.filter(l => l.condition === query.condition);
    }
    if (query.minPrice !== undefined) {
      items = items.filter(l => l.price >= query.minPrice!);
    }
    if (query.maxPrice !== undefined) {
      items = items.filter(l => l.price <= query.maxPrice!);
    }
    if (query.search) {
      const term = query.search.toLowerCase();
      items = items.filter(
        l => l.title.toLowerCase().includes(term) || l.description.toLowerCase().includes(term)
      );
    }

    // Sort newest first
    items = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = items.length;
    const start = (query.page - 1) * query.limit;
    const data = items.slice(start, start + query.limit);

    return res.json({
      status: 'ok',
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/v1/listings/:id
 * Returns a single listing by ID.
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = listingStore.findById(req.params.id);
    if (!listing) {
      return next(createError('Listing not found', 404, 'NOT_FOUND'));
    }
    return res.json({ status: 'ok', data: listing });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/v1/listings
 * Create a new listing. Requires authentication with role=seller.
 */
router.post('/', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role === 'buyer') {
      return next(createError('Only sellers can create listings', 403, 'FORBIDDEN'));
    }

    const body = createListingSchema.parse(req.body);
    const now = new Date().toISOString();

    const listing: Listing = {
      id: randomUUID(),
      sellerId: req.user!.sub,
      ...body,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    listingStore.create(listing);

    return res.status(201).json({ status: 'ok', data: listing });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /api/v1/listings/:id
 * Update a listing. Only the owner (seller) may update their own listings.
 */
router.patch('/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = listingStore.findById(req.params.id);
    if (!listing) {
      return next(createError('Listing not found', 404, 'NOT_FOUND'));
    }

    if (listing.sellerId !== req.user!.sub && req.user?.role !== 'admin') {
      return next(createError('You do not own this listing', 403, 'FORBIDDEN'));
    }

    const patch = updateListingSchema.parse(req.body);
    const updated = listingStore.update(req.params.id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });

    return res.json({ status: 'ok', data: updated });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /api/v1/listings/:id
 * Soft-delete a listing by setting status=sold. Hard-delete for admins.
 */
router.delete('/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = listingStore.findById(req.params.id);
    if (!listing) {
      return next(createError('Listing not found', 404, 'NOT_FOUND'));
    }

    if (listing.sellerId !== req.user!.sub && req.user?.role !== 'admin') {
      return next(createError('You do not own this listing', 403, 'FORBIDDEN'));
    }

    if (req.user?.role === 'admin') {
      listingStore.delete(req.params.id);
      return res.status(204).send();
    }

    const updated = listingStore.update(req.params.id, {
      status: 'sold',
      updatedAt: new Date().toISOString(),
    });

    return res.json({ status: 'ok', data: updated });
  } catch (err) {
    return next(err);
  }
});

export default router;
