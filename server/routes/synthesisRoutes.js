import express from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate, synthesisCreateSchema } from '../middleware/validators.js';
import { generateCrossSourceSynthesis } from '../services/geminiService.js';

const router = express.Router({ mergeParams: true });

// POST /api/workspaces/:workspaceId/syntheses — Generate and persist Cross-Source Synthesis
router.post('/', authenticateToken, validate(synthesisCreateSchema), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const { title, source_ids, synthesis_mode, focus_directive } = req.body;

    // 1. Verify workspace ownership
    const wsResult = await query(
      'SELECT id, title, domain, research_question FROM workspaces WHERE id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (!wsResult.rows || wsResult.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Workspace not found or unauthorized.' });
    }

    const workspace = wsResult.rows[0];

    // 2. Fetch selected sources with strict tenant and workspace boundaries
    const placeholders = source_ids.map((_, i) => `$${i + 3}`).join(', ');
    const sql = `
      SELECT id, title, authors, publication_year, source_type, raw_text, ai_summary, methodology_notes, key_claims, entities
      FROM sources
      WHERE workspace_id = $1 AND user_id = $2 AND id IN (${placeholders})
    `;

    const sourcesResult = await query(sql, [workspaceId, userId, ...source_ids]);
    const sources = sourcesResult.rows || [];

    if (sources.length < 2) {
      return res.status(400).json({
        error: 'BadRequest',
        message: `Cross-source synthesis requires at least 2 valid sources. Found ${sources.length} matching sources.`,
      });
    }

    // Parse JSON fields on sources if stored as strings
    const sanitizedSources = sources.map((s) => ({
      ...s,
      key_claims: typeof s.key_claims === 'string' ? JSON.parse(s.key_claims) : s.key_claims || [],
      entities: typeof s.entities === 'string' ? JSON.parse(s.entities) : s.entities || [],
    }));

    console.log(`🔬 Generating Cross-Source Synthesis across ${sanitizedSources.length} sources for "${title}"...`);

    // 3. Invoke Gemini Cross-Source Synthesis Prompt
    const synthesisData = await generateCrossSourceSynthesis({
      workspace_title: workspace.title,
      domain: workspace.domain,
      research_question: workspace.research_question,
      synthesis_mode,
      focus_directive: focus_directive || '',
      sources: sanitizedSources,
    });

    const synthesisId = crypto.randomUUID();

    // 4. Save into PostgreSQL syntheses table
    const insertResult = await query(
      `INSERT INTO syntheses (
        id, workspace_id, user_id, title, synthesis_mode, focus_directive,
        source_ids, executive_synthesis, consensus_points, contradictions,
        research_gaps, evidence_matrix, recommendations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        synthesisId,
        workspaceId,
        userId,
        title,
        synthesis_mode,
        focus_directive || null,
        JSON.stringify(source_ids),
        synthesisData.executive_synthesis || '',
        JSON.stringify(synthesisData.consensus_points || []),
        JSON.stringify(synthesisData.contradictions || []),
        JSON.stringify(synthesisData.research_gaps || []),
        JSON.stringify(synthesisData.evidence_matrix || []),
        JSON.stringify(synthesisData.recommendations || []),
      ]
    );

    const created = insertResult.rows[0];

    res.status(201).json({
      ...created,
      source_ids,
      consensus_points: synthesisData.consensus_points || [],
      contradictions: synthesisData.contradictions || [],
      research_gaps: synthesisData.research_gaps || [],
      evidence_matrix: synthesisData.evidence_matrix || [],
      recommendations: synthesisData.recommendations || [],
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:workspaceId/syntheses — List syntheses in workspace
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    const result = await query(
      `SELECT id, workspace_id, title, synthesis_mode, focus_directive, source_ids,
              executive_synthesis, consensus_points, contradictions, research_gaps,
              evidence_matrix, recommendations, created_at
       FROM syntheses
       WHERE workspace_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [workspaceId, userId]
    );

    const parsed = (result.rows || []).map((sy) => ({
      ...sy,
      source_ids: typeof sy.source_ids === 'string' ? JSON.parse(sy.source_ids) : sy.source_ids || [],
      consensus_points: typeof sy.consensus_points === 'string' ? JSON.parse(sy.consensus_points) : sy.consensus_points || [],
      contradictions: typeof sy.contradictions === 'string' ? JSON.parse(sy.contradictions) : sy.contradictions || [],
      research_gaps: typeof sy.research_gaps === 'string' ? JSON.parse(sy.research_gaps) : sy.research_gaps || [],
      evidence_matrix: typeof sy.evidence_matrix === 'string' ? JSON.parse(sy.evidence_matrix) : sy.evidence_matrix || [],
      recommendations: typeof sy.recommendations === 'string' ? JSON.parse(sy.recommendations) : sy.recommendations || [],
    }));

    res.json(parsed);
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:workspaceId/syntheses/:synthesisId — Retrieve full synthesis report
router.get('/:synthesisId', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId, synthesisId } = req.params;

    const result = await query(
      'SELECT * FROM syntheses WHERE id = $1 AND workspace_id = $2 AND user_id = $3',
      [synthesisId, workspaceId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Synthesis report not found.' });
    }

    const sy = result.rows[0];
    const sourceIds = typeof sy.source_ids === 'string' ? JSON.parse(sy.source_ids) : sy.source_ids || [];

    // Fetch brief metadata for the sources synthesized
    let synthesizedSources = [];
    if (sourceIds.length > 0) {
      const placeholders = sourceIds.map((_, i) => `$${i + 2}`).join(', ');
      const srcRes = await query(
        `SELECT id, title, authors, publication_year, source_type FROM sources WHERE workspace_id = $1 AND id IN (${placeholders})`,
        [workspaceId, ...sourceIds]
      );
      synthesizedSources = srcRes.rows || [];
    }

    res.json({
      ...sy,
      source_ids: sourceIds,
      synthesized_sources: synthesizedSources,
      consensus_points: typeof sy.consensus_points === 'string' ? JSON.parse(sy.consensus_points) : sy.consensus_points || [],
      contradictions: typeof sy.contradictions === 'string' ? JSON.parse(sy.contradictions) : sy.contradictions || [],
      research_gaps: typeof sy.research_gaps === 'string' ? JSON.parse(sy.research_gaps) : sy.research_gaps || [],
      evidence_matrix: typeof sy.evidence_matrix === 'string' ? JSON.parse(sy.evidence_matrix) : sy.evidence_matrix || [],
      recommendations: typeof sy.recommendations === 'string' ? JSON.parse(sy.recommendations) : sy.recommendations || [],
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workspaces/:workspaceId/syntheses/:synthesisId — Delete synthesis report
router.delete('/:synthesisId', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId, synthesisId } = req.params;

    const result = await query(
      'DELETE FROM syntheses WHERE id = $1 AND workspace_id = $2 AND user_id = $3 RETURNING id',
      [synthesisId, workspaceId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Synthesis report not found or unauthorized.' });
    }

    res.json({ message: 'Synthesis report deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
