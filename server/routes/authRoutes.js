import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate, registerSchema, loginSchema } from '../middleware/validators.js';
import { DEMO_USER } from '../db/seedDemoData.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_jwt_signing_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      institution: user.institution,
      primary_domain: user.primary_domain,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { full_name, email, password, institution, primary_domain } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const insertResult = await query(
      `INSERT INTO users (id, full_name, email, password_hash, institution, primary_domain)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, institution, primary_domain, created_at`,
      [userId, full_name, email.toLowerCase(), passwordHash, institution || 'Independent Researcher', primary_domain || 'ACADEMIC_SCIENTIFIC']
    );

    const user = insertResult.rows[0];
    const token = createToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, full_name, email, password_hash, institution, primary_domain, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    const userRecord = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, userRecord.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    const { password_hash, ...user } = userRecord;
    const token = createToken(user);

    res.json({
      message: 'Authentication successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/demo — 1-click evaluator login
router.post('/demo', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, institution, primary_domain, created_at FROM users WHERE email = $1',
      [DEMO_USER.email]
    );

    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0];
      const token = createToken(user);
      return res.json({
        message: 'Demo authentication successful',
        token,
        user,
      });
    }

    // Fallback: create demo user if missing
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
    const insertResult = await query(
      `INSERT INTO users (id, full_name, email, password_hash, institution, primary_domain)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, institution, primary_domain, created_at`,
      [DEMO_USER.id, DEMO_USER.fullName, DEMO_USER.email, passwordHash, DEMO_USER.institution, DEMO_USER.primaryDomain]
    );

    const user = insertResult.rows[0];
    const token = createToken(user);

    res.json({
      message: 'Demo user initialized',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userResult = await query(
      'SELECT id, full_name, email, institution, primary_domain, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'User account not found.' });
    }

    const user = userResult.rows[0];

    // Compute aggregate user telemetry
    const wsCount = await query('SELECT COUNT(*) as count FROM workspaces WHERE user_id = $1', [req.user.id]);
    const srcCount = await query('SELECT COUNT(*) as count FROM sources WHERE user_id = $1', [req.user.id]);
    const synCount = await query('SELECT COUNT(*) as count FROM syntheses WHERE user_id = $1', [req.user.id]);

    res.json({
      user,
      stats: {
        totalWorkspaces: parseInt(wsCount.rows[0]?.count || '0', 10),
        totalSources: parseInt(srcCount.rows[0]?.count || '0', 10),
        totalSyntheses: parseInt(synCount.rows[0]?.count || '0', 10),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
