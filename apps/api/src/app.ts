import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRouter from './routes/health';

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

export default app;
