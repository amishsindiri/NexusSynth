import express from 'express';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Workspaces count
    const wsRes = await query('SELECT COUNT(*) as count FROM workspaces WHERE user_id = $1', [userId]);
    const totalWorkspaces = parseInt(wsRes.rows[0]?.count || '0', 10);

    // Sources count and word count
    const srcRes = await query(
      'SELECT id, key_claims, word_count, created_at, title FROM sources WHERE user_id = $1',
      [userId]
    );
    const sources = srcRes.rows || [];
    const totalSources = sources.length;

    let totalClaims = 0;
    let totalWords = 0;
    for (const src of sources) {
      totalWords += src.word_count || 0;
      let claims = src.key_claims;
      if (typeof claims === 'string') {
        try {
          claims = JSON.parse(claims);
        } catch (e) {
          claims = [];
        }
      }
      if (Array.isArray(claims)) {
        totalClaims += claims.length;
      }
    }

    // Syntheses count and contradictions flagged
    const synRes = await query(
      'SELECT id, title, synthesis_mode, contradictions, created_at FROM syntheses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const syntheses = synRes.rows || [];
    const totalSyntheses = syntheses.length;

    let totalContradictions = 0;
    for (const syn of syntheses) {
      let contr = syn.contradictions;
      if (typeof contr === 'string') {
        try {
          contr = JSON.parse(contr);
        } catch (e) {
          contr = [];
        }
      }
      if (Array.isArray(contr)) {
        totalContradictions += contr.length;
      }
    }

    // Recent activity feed combining recent sources and syntheses
    const recentActivity = [
      ...sources.slice(-5).map((s) => ({
        type: 'SOURCE_INGESTED',
        id: s.id,
        title: s.title,
        timestamp: s.created_at,
      })),
      ...syntheses.slice(0, 5).map((sy) => ({
        type: 'SYNTHESIS_GENERATED',
        id: sy.id,
        title: sy.title,
        timestamp: sy.created_at,
        mode: sy.synthesis_mode,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

    // Workspaces summary for dashboard quick access
    const workspacesSummary = await query(
      `SELECT w.id, w.title, w.domain, w.research_question, w.created_at,
              COUNT(DISTINCT s.id) as source_count,
              COUNT(DISTINCT sy.id) as synthesis_count
       FROM workspaces w
       LEFT JOIN sources s ON s.workspace_id = w.id
       LEFT JOIN syntheses sy ON sy.workspace_id = w.id
       WHERE w.user_id = $1
       GROUP BY w.id
       ORDER BY w.updated_at DESC, w.created_at DESC
       LIMIT 6`,
      [userId]
    );

    res.json({
      metrics: {
        totalWorkspaces,
        totalSources,
        totalClaims,
        totalSyntheses,
        totalContradictions,
        totalWordsAnalyzed: totalWords,
      },
      workspaces: workspacesSummary.rows || [],
      recentSyntheses: syntheses.slice(0, 4),
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
