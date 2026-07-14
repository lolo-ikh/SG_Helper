# PROJECT_MAP.md — EBEC Admin Hub

## TECH_STACK
- React 19.2.7 + Vite 8.1.4
- Supabase (Auth + Storage + PostgreSQL + pgvector)
- react-router-dom 7.18.1
- lucide-react 1.24.0
- pdfjs-dist 5.6.205
- Groq API (Llama 3.1 8B) — free LLM generation
- HuggingFace Inference API (all-MiniLM-L6-v2) — free semantic embeddings

## SYSTEM_FLOW
1. Auth → Supabase Auth (email/password, role-based: vp/admin/manager/viewer)
2. Dashboard → Season-filtered overview, typing effect, Judgment Board (VP-only)
3. Meetings → CRUD, attendance, notes, reports
4. TechCards → CRUD, Google Doc sync, reference auto-increment
5. Activities → Stats hub (charts, sponsorship rate)
6. Attendance → Portal with engagement matrix
7. Managers → CRUD with season scoping, legacy seed
8. Archive → Season tabs, read-only detail modals
9. **EBECO** → File management + RAG chatbot
   - Upload PDFs (single or multi) → Supabase Storage bucket `ebecco-docs`
   - Extract text → pdfjs-dist (Y-position line break reconstruction)
   - Parse structure → headings, sections, bullets, labels (documentParser.js)
   - Semantic chunking → 800 char max, complete sentences, breadcrumb prefix (semanticChunker.js)
   - Store chunks in `ebecco_chunks` with FTS + pgvector embeddings (384-dim)
   - Enhance: HuggingFace embeddings + Groq/Llama summaries/keywords
   - Chat: 4-tier search → semantic (pgvector) → FTS (OR-based) → LIKE → title match
   - Feedback loops: conversation memory, source click tracking, query expansion
   - Generate: Llama 3.1 8B via Groq (free) → answer with sources

## ARCHITECTURE
```
client/src/
├── App.jsx              — Router, 3-tier auth gate
├── hooks/useAuth.jsx    — Auth context, VP_EMAIL, role resolution
├── lib/supabase.js      — Supabase client singleton
├── components/
│   ├── Navbar.jsx       — Glass nav, conditional VP items
│   ├── Footer.jsx       — Dynamic year, Leena IKHLEF
│   ├── Toast.jsx        — Notification system
│   └── EbeccoChat.jsx   — Floating chat widget (bottom-right)
├── pages/
│   ├── Landing.jsx      — Auth page, APPROVED_EMAILS
│   ├── EmailVerification.jsx
│   ├── Dashboard.jsx    — Hero, typing effect, carousel, stats
│   ├── TechCards/
│   ├── Meetings/
│   ├── Activities/
│   ├── Attendance/
│   ├── Managers/
│   ├── Archive/
│   └── Ebecco/
│       └── EbeccoDocuments.jsx — Upload (multi) + file management
├── utils/
│   ├── helpers.js
│   ├── legacyData.js
│   ├── rolePhrases.js
│   ├── pdfExtractor.js     — extractPdfText() + chunkDocument()
│   ├── documentParser.js   — Structural text parser (headings, fallback for no-heading PDFs)
│   ├── semanticChunker.js  — Semantic block chunker (800 char max)
│   ├── ebeccoSearch.js     — 4-tier search (semantic → FTS → LIKE → title) + click feedback boost
│   ├── ebeccoRag.js        — RAG generation (Groq/Llama, context diversity)
│   ├── ebeccoReformulate.js — Query reformulation (conversation context) + expansion (broad queries)
│   └── ebeccoEnhance.js    — LLM chunk enhancement + embeddings
└── styles/app.css       — All CSS, responsive breakpoints

client/supabase/
├── ebecco_tables.sql    — Document + chunks tables + RLS
├── ebecco_search.sql    — FTS indexes + search_ebecco RPC (OR-based)
├── ebecco_enhance.sql   — summary/keywords columns + weighted search
├── ebecco_vector.sql    — pgvector extension + embedding column + cosine search RPC
└── functions/
    ├── generate-answer/index.ts    — LLM generation (Groq/Llama primary, OpenAI fallback)
    ├── enhance-chunks/index.ts     — HuggingFace embeddings + LLM summaries
    └── search-semantic/index.ts    — Query embedding + pgvector cosine similarity
```

## DATABASE_TABLES
- `meetings` — Season-filtered, attendance JSONB, notes, reports
- `tech_cards` — Season-filtered, reference auto-increment, Google Doc sync
- `managers` — Season-scoped, unique index (name, season)
- `profiles` — Auth user profiles with role
- `ebecco_documents` — Document metadata (title, category, file info, page/chunk counts)
- `ebecco_chunks` — Text chunks + FTS vector + pgvector embedding(384) + summary/keywords
- `ebecco_feedback` — Source click tracking (chunk_id, query, action, timestamp)

## DEPLOYMENT
- Vercel: https://sg-helper.vercel.app
- Supabase: mfacvnugnhnwzousvtzz
- VP_EMAIL: leena.ikhlef@ensia.edu.dz
- LLM: Groq (Llama 3.1 8B) — free, no OpenAI needed
- Embeddings: HuggingFace Inference API (all-MiniLM-L6-v2) — free

## ORPHANS & PENDING
- `ebecco_feedback.sql` — needs to be run in Supabase SQL Editor (new table for click tracking)

## DEPLOYMENT_STEPS
1. Run `client/supabase/ebecco_tables.sql` in Supabase SQL Editor
2. Run `client/supabase/ebecco_search.sql` in Supabase SQL Editor
3. Run `client/supabase/ebecco_enhance.sql` in Supabase SQL Editor
4. Run `client/supabase/ebecco_vector.sql` in Supabase SQL Editor (pgvector + embedding column)
5. Run `client/supabase/ebecco_feedback.sql` in Supabase SQL Editor (click feedback table)
6. Create Storage bucket `ebecco-docs` (private) in Supabase Dashboard
6. Deploy Edge Functions:
   - `supabase functions deploy generate-answer`
   - `supabase functions deploy enhance-chunks`
   - `supabase functions deploy search-semantic`
7. Set API keys:
   - `supabase secrets set GROQ_API_KEY=gsk_...` (Llama 3.1 via Groq — free)
   - `supabase secrets set HF_API_KEY=hf_...` (HuggingFace — free, for embeddings)
8. Push to Vercel
9. Re-upload documents OR run retroactive embedding via EBECO Documents page
