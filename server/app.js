import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import sourceRoutes from './routes/sourceRoutes.js';
import synthesisRoutes from './routes/synthesisRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createExpressApp() {
  const app = express();

  // Helmet with relaxed CSP for iframe and dev tools
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS support
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Body parsers
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Basic rate limiter for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' },
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      platform: 'NexusSynth AI',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routers
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/workspaces/:workspaceId/sources', sourceRoutes);
  app.use('/api/workspaces/:workspaceId/syntheses', synthesisRoutes);
  app.use('/api/workspaces/:workspaceId/chat', chatRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export default createExpressApp;
