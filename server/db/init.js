import { query } from './pool.js';
import { seedDemoData } from './seedDemoData.js';

export async function initDatabase() {
  console.log('📦 Initializing NexusSynth AI Database Schema...');
  
  try {
    // Try enabling uuid extension if permitted in the environment
    try {
      await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    } catch (e) {
      // Ignore if unprivileged or already using built-in gen_random_uuid
    }

    try {
      await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    } catch (e) {
      // Ignore
    }

    // 1. USERS TABLE
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        institution VARCHAR(150) DEFAULT 'Independent Researcher',
        primary_domain VARCHAR(50) DEFAULT 'ACADEMIC_SCIENTIFIC',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. RESEARCH WORKSPACES TABLE
    await query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        domain VARCHAR(50) NOT NULL,
        research_question TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. RESEARCH SOURCES (INGESTED DOCUMENTS) TABLE
    await query(`
      CREATE TABLE IF NOT EXISTS sources (
        id UUID PRIMARY KEY,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        authors VARCHAR(255) DEFAULT 'Unknown Author',
        publication_year INTEGER,
        source_type VARCHAR(50) DEFAULT 'PEER_REVIEWED_PAPER',
        source_url TEXT,
        file_name VARCHAR(255),
        raw_text TEXT NOT NULL,
        word_count INTEGER DEFAULT 0,
        ai_summary TEXT,
        methodology_notes TEXT,
        limitations TEXT,
        key_claims JSONB DEFAULT '[]'::jsonb,
        entities JSONB DEFAULT '[]'::jsonb,
        key_metrics JSONB DEFAULT '[]'::jsonb,
        analysis_status VARCHAR(30) DEFAULT 'COMPLETED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. CROSS-SOURCE SYNTHESIS REPORTS TABLE
    await query(`
      CREATE TABLE IF NOT EXISTS syntheses (
        id UUID PRIMARY KEY,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        synthesis_mode VARCHAR(50) NOT NULL,
        focus_directive TEXT,
        source_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        executive_synthesis TEXT NOT NULL,
        consensus_points JSONB DEFAULT '[]'::jsonb,
        contradictions JSONB DEFAULT '[]'::jsonb,
        research_gaps JSONB DEFAULT '[]'::jsonb,
        evidence_matrix JSONB DEFAULT '[]'::jsonb,
        recommendations JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. WORKSPACE Q&A CHAT MESSAGES TABLE
    await query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        citations JSONB DEFAULT '[]'::jsonb,
        confidence_level VARCHAR(30),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // PERFORMANCE INDEXES
    await query(`CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sources_workspace_id ON sources(workspace_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_syntheses_workspace_id ON syntheses(workspace_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_workspace_id ON chat_messages(workspace_id);`);

    console.log('✅ NexusSynth AI Schema successfully initialized.');

    // Seed Demo Data if not already present
    await seedDemoData();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
