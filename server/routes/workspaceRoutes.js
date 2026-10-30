import express from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate, workspaceSchema } from '../middleware/validators.js';

const router = express.Router();

// GET /api/workspaces — List all workspaces for logged in user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT w.id, w.title, w.domain, w.research_question, w.description, w.created_at, w.updated_at,
              COUNT(DISTINCT s.id) as source_count,
              COUNT(DISTINCT sy.id) as synthesis_count
       FROM workspaces w
       LEFT JOIN sources s ON s.workspace_id = w.id
       LEFT JOIN syntheses sy ON sy.workspace_id = w.id
       WHERE w.user_id = $1
       GROUP BY w.id
       ORDER BY w.updated_at DESC, w.created_at DESC`,
      [userId]
    );

    res.json(result.rows || []);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces — Create a new workspace
router.post('/', authenticateToken, validate(workspaceSchema), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, domain, research_question, description } = req.body;
    const workspaceId = crypto.randomUUID();

    const insertResult = await query(
      `INSERT INTO workspaces (id, user_id, title, domain, research_question, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [workspaceId, userId, title, domain, research_question, description || null]
    );

    const created = insertResult.rows[0];
    res.status(201).json({
      ...created,
      source_count: 0,
      synthesis_count: 0,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:id — Retrieve full workspace details, sources, and syntheses
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.id;

    const wsResult = await query(
      'SELECT * FROM workspaces WHERE id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (!wsResult.rows || wsResult.rows.length === 0) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Workspace not found or access denied.',
      });
    }

    const workspace = wsResult.rows[0];

    // Fetch sources in workspace
    const sourcesResult = await query(
      `SELECT id, workspace_id, title, authors, publication_year, source_type, source_url, file_name,
              word_count, ai_summary, methodology_notes, limitations, key_claims, entities, key_metrics,
              analysis_status, created_at
       FROM sources
       WHERE workspace_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [workspaceId, userId]
    );

    const parsedSources = (sourcesResult.rows || []).map((s) => ({
      ...s,
      key_claims: typeof s.key_claims === 'string' ? JSON.parse(s.key_claims) : s.key_claims || [],
      entities: typeof s.entities === 'string' ? JSON.parse(s.entities) : s.entities || [],
      key_metrics: typeof s.key_metrics === 'string' ? JSON.parse(s.key_metrics) : s.key_metrics || [],
    }));

    // Fetch syntheses in workspace
    const synthesesResult = await query(
      `SELECT id, workspace_id, title, synthesis_mode, focus_directive, source_ids,
              executive_synthesis, consensus_points, contradictions, research_gaps, evidence_matrix, recommendations, created_at
       FROM syntheses
       WHERE workspace_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [workspaceId, userId]
    );

    const parsedSyntheses = (synthesesResult.rows || []).map((sy) => ({
      ...sy,
      source_ids: typeof sy.source_ids === 'string' ? JSON.parse(sy.source_ids) : sy.source_ids || [],
      consensus_points: typeof sy.consensus_points === 'string' ? JSON.parse(sy.consensus_points) : sy.consensus_points || [],
      contradictions: typeof sy.contradictions === 'string' ? JSON.parse(sy.contradictions) : sy.contradictions || [],
      research_gaps: typeof sy.research_gaps === 'string' ? JSON.parse(sy.research_gaps) : sy.research_gaps || [],
      evidence_matrix: typeof sy.evidence_matrix === 'string' ? JSON.parse(sy.evidence_matrix) : sy.evidence_matrix || [],
      recommendations: typeof sy.recommendations === 'string' ? JSON.parse(sy.recommendations) : sy.recommendations || [],
    }));

    res.json({
      workspace,
      sources: parsedSources,
      syntheses: parsedSyntheses,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/workspaces/:id — Update workspace details
router.put('/:id', authenticateToken, validate(workspaceSchema), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.id;
    const { title, domain, research_question, description } = req.body;

    const result = await query(
      `UPDATE workspaces
       SET title = $1, domain = $2, research_question = $3, description = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, domain, research_question, description || null, workspaceId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Workspace not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workspaces/:id — Delete workspace
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.params.id;

    const result = await query(
      'DELETE FROM workspaces WHERE id = $1 AND user_id = $2 RETURNING id',
      [workspaceId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Workspace not found or unauthorized.' });
    }

    res.json({ message: 'Workspace and all associated documents deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
