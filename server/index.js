import dotenv from 'dotenv';
import { createExpressApp } from './app.js';
import { initDatabase } from './db/init.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  try {
    await initDatabase();

    const app = createExpressApp();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 NexusSynth AI Backend Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start standalone server:', err);
    process.exit(1);
  }
}

startServer();
