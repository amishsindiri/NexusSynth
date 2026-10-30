import express from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadPdf, extractTextFromPdfBuffer } from '../services/pdfService.js';
import { analyzeSourceDocument } from '../services/geminiService.js';

const router = express.Router({ mergeParams: true });

// POST /api/workspaces/:workspaceId/sources — Ingest PDF or Raw Text and trigger AI deconstruction
router.post('/', authenticateToken, uploadPdf.single('file'), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    // 1. Verify workspace ownership
    const wsResult = await query(
      'SELECT id, title, domain, research_question FROM workspaces WHERE id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (!wsResult.rows || wsResult.rows.length === 0) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Workspace not found or unauthorized.',
      });
    }

    const workspace = wsResult.rows[0];

    // 2. Extract content (either from PDF upload or raw_content text body)
    let rawText = '';
    let fileName = null;

    if (req.file) {
      fileName = req.file.originalname;
      rawText = await extractTextFromPdfBuffer(req.file.buffer);
    } else if (req.body.raw_content && typeof req.body.raw_content === 'string') {
      rawText = req.body.raw_content.trim();
    }

    if (!rawText || rawText.length < 50) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Source content too short. Please provide at least 50 characters of research text or upload a valid PDF.',
      });
    }

    const title = req.body.title || (fileName ? fileName.replace(/\.pdf$/i, '') : 'Untitled Research Source');
    const authors = req.body.authors || 'Unknown Author';
    const publicationYear = req.body.publication_year ? parseInt(req.body.publication_year, 10) : null;
    const sourceType = req.body.source_type || 'PEER_REVIEWED_PAPER';
    const sourceUrl = req.body.source_url || null;
    const wordCount = rawText.split(/\s+/).length;

    console.log(`🧠 Invoking Gemini for Source Deconstruction: "${title}" (${wordCount} words)...`);

    // 3. AI Source Deconstruction via Gemini
    const aiAnalysis = await analyzeSourceDocument({
      title,
      authors,
      publication_year: publicationYear,
      source_type: sourceType,
      raw_text: rawText,
      domain: workspace.domain,
      research_question: workspace.research_question,
    });

    const sourceId = crypto.randomUUID();

    // 4. Persist to PostgreSQL
    const insertResult = await query(
      `INSERT INTO sources (
        id, workspace_id, user_id, title, authors, publication_year, source_type,
        source_url, file_name, raw_text, word_count, ai_summary, methodology_notes,
        limitations, key_claims, entities, key_metrics, analysis_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        sourceId,
        workspaceId,
        userId,
        title,
        authors,
        publicationYear,
        sourceType,
        sourceUrl,
        fileName,
        rawText,
        wordCount,
        aiAnalysis.ai_summary || '',
        aiAnalysis.methodology_notes || '',
        aiAnalysis.limitations || '',
        JSON.stringify(aiAnalysis.key_claims || []),
        JSON.stringify(aiAnalysis.entities || []),
        JSON.stringify(aiAnalysis.key_metrics || []),
        'COMPLETED',
      ]
    );

    const savedSource = insertResult.rows[0];

    res.status(201).json({
      ...savedSource,
      key_claims: aiAnalysis.key_claims || [],
      entities: aiAnalysis.entities || [],
      key_metrics: aiAnalysis.key_metrics || [],
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:workspaceId/sources/:sourceId — Full document deep-dive
router.get('/:sourceId', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId, sourceId } = req.params;

    const result = await query(
      'SELECT * FROM sources WHERE id = $1 AND workspace_id = $2 AND user_id = $3',
      [sourceId, workspaceId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Source not found or unauthorized.' });
    }

    const s = result.rows[0];
    res.json({
      ...s,
      key_claims: typeof s.key_claims === 'string' ? JSON.parse(s.key_claims) : s.key_claims || [],
      entities: typeof s.entities === 'string' ? JSON.parse(s.entities) : s.entities || [],
      key_metrics: typeof s.key_metrics === 'string' ? JSON.parse(s.key_metrics) : s.key_metrics || [],
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workspaces/:workspaceId/sources/:sourceId — Delete source
router.delete('/:sourceId', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId, sourceId } = req.params;

    const result = await query(
      'DELETE FROM sources WHERE id = $1 AND workspace_id = $2 AND user_id = $3 RETURNING id',
      [sourceId, workspaceId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Source not found or unauthorized.' });
    }

    res.json({ message: 'Source document successfully removed.' });
  } catch (error) {
    next(error);
  }
});

export default router;
