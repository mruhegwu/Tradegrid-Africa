import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { registerSchema, loginSchema } from '../../lib/schemas';
import { authenticate, signToken } from '../../middleware/auth';
import { InMemoryStore } from '../../lib/store';
import { User, PublicUser } from '../../types/models';
import { createError } from '../../middleware/errorHandler';

const router = Router();
export const userStore = new InMemoryStore<User>();

function toPublic(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...pub } = user;
  return pub;
}

/**
 * POST /api/v1/auth/register
 * Create a new user account.
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);

    if (userStore.findOne(u => u.email === body.email)) {
      return next(createError('Email already in use', 409, 'EMAIL_IN_USE'));
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user: User = {
      id: randomUUID(),
      email: body.email,
      name: body.name,
      role: body.role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    userStore.create(user);

    const token = signToken({ sub: user.id, email: user.email, role: user.role });

    return res.status(201).json({
      status: 'ok',
      data: { user: toPublic(user), token },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/v1/auth/login
 * Authenticate with email + password and receive a JWT.
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = userStore.findOne(u => u.email === body.email);
    if (!user) {
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const passwordMatch = await bcrypt.compare(body.password, user.passwordHash);
    if (!passwordMatch) {
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role });

    return res.json({
      status: 'ok',
      data: { user: toPublic(user), token },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user.
 */
router.get('/me', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(createError('Not authenticated', 401, 'UNAUTHORIZED'));
    }
    const user = userStore.findById(req.user.sub);
    if (!user) {
      return next(createError('User not found', 404, 'NOT_FOUND'));
    }
    return res.json({ status: 'ok', data: toPublic(user) });
  } catch (err) {
    return next(err);
  }
});

export default router;
