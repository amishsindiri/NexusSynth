import express from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate, chatQuestionSchema } from '../middleware/validators.js';
import { answerWorkspaceQuestion } from '../services/geminiService.js';

const router = express.Router({ mergeParams: true });

// GET /api/workspaces/:workspaceId/chat — Fetch chronological chat history
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    const result = await query(
      `SELECT id, workspace_id, role, content, citations, confidence_level, created_at
       FROM chat_messages
       WHERE workspace_id = $1 AND user_id = $2
       ORDER BY created_at ASC`,
      [workspaceId, userId]
    );

    const parsedMessages = (result.rows || []).map((m) => ({
      ...m,
      citations: typeof m.citations === 'string' ? JSON.parse(m.citations) : m.citations || [],
    }));

    res.json(parsedMessages);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:workspaceId/chat — Submit question to Grounded Q&A Assistant
router.post('/', authenticateToken, validate(chatQuestionSchema), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const { question } = req.body;

    // 1. Verify workspace ownership
    const wsResult = await query(
      'SELECT id, title, domain, research_question FROM workspaces WHERE id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (!wsResult.rows || wsResult.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Workspace not found or unauthorized.' });
    }

    const workspace = wsResult.rows[0];

    // 2. Fetch all workspace sources for grounding
    const sourcesResult = await query(
      `SELECT id, title, authors, publication_year, source_type, raw_text, ai_summary,
              methodology_notes, limitations, key_claims, key_metrics
       FROM sources
       WHERE workspace_id = $1 AND user_id = $2
       ORDER BY created_at ASC`,
      [workspaceId, userId]
    );

    const sources = (sourcesResult.rows || []).map((s) => ({
      ...s,
      key_claims: typeof s.key_claims === 'string' ? JSON.parse(s.key_claims) : s.key_claims || [],
      key_metrics: typeof s.key_metrics === 'string' ? JSON.parse(s.key_metrics) : s.key_metrics || [],
    }));

    // 3. Fetch recent conversation context (last 6 messages)
    const historyResult = await query(
      `SELECT role, content FROM chat_messages
       WHERE workspace_id = $1 AND user_id = $2
       ORDER BY created_at DESC
       LIMIT 6`,
      [workspaceId, userId]
    );

    const recentHistory = (historyResult.rows || []).reverse();

    // 4. Save user question message
    const userMsgId = crypto.randomUUID();
    await query(
      `INSERT INTO chat_messages (id, workspace_id, user_id, role, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [userMsgId, workspaceId, userId, 'user', question]
    );

    // 5. Invoke Gemini Grounded Q&A Prompt
    console.log(`💬 Grounded Q&A Query for workspace "${workspace.title}": "${question.substring(0, 60)}..."`);
    const qnaResponse = await answerWorkspaceQuestion({
      workspace_title: workspace.title,
      research_question: workspace.research_question,
      sources,
      recent_chat_history: recentHistory,
      user_question: question,
    });

    // 6. Save assistant answer message with citations and confidence level
    const assistantMsgId = crypto.randomUUID();
    const assistantMsgResult = await query(
      `INSERT INTO chat_messages (id, workspace_id, user_id, role, content, citations, confidence_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, workspace_id, role, content, citations, confidence_level, created_at`,
      [
        assistantMsgId,
        workspaceId,
        userId,
        'assistant',
        qnaResponse.answer,
        JSON.stringify(qnaResponse.citations || []),
        qnaResponse.confidence_level || 'HIGH_CORPUS_SUPPORT',
      ]
    );

    const savedAssistantMsg = assistantMsgResult.rows[0];

    res.status(201).json({
      userMessage: {
        id: userMsgId,
        workspace_id: workspaceId,
        role: 'user',
        content: question,
        created_at: new Date().toISOString(),
      },
      assistantMessage: {
        ...savedAssistantMsg,
        citations: qnaResponse.citations || [],
      },
      followUpQuestions: qnaResponse.follow_up_questions || [],
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workspaces/:workspaceId/chat — Clear workspace chat history
router.delete('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    await query(
      'DELETE FROM chat_messages WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    res.json({ message: 'Workspace chat history cleared successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
