# NexusSynth AI — Enterprise Multi-Source Research Synthesis, Contradiction Detection & Knowledge Discovery Platform

[![Architecture](https://img.shields.io/badge/Architecture-Full--Stack%20PostgreSQL%20%2B%20Express%20%2B%20React-indigo.svg)](https://github.com)
[![Model](https://img.shields.io/badge/Gemini%20API-gemini--2.5--flash-cyan.svg)](https://ai.google.dev)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20PGlite-blue.svg)](https://postgresql.org)
[![Security](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt%20%2B%20RLS-emerald.svg)](https://jwt.io)

---

## 1. Problem Statement
Academic researchers, clinical scientists, intelligence analysts, and R&D strategists face an unprecedented acceleration of published literature. Valuable domain insights remain trapped across disconnected PDF whitepapers, pre-prints, and trial readouts. 

Current LLM tooling suffers from three acute failure modes in scientific workflows:
1. **Unverifiable Hallucinations**: Standard chatbots summarize without strict, verifiable links to primary empirical paragraphs.
2. **Failure to Detect Contradictions**: Most AI tools harmonize literature artificially, obscuring vital empirical conflicts, divergent sample cohorts, and irreproducible methodology.
3. **Fragmented Workspaces**: Researchers lack an isolated, multi-document synthesis environment that compares 2 to 10 papers simultaneously into structured consensus vs. contradiction matrices.

---

## 2. Solution Description
**NexusSynth AI** is an enterprise-grade research discovery and multi-document synthesis platform. Researchers create isolated **Research Workspaces** guided by a core inquiry question, ingest multi-format sources (PDF uploads via `multer` + `pdf-parse` or raw literature text), and harness the **Google Gemini API** (`@google/genai`) to execute four cognitive workflows:

1. **Automated Source Deconstruction**: Upon ingestion, Gemini parses documents into executive summaries, empirical claims with confidence ratings (`HIGH`, `MODERATE`, `SPECULATIVE`), methodology critiques, explicit study limitations, and quantitative metrics.
2. **Cross-Source Synthesis & Contradiction Matrix**: Select 2 to 10 sources to generate a comparative literature matrix identifying points of consensus, root methodological causes of empirical divergence, and high-priority unexplored research gaps.
3. **Grounded Corpus Q&A Assistant**: A conversational research assistant strictly anchored in the workspace's ingested materials, providing inline clickable citations (`[Source ID: X]`), grounding confidence banners, and suggested follow-up questions without external hallucinations.
4. **Entity Knowledge Graph & Explorer**: A visual concept matrix and tag cloud mapping normalized domain entities, biomarkers, frameworks, and technologies across the entire corpus.

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NexusSynth AI Client (React)                    │
│   ┌────────────────┐ ┌──────────────────┐ ┌─────────────────────────┐  │
│   │ Dashboard & KPI│ │ Workspace Center │ │ Contradiction Studio    │  │
│   └────────────────┘ └──────────────────┘ └─────────────────────────┘  │
│   ┌────────────────┐ ┌──────────────────┐ ┌─────────────────────────┐  │
│   │ Grounded Q&A   │ │ Entity Matrix    │ │ Source Deep-Dive        │  │
│   └────────────────┘ └──────────────────┘ └─────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Axios (Bearer JWT Interceptor)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express.js Server (Port 3000)                   │
│   ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│   │ Auth Middleware │  │ Zod Validators   │  │ Rate Limiter         │  │
│   └─────────────────┘  └──────────────────┘  └──────────────────────┘  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Routes: /api/auth, /api/workspaces, /api/sources, /api/chat     │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│   ┌─────────────────────────────┐    ┌──────────────────────────────┐  │
│   │ Multer + pdf-parse Service  │    │ Gemini 2.5 Flash GenAI SDK   │  │
│   └─────────────────────────────┘    └──────────────────────────────┘  │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
     ┌─────────────────────────────┐   ┌──────────────────────────────┐
     │   Google Gemini API         │   │   PostgreSQL / PGlite        │
     │   Structured JSON Schemas   │   │   • users                    │
     │   System Instructions       │   │   • workspaces               │
     │   Inline Source Grounding   │   │   • sources                  │
     │                             │   │   • syntheses                │
     │                             │   │   • chat_messages            │
     └─────────────────────────────┘   └──────────────────────────────┘
```

---

## 4. Key Features

- **1-Click Reviewer Demo**: Instant evaluation path on `/login` via `"Launch Instant Demo Account"` (Dr. Elena Rostova / Genomic Delivery Systems Consortium), pre-seeded with 3 clinical papers, a cross-source contradiction matrix, and grounded chat history.
- **Pre-Packaged Scientific Source Templates**: Test PDF parsing and raw text ingestion with 1-click sample studies (Biodegradable Ester Lipids, Cryo-EM Nanostructures, Clinical Immunogenicity Cohorts).
- **Tenant-Isolated Row Level Security**: All queries strictly bind `user_id = req.user.id` to guarantee tenant isolation.
- **Strict Citation Anchoring**: Chat answers and syntheses are explicitly attributed to primary source IDs and publication titles.
- **Confidence Rating Taxonomy**: Empirical assertions are classified as `HIGH` (Emerald), `MODERATE` (Amber), or `SPECULATIVE` (Rose).

---

## 5. Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React icons, Axios.
- **Backend**: Node.js, Express.js, TypeScript / ES Modules, Multer, `pdf-parse`, Helmet, Express Rate Limit, Zod.
- **Database**: PostgreSQL (via `pg` Pool with SSL support) + Embedded PostgreSQL (PGlite) for zero-config persistence.
- **Artificial Intelligence**: `@google/genai` (Official Google Gen AI SDK), `gemini-2.5-flash` with structured JSON schemas (`responseSchema`).

---

## 6. Environment Variables

### Backend (`server/.env.example`)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/nexussynth_db
JWT_SECRET=super_secret_enterprise_jwt_signing_key_2026
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key_here
CLIENT_URL=http://localhost:3000
```

---

## 7. Local Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env` in the root directory:
```env
GEMINI_API_KEY=your_api_key_here
JWT_SECRET=super_secret_enterprise_jwt_signing_key_2026
```
*(Note: If `DATABASE_URL` is omitted, the app automatically initializes embedded PostgreSQL with local file persistence, requiring zero external database configuration).*

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 8. Deployment Guide

### Deploying to Production (Render / Railway / Cloud Run + Supabase / Neon)
1. **Database**: Create a PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com). Copy the connection URI into `DATABASE_URL`.
2. **Build**:
   ```bash
   npm run build
   ```
3. **Start**:
   ```bash
   npm start
   ```
4. Set production environment variables: `GEMINI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.

---

## 9. Evaluator Quick-Start Guide
1. Go to `/login` and click **"Launch Instant Demo Account (Dr. Elena Rostova)"**.
2. Explore the pre-seeded workspace: **"Ionizable Lipid Nanoparticles & mRNA Transfection Optimization"**.
3. Inspect **Tab 1 (Source Library)** to review the 3 pre-analyzed papers, or click **"Ingest Source"** and click **"Sample 1: Biodegradable Ester Lipid Study"** to test live Gemini claim extraction.
4. Open **Tab 2 (Synthesis Studio)** to examine the **Consensus vs. Contradiction Matrix**, detailing empirical divergences and research gaps.
5. In **Tab 3 (Grounded Q&A)**, ask any question about sample size or clearance half-life to test real-time grounded citations with clickable badges.
