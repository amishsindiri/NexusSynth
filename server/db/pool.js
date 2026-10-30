import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

let poolInstance = null;

// Hybrid adapter: connects to Postgres when DATABASE_URL is available,
// otherwise transparently provisions PGlite (PostgreSQL WASM with persistent storage)
export async function getDb() {
  if (poolInstance) {
    return poolInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.trim() !== '') {
    console.log('Connecting to PostgreSQL via DATABASE_URL...');
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });

    poolInstance = {
      type: 'postgres',
      async query(text, params = []) {
        const res = await pool.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.rowCount || 0,
        };
      },
    };

    return poolInstance;
  }

  console.log('DATABASE_URL not set. Initializing embedded PostgreSQL (PGlite) with local persistence...');
  const { PGlite } = await import('@electric-sql/pglite');
  
  const dataDir = path.resolve(process.cwd(), 'server/data/pgdata');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite = new PGlite(dataDir);
  await pglite.waitReady;

  poolInstance = {
    type: 'pglite',
    async query(text, params = []) {
      // Normalize parameter format if needed
      // PGlite supports $1, $2 with params array natively
      const res = await pglite.query(text, params);
      return {
        rows: res.rows || [],
        rowCount: res.rows ? res.rows.length : 0,
      };
    },
  };

  return poolInstance;
}

export const query = async (text, params) => {
  const db = await getDb();
  return db.query(text, params);
};

export default {
  getDb,
  query,
};
