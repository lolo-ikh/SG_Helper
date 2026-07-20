# PROJECT_MAP.md — EBEC Admin Hub

## TECH_STACK
- React 19.2.7 + Vite 8.1.4
- Supabase (Auth + Storage + PostgreSQL + pgvector)
- react-router-dom 7.18.1
- lucide-react 1.24.0
- pdfjs-dist 5.6.205
- qrcode — QR code generation for meeting check-in
- resend — Email sending (free tier: 3,000/mo)
- Groq API (Llama 3.1 8B) — free LLM (EBECO + report generation + email generation)
- HuggingFace Inference API (all-MiniLM-L6-v2) — free semantic embeddings

## SYSTEM_FLOW
1. Auth → Supabase Auth (email/password, isApproved for 5 core members, isVP for admin-only, isLeader for VP+vice+SG)
2. Dashboard → Season-filtered overview, typing effect, Judgment Board (VP-only)
3. Meetings → CRUD (isApproved), QR check-in, attendance (manual + QR), notes, AI reports
4. TechCards → CRUD (VP-only), Google Doc sync, reference auto-increment
5. Activities → Stats hub (charts, sponsorship rate)
6. Attendance → Portal with engagement matrix
7. Managers → CRUD with season scoping, legacy seed
8. Archive → Season tabs, read-only detail modals
9. **EBECO** → File management + RAG chatbot + **admin actions via chat** (create meetings, send emails, generate reports)
10. **Check-in** → Public QR scan page, no auth, token-verified
11. **Email System** → AI-generated emails sent via Resend, preview before send, edit capability

## ARCHITECTURE
```
client/
├── api/
│   └── email/index.js         — Vercel Serverless Function (Resend email sender)
├── src/
│   ├── App.jsx                 — Router, 3-tier auth gate, public /checkin route
│   ├── hooks/useAuth.jsx       — Auth context, APPROVED_EMAILS, LEADERS_EMAILS, isLeader, isVP
│   ├── lib/supabase.js         — Supabase client singleton
│   ├── components/
│   │   ├── Navbar.jsx          — Glass nav, conditional VP items
│   │   ├── Footer.jsx          — Dynamic year, Leena IKHLEF
│   │   ├── Toast.jsx           — Notification system
│   │   ├── EbeccoChat.jsx      — Floating chat widget with action cards + email preview
│   │   ├── ActionCard.jsx      — Confirm/cancel UI for admin actions in chat
│   │   └── EmailPreview.jsx    — Email preview card with send/edit/cancel
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── CheckInPage.jsx
│   │   ├── EmailVerification.jsx
│   │   ├── Dashboard.jsx
│   │   ├── TechCards/
│   │   ├── Meetings/
│   │   │   ├── MeetingsPage.jsx
│   │   │   ├── MeetingForm.jsx
│   │   │   ├── MeetingQR.jsx
│   │   │   ├── AttendanceModal.jsx
│   │   │   ├── NotesEditor.jsx
│   │   │   └── ReportGenerator.jsx
│   │   ├── Activities/
│   │   ├── Attendance/
│   │   ├── Managers/
│   │   ├── Archive/
│   │   └── Ebecco/
│   │       └── EbeccoDocuments.jsx
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── legacyData.js
│   │   ├── rolePhrases.js
│   │   ├── pdfExtractor.js
│   │   ├── documentParser.js
│   │   ├── semanticChunker.js
│   │   ├── ebeccoSearch.js
│   │   ├── ebeccoRag.js        — RAG answer gen (updated: admin capabilities in system prompt)
│   │   ├── ebeccoReformulate.js
│   │   ├── ebeccoEnhance.js
│   │   ├── ebeccoAppData.js
│   │   ├── reportGenerator.js  — Groq-powered meeting report generation
│   │   ├── mcpTools.js         — Tool definitions + Supabase executors (10 tools)
│   │   ├── emailGenerator.js   — Groq-powered dynamic email composition
│   │   └── intentHandler.js    — Routes Groq tool calls to executors
│   └── styles/app.css          — All CSS, responsive, action-card, email-preview styles
└── vercel.json                 — SPA rewrite + /api/ exclusion

client/supabase/
├── ebecco_tables.sql
├── ebecco_search.sql
├── ebecco_enhance.sql
├── ebecco_vector.sql
├── ebecco_feedback.sql
├── ebecco_answer_feedback.sql
├── meeting_checkins.sql
└── email_logs.sql              — Email tracking table
```

## DATABASE_TABLES
- `meetings` — Season-filtered, attendance JSONB, notes, reports, checkin_token
- `meeting_checkins` — QR check-in records
- `tech_cards` — Season-filtered, reference auto-increment
- `managers` — Season-scoped, unique index (name, season)
- `profiles` — Auth user profiles with role (vp/leader/manager/admin)
- `ebecco_documents` — Document metadata
- `ebecco_chunks` — Text chunks + FTS + pgvector embedding(384) + summary/keywords
- `ebecco_feedback` — Source click tracking
- `ebecco_answer_feedback` — Like/dislike on assistant answers
- `email_logs` — Email send history (to, subject, body, status, created_at)

## MCP_TOOLS (EBECO Chat Actions)
- `create_meeting` — leaders only
- `update_meeting` — leaders only
- `delete_meeting` — leaders only
- `list_meetings` — all approved
- `get_attendance` — all approved
- `create_tech_card` — leaders only
- `list_tech_cards` — all approved
- `list_managers` — all approved
- `generate_report` — all approved
- `send_email` — leaders only (AI generates content dynamically)

## PERMISSION_LEVELS
- **isVP** — Full admin access (all routes, delete, manager CRUD)
- **isLeader** — VP + vice presidents + SG — can create/update/delete meetings, send emails, create tech cards
- **isApproved** — All 5 core members — can chat, query, view data
- **isManager** — Authenticated users

## DEPLOYMENT
- Vercel: https://sg-helper.vercel.app
- Supabase: mfacvnugnhnwzousvtzz
- APPROVED_EMAILS: 5 core members
- LEADERS_EMAILS: Leena + Oussama (VP + SG)
- LLM: Groq (Llama 3.1 8B) — free
- Embeddings: HuggingFace (all-MiniLM-L6-v2) — free
- Email: Resend (sandbox: onboarding@resend.dev) — 3,000/mo free

## ORPHANS & PENDING
- `email_logs.sql` — needs to be run in Supabase SQL Editor
- `ebecco_answer_feedback.sql` — needs to be run in Supabase SQL Editor
- `meeting_checkins.sql` — needs to be run in Supabase SQL Editor
- `ebecco_search.sql` — needs re-run (plainto_tsquery fix)
- **Resend API key** — user needs to sign up at resend.com, get key, set RESEND_API_KEY in Vercel
- **LEADERS_EMAILS** — add vice president and SG emails to useAuth.jsx

## DEPLOYMENT_STEPS
1. Run `client/supabase/ebecco_tables.sql`
2. Run `client/supabase/ebecco_search.sql`
3. Run `client/supabase/ebecco_enhance.sql`
4. Run `client/supabase/ebecco_vector.sql`
5. Run `client/supabase/ebecco_feedback.sql`
6. Run `client/supabase/ebecco_answer_feedback.sql`
7. Run `client/supabase/meeting_checkins.sql`
8. Run `client/supabase/email_logs.sql` (NEW)
9. Create Storage bucket `ebecco-docs` (private)
10. Sign up at https://resend.com (free) → get API key
11. Set `RESEND_API_KEY` in Vercel dashboard → Settings → Environment Variables
12. Add `LEADERS_EMAILS` vice/SG emails to useAuth.jsx
13. Push to Vercel
