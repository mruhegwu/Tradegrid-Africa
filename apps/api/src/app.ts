import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health';
import v1Router from './routes/v1';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ── Security & parsing middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/v1', v1Router);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Route not found' });
});

// ── Centralised error handler ────────────────────────────────────────────────
app.use(errorHandler);

export default app;
