# SG Helper — EBEC Admin Hub

> The Central Operating System for the ENSIA Business & Entrepreneurship Club.

**SG Helper** is a full-stack administrative platform built to manage the operations of **EBEC (Ensia Business & Entrepreneurship Club)**. It replaces manual paperwork with a digital-first ecosystem — from meeting management and attendance tracking to an AI-powered knowledge assistant.

**Live:** [sg-helper.vercel.app](https://sg-helper.vercel.app)

---

## Features

### Authentication & Access Control
- Supabase Auth with email/password sign-up and email verification
- 3-tier role system: **VP** (full access), **Admin**, **Manager** (scoped), **Viewer** (read-only)
- Approved email whitelist for sign-up — only authorized EBEC members can register
- VP role hardcoded for security — cannot be assigned via database

### Dashboard
- Season-filtered overview with animated typing effect hero
- Quick-stats cards for meetings, tech cards, and attendance
- Judgment Board section (VP-only visibility)
- Season carousel with automatic transitions

### Meeting Management
- Full CRUD for meetings with season filtering
- Attendance tracking with per-member status (present/absent/excused)
- Meeting notes and report generation
- Auto-generated reference numbers for official documents

### Tech Cards
- CRUD for technology/partner cards with Google Doc sync
- Auto-incrementing reference numbers per season
- Rich content editing with preview

### Activities & Statistics
- Visual analytics hub with charts and metrics
- Sponsorship rate tracking
- Departmental performance overview

### Attendance Portal
- Dedicated portal for logging manager attendance
- Visual engagement matrix with percentage tracking
- Per-department attendance analytics

### Manager Directory
- CRUD for club managers with season scoping
- Legacy data auto-seeding across seasons
- Role-based visibility and editing permissions

### Archive
- Season-based tabs for browsing historical data
- Read-only detail modals for past records
- Seamless navigation between seasons (2025-2026, 2026-2027)

### EBECO — AI Knowledge Assistant
A RAG (Retrieval-Augmented Generation) chatbot that answers questions from uploaded EBEC documents.

**Document Pipeline:**
- Upload PDFs (single or multi-file) to Supabase Storage
- Extract text with `pdfjs-dist` using Y-position line break reconstruction
- Parse document structure (headings, sections, bullets, role titles)
- Semantic chunking — 800 char max, complete sentences, breadcrumb prefixes
- Store chunks with PostgreSQL FTS vectors + pgvector embeddings (384-dim)
- Enhance with HuggingFace embeddings + Groq/Llama summaries and keywords

**Search Architecture (4-tier merged):**
- **Tier 0:** Semantic search via client-side HuggingFace embedding + pgvector cosine similarity
- **Tier 1:** Full-text search via PostgreSQL `tsvector` with OR-based matching
- **Tier 2:** LIKE keyword search — AND for person names, OR for topic words
- **Tier 3:** Document title matching
- Targeted category fetch for admin docs and presentations (always runs)
- Category weighting (admin docs 1.6x, presentations 1.3x)
- Diversity pass ensures multiple document sources in results

**Feedback Loops (self-improving):**
- **Conversation Context Memory:** Detects ambiguous follow-up queries ("who is she?") and reformulates them using chat history via Groq
- **Query Expansion:** Broad queries ("tell me about ebec") are expanded into 4-6 specific search keywords via LLM
- **Source Click Tracking:** Logs which sources users click, boosts ranking of frequently-clicked chunks over time

**Generation:**
- Llama 3.1 8B via Groq API (free, 30 RPM)
- Season-aware role progression — shows roles across 2025-2026 and 2026-2027
- Self-awareness — answers "what are you?", "who made you?" from built-in knowledge
- Inline source citations with clickable badges and PDF side-panel viewer
- Markdown-rendered responses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19.2.7 + Vite 8.1.4 |
| Routing | react-router-dom 7.18.1 |
| Styling | Custom CSS3 (Apple-inspired, glass morphism) |
| Icons | lucide-react 1.24.0 |
| Backend | Supabase (Auth + PostgreSQL + Storage + pgvector) |
| PDF Parsing | pdfjs-dist 5.6.205 |
| LLM | Groq API — Llama 3.1 8B Instant (free) |
| Embeddings | HuggingFace Inference API — all-MiniLM-L6-v2 (free) |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## Database Schema

| Table | Description |
|---|---|
| `meetings` | Season-filtered meetings with attendance JSONB, notes, reports |
| `tech_cards` | Season-filtered tech cards with reference auto-increment |
| `managers` | Season-scoped manager profiles with unique index |
| `profiles` | Auth user profiles with role assignments |
| `ebecco_documents` | Document metadata (title, category, file info, page/chunk counts) |
| `ebecco_chunks` | Text chunks with FTS vectors, pgvector embeddings (384-dim), summaries, keywords |
| `ebecco_feedback` | Source click tracking (chunk_id, query, action, timestamp) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project (free tier works)
- Groq API key (free — [console.groq.com](https://console.groq.com))
- HuggingFace API key (free — [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))

### Installation

```bash
git clone https://github.com/lolo-ikh/SG_Helper.git
cd SG_Helper/ebec-admin/client
npm install
```

### Environment Variables

Create `.env` in `ebec-admin/client/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=gsk_...
VITE_HF_API_KEY=hf_...
```

### Database Setup

Run these SQL files in Supabase SQL Editor, in order:

1. `client/supabase/ebecco_tables.sql` — document + chunks tables
2. `client/supabase/ebecco_search.sql` — FTS indexes + search RPC
3. `client/supabase/ebecco_enhance.sql` — summary/keywords columns
4. `client/supabase/ebecco_vector.sql` — pgvector extension + embedding column + cosine search RPC
5. `client/supabase/ebecco_feedback.sql` — click feedback table

Create a private Storage bucket named `ebecco-docs` in Supabase Dashboard.

### Run Development Server

```bash
cd ebec-admin/client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
ebec-admin/
├── client/
│   ├── src/
│   │   ├── App.jsx                    — Router, auth gate
│   │   ├── hooks/useAuth.jsx          — Auth context, role resolution
│   │   ├── lib/supabase.js            — Supabase client singleton
│   │   ├── components/
│   │   │   ├── Navbar.jsx             — Glass nav, conditional items
│   │   │   ├── Footer.jsx             — Dynamic year
│   │   │   ├── Toast.jsx              — Notification system
│   │   │   └── EbeccoChat.jsx         — Floating chat widget + PDF viewer
│   │   ├── pages/
│   │   │   ├── Landing.jsx            — Auth page
│   │   │   ├── Dashboard.jsx          — Hero, stats, carousel
│   │   │   ├── TechCards/             — CRUD + Google Doc sync
│   │   │   ├── Meetings/              — CRUD + attendance + reports
│   │   │   ├── Activities/            — Stats hub
│   │   │   ├── Attendance/            — Portal + engagement matrix
│   │   │   ├── Managers/              — CRUD + season scoping
│   │   │   ├── Archive/               — Season tabs + read-only modals
│   │   │   └── Ebecco/
│   │   │       └── EbeccoDocuments.jsx — Upload + file management
│   │   ├── utils/
│   │   │   ├── pdfExtractor.js        — PDF text extraction + chunking
│   │   │   ├── documentParser.js      — Structural text parser
│   │   │   ├── semanticChunker.js     — Semantic block chunker
│   │   │   ├── ebeccoSearch.js        — 4-tier search + feedback boost
│   │   │   ├── ebeccoRag.js           — RAG generation (Groq/Llama)
│   │   │   ├── ebeccoReformulate.js   — Query reformulation + expansion
│   │   │   └── ebeccoEnhance.js       — LLM chunk enhancement
│   │   └── styles/app.css             — All CSS
│   └── supabase/
│       ├── ebecco_tables.sql
│       ├── ebecco_search.sql
│       ├── ebecco_enhance.sql
│       ├── ebecco_vector.sql
│       └── ebecco_feedback.sql
├── PROJECT_MAP.md                     — Architecture documentation
└── README.md
```

---

## Deployment

The app is deployed on [Vercel](https://sg-helper.vercel.app) with Supabase as the backend.

To deploy:
1. Push to `main` branch
2. Vercel auto-deploys from GitHub
3. Ensure all SQL files have been run in Supabase
4. Ensure API keys are set in `.env`

---

## Built By

**Leena Ikhlef** — Vice President of EBEC 2026-2027, ENSIA

Developed for the ENSIA Business & Entrepreneurship Club to ensure administrative continuity across seasons.
