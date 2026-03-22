import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import logger from '../lib/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Centralised error-handling middleware.
 * Must be registered AFTER all routes with exactly 4 parameters.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: ApiError, _req: Request, res: Response, _next: NextFunction) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      errors: err.issues.map((e: ZodIssue) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_SERVER_ERROR';
  const message = statusCode < 500 ? err.message : 'An unexpected error occurred';

  if (statusCode >= 500) {
    logger.error({ err }, 'Unhandled server error');
  }

  return res.status(statusCode).json({ status: 'error', code, message });
}

/**
 * Creates a typed API error with a status code and optional error code.
 */
export function createError(message: string, statusCode = 500, code?: string): ApiError {
  const err = new Error(message) as ApiError;
  err.statusCode = statusCode;
  err.code = code;
  return err;
}
