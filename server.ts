import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './server/app.js';
import { initDatabase } from './server/db/init.js';

dotenv.config();

// AI Studio dev server runtime requires port 3000
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  console.log('⚡ Initializing NexusSynth AI Full-Stack Platform...');

  // 1. Initialize Database Schema & Seed Data
  await initDatabase();

  // 2. Initialize Express application with all API endpoints
  const app = createExpressApp();

  // 3. Mount Vite Dev Middleware or Static Production build
  const distPath = path.resolve(process.cwd(), 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    console.log('Serving production build from dist/...');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    console.log('Mounting Vite dev server middleware in SPA mode...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        watch: {
          usePolling: true,
          interval: 100,
        },
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  // 4. Start Server on Port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 NexusSynth AI is running live at http://0.0.0.0:${PORT}`);
    console.log(`📡 API Endpoints live at http://0.0.0.0:${PORT}/api/`);
    console.log(`🔐 Demo Account available: demo@nexussynth.ai / DemoPass123!\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrapping error:', err);
  process.exit(1);
});
