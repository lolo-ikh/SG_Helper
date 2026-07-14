# PROJECT_MAP.md — EBEC Admin Hub

## TECH_STACK
- React 19.2.7 + Vite 8.1.4
- Supabase (Auth + Storage + PostgreSQL)
- react-router-dom 7.18.1
- lucide-react 1.24.0
- pdfjs-dist 5.6.205
- OpenAI API gpt-4.1-mini (Edge Function)

## SYSTEM_FLOW
1. Auth → Supabase Auth (email/password, role-based: vp/admin/manager/viewer)
2. Dashboard → Season-filtered overview, typing effect, Judgment Board (VP-only)
3. Meetings → CRUD, attendance, notes, reports
4. TechCards → CRUD, Google Doc sync, reference auto-increment
5. Activities → Stats hub (charts, sponsorship rate)
6. Attendance → Portal with engagement matrix
7. Managers → CRUD with season scoping, legacy seed
8. Archive → Season tabs, read-only detail modals
9. **EBECO** (NEW) → File management + RAG chatbot
   - Upload PDFs → Supabase Storage bucket `ebecco-docs`
   - Extract text client-side → pdfjs-dist
   - Parse structure → headings, sections, bullets, labels (documentParser.js)
   - Semantic chunking → 800 char max, complete sentences, breadcrumb prefix (semanticChunker.js)
   - Store chunks in `ebecco_chunks` table with FTS + optional summary/keywords
   - Chat widget → OR-based FTS search (content + summary + keywords) → OpenAI generation → answer with sources

## ARCHITECTURE
```
client/src/
├── App.jsx              — Router, 3-tier auth gate
├── hooks/useAuth.jsx    — Auth context, VP_EMAIL, role resolution
├── lib/supabase.js      — Supabase client singleton
├── components/
│   ├── Navbar.jsx       — Glass nav, conditional VP items
│   ├── Footer.jsx       — Dynamic year, Leena IKHLEF
│   └── Toast.jsx        — Notification system
├── pages/
│   ├── Landing.jsx      — Auth page, APPROVED_EMAILS
│   ├── EmailVerification.jsx
│   ├── Dashboard.jsx    — Hero, typing effect, carousel, stats
│   ├── TechCards/
│   │   ├── TechCardsPage.jsx
│   │   ├── TechCardForm.jsx
│   │   └── TechCardEdit.jsx
│   ├── Meetings/
│   │   ├── MeetingsPage.jsx
│   │   ├── MeetingForm.jsx
│   │   ├── AttendanceModal.jsx
│   │   ├── NotesEditor.jsx
│   │   └── ReportGenerator.jsx
│   ├── Activities/
│   │   └── TechCardStats.jsx
│   ├── Attendance/
│   │   └── AttendancePortal.jsx
│   ├── Managers/
│   │   ├── ManagersPage.jsx
│   │   └── ManagerForm.jsx
│   ├── Archive/
│   │   ├── ArchivePage.jsx
│   │   └── AttendancePredictor.jsx
│   └── Ebecco/          (NEW — M1)
│       └── EbeccoDocuments.jsx
├── utils/
│   ├── helpers.js
│   ├── legacyData.js
│   ├── rolePhrases.js
│   ├── pdfExtractor.js     — extractPdfText() + chunkDocument()
│   ├── documentParser.js   — Structural text parser (headings, bullets, labels)
│   ├── semanticChunker.js  — Semantic block chunker (800 char max)
│   ├── ebeccoSearch.js     — 3-tier FTS search (RPC → LIKE → title)
│   ├── ebeccoRag.js        — RAG generation (Edge Function + fallback)
│   └── ebeccoEnhance.js    — LLM chunk enhancement (summary + keywords)
└── styles/app.css       — All CSS, responsive breakpoints
```

## DATABASE_TABLES
- `meetings` — Season-filtered, attendance JSONB, notes, reports
- `tech_cards` — Season-filtered, reference auto-increment, Google Doc sync
- `managers` — Season-scoped, unique index (name, season)
- `profiles` — Auth user profiles with role
- `ebecco_documents` — Document metadata (title, category, file info, page/chunk counts)
- `ebecco_chunks` — Structured text chunks with FTS vector + optional summary/keywords

## DEPLOYMENT
- Vercel: https://sg-helper.vercel.app
- Supabase: mfacvnugnhnwzousvtzz
- VP_EMAIL: leena.ikhlef@ensia.edu.dz

## ORPHANS & PENDING
- [x] M1: Create SQL migration for ebecco_documents + ebecco_chunks tables
- [x] M1: Create EbeccoDocuments.jsx (upload + file list)
- [x] M1: Add route /ebecco to App.jsx
- [x] M1: Add nav link to Navbar.jsx
- [x] M2: Create pdfExtractor.js (pdfjs-dist text extraction)
- [x] M2: Integrate extraction into upload flow
- [x] M3: Create search_ebecco RPC function
- [x] M3: Create ebeccoSearch.js utility
- [x] M4: Create EbeccoChat.jsx widget component
- [x] M4: Add to App.jsx as global overlay
- [x] M5: Create OpenAI integration for RAG generation
- [x] M5: Wire chat to search + generation
- [x] M6: Loading states, error handling, mobile responsive
- [x] BUGFIX: FTS `english` → `simple` dictionary (was breaking non-English content)
- [x] BUGFIX: Added LIKE-based fallback search when RPC fails or returns empty
- [x] BUGFIX: Search errors now surfaced to user instead of silent "no information"
- [x] IMPROVEMENT: OCR ligature cleanup in pdfExtractor.js (fi/fl/ff splits + short-token merges)
- [x] REDESIGN M1: Structural text parser (documentParser.js) — headings, bullets, labels
- [x] REDESIGN M2: Semantic chunker (semanticChunker.js) — 800 char max, complete sentences
- [x] REDESIGN M3: Rewrote pdfExtractor.js to use parser→chunkDocument() pipeline
- [x] REDESIGN M4: enhance-chunks Edge Function (LLM summary + keywords)
- [x] REDESIGN M5: Updated search_ebecco RPC to search content + summary + keywords

## DEPLOYMENT_STEPS
1. Run `client/supabase/ebecco_tables.sql` in Supabase SQL Editor
2. Run `client/supabase/ebecco_search.sql` in Supabase SQL Editor (safe to re-run — uses CREATE OR REPLACE)
3. Run `client/supabase/ebecco_enhance.sql` in Supabase SQL Editor (adds summary/keywords + weighted search)
4. Create Storage bucket `ebecco-docs` (private) in Supabase Dashboard
5. Deploy Edge Functions:
   - `supabase functions deploy generate-answer`
   - `supabase functions deploy enhance-chunks`
6. Set OpenAI API key: `supabase secrets set OPENAI_API_KEY=sk-...`
7. Push to Vercel
