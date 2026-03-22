import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['buyer', 'seller']).default('buyer'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ── Listings ──────────────────────────────────────────────────────────────────
export const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  currency: z.string().length(3).default('NGN'),
  category: z.string().min(2).max(100),
  condition: z.enum(['new', 'used', 'refurbished']).default('new'),
  location: z.string().min(2).max(200),
  imageUrls: z.array(z.string().url()).max(10).default([]),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['active', 'sold', 'draft']).optional(),
});

export const listingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingsQuery = z.infer<typeof listingsQuerySchema>;
