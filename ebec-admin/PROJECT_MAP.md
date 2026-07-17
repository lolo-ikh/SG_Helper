# PROJECT_MAP.md — EBEC Admin Hub

## TECH_STACK
- React 19.2.7 + Vite 8.1.4
- Supabase (Auth + Storage + PostgreSQL + pgvector)
- react-router-dom 7.18.1
- lucide-react 1.24.0
- pdfjs-dist 5.6.205
- qrcode — QR code generation for meeting check-in
- Groq API (Llama 3.1 8B) — free LLM (EBECO + report generation)
- HuggingFace Inference API (all-MiniLM-L6-v2) — free semantic embeddings

## SYSTEM_FLOW
1. Auth → Supabase Auth (email/password, isApproved for 5 core members, isVP for admin-only)
2. Dashboard → Season-filtered overview, typing effect, Judgment Board (VP-only)
3. Meetings → CRUD (isApproved), QR check-in, attendance (manual + QR), notes, AI reports
4. TechCards → CRUD (VP-only), Google Doc sync, reference auto-increment
5. Activities → Stats hub (charts, sponsorship rate)
6. Attendance → Portal with engagement matrix
7. Managers → CRUD with season scoping, legacy seed
8. Archive → Season tabs, read-only detail modals
9. **EBECO** → File management + RAG chatbot
10. **Check-in** → Public QR scan page, no auth, token-verified

## ARCHITECTURE
```
client/src/
├── App.jsx              — Router, 3-tier auth gate, public /checkin route
├── hooks/useAuth.jsx    — Auth context, APPROVED_EMAILS (5), isApproved, isVP
├── lib/supabase.js      — Supabase client singleton
├── components/
│   ├── Navbar.jsx       — Glass nav, conditional VP items
│   ├── Footer.jsx       — Dynamic year, Leena IKHLEF
│   ├── Toast.jsx        — Notification system
│   └── EbeccoChat.jsx   — Floating chat widget (bottom-right)
├── pages/
│   ├── Landing.jsx      — Auth page
│   ├── CheckInPage.jsx  — Public QR check-in (no auth, token-verified)
│   ├── EmailVerification.jsx
│   ├── Dashboard.jsx    — Hero, typing effect, carousel, stats, QR button
│   ├── TechCards/
│   ├── Meetings/
│   │   ├── MeetingsPage.jsx     — Meeting list, QR button, isApproved gating
│   │   ├── MeetingForm.jsx      — Create/edit with checkin_token generation
│   │   ├── MeetingQR.jsx        — QR code display + copy link modal
│   │   ├── AttendanceModal.jsx  — Manual + QR check-in display
│   │   ├── NotesEditor.jsx      — Rich text meeting notes
│   │   └── ReportGenerator.jsx  — PDF upload + LaTeX + AI Generate
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
│   ├── pdfExtractor.js
│   ├── documentParser.js
│   ├── semanticChunker.js
│   ├── ebeccoSearch.js
│   ├── ebeccoRag.js
│   ├── ebeccoReformulate.js
│   ├── ebeccoEnhance.js
│   ├── ebeccoAppData.js
│   └── reportGenerator.js — Groq-powered meeting report generation
└── styles/app.css       — All CSS, responsive breakpoints, .checkin-page

client/supabase/
├── ebecco_tables.sql
├── ebecco_search.sql
├── ebecco_enhance.sql
├── ebecco_vector.sql
├── ebecco_feedback.sql
├── ebecco_answer_feedback.sql
└── meeting_checkins.sql  — Check-in table + checkin_attendee RPC
```

## DATABASE_TABLES
- `meetings` — Season-filtered, attendance JSONB, notes, reports, checkin_token
- `meeting_checkins` — QR check-in records (meeting_id, name, checked_in_at), UNIQUE constraint
- `tech_cards` — Season-filtered, reference auto-increment, Google Doc sync
- `managers` — Season-scoped, unique index (name, season)
- `profiles` — Auth user profiles with role
- `ebecco_documents` — Document metadata
- `ebecco_chunks` — Text chunks + FTS + pgvector embedding(384) + summary/keywords
- `ebecco_feedback` — Source click tracking
- `ebecco_answer_feedback` — Like/dislike on assistant answers

## DEPLOYMENT
- Vercel: https://sg-helper.vercel.app
- Supabase: mfacvnugnhnwzousvtzz
- APPROVED_EMAILS: 5 core members (Leena, Oussama, SG/Aya, Dorsaf, ileena1618)
- LLM: Groq (Llama 3.1 8B) — free
- Embeddings: HuggingFace (all-MiniLM-L6-v2) — free

## ORPHANS & PENDING
- `ebecco_answer_feedback.sql` — needs to be run in Supabase SQL Editor
- `meeting_checkins.sql` — needs to be run in Supabase SQL Editor
- `ebecco_search.sql` — needs re-run (plainto_tsquery fix)

## DEPLOYMENT_STEPS
1. Run `client/supabase/ebecco_tables.sql`
2. Run `client/supabase/ebecco_search.sql`
3. Run `client/supabase/ebecco_enhance.sql`
4. Run `client/supabase/ebecco_vector.sql`
5. Run `client/supabase/ebecco_feedback.sql`
6. Run `client/supabase/ebecco_answer_feedback.sql`
7. Run `client/supabase/meeting_checkins.sql` (adds checkin_token + meeting_checkins table + RPCs)
8. Create Storage bucket `ebecco-docs` (private)
9. Push to Vercel
