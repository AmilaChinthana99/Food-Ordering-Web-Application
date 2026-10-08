import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { setupSwagger } from './config/swagger';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { ENV } from './config/env';

const app: Express = express();

// Security and CORS
app.use(helmet({ contentSecurityPolicy: false })); // allow images & external assets
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Global Rate Limiting
app.use('/api', apiLimiter);

// Stripe Webhook needs raw body
app.post('/api/v1/payments/stripe-webhook', express.raw({ type: 'application/json' }), (req: Request, res: Response) => {
  // Webhook handler stub
  res.status(200).json({ received: true });
});

// JSON and URL-encoded Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// API Documentation
setupSwagger(app);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API v1 Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
