# LeadDesk — Project Progress

## Phase 1 — Backend Skeleton + Project Hygiene
- **Status**: Complete
- **What was implemented**:
  - Minimal FastAPI application setup with health check endpoint
  - Dependency configuration in `requirements.txt`
  - Minimal `.env.example` and root `.gitignore`
- **Important files**:
  - `backend/app/main.py`
  - `backend/requirements.txt`
  - `backend/.env.example`
  - `.gitignore`
- **Verification**:
  - `GET /api/health` returned HTTP 200 `{"status": "ok"}`
  - OpenAPI docs loaded at `/docs`
- **Commit**: `feat: initialize LeadDesk backend`

## Phase 2 — MongoDB Atlas Connection
- **Status**: Complete
- **What was implemented**:
  - Direct PyMongo connection exposing `client` and `db`
  - Connection configured to use the `leaddesk` database
- **Important files**:
  - `backend/app/database/mongodb.py`
  - `backend/app/main.py`
- **Verification**:
  - Application imports and health endpoint verified
  - Live Atlas ping skipped (local URI not configured in `.env`)
- **Key design decision**: Direct PyMongo connection without repository or service layers
- **Commit**: `feat: connect LeadDesk to MongoDB`

## Phase 3 — AI Lead Analysis
- **Status**: Complete
- **Provider**: Groq
- **Model**: `openai/gpt-oss-20b`
- **Implemented**:
  - Structured lead analysis with strict JSON Schema output
  - Application-level Pydantic validation (`LeadAnalysis`, `ScoreSignal`)
  - One validation retry
  - Prompt-injection defense using `<CUSTOMER_MESSAGE>` delimiters
- **Migration note**: Gemini Flash models repeatedly returned 503 high-demand errors, so the AI provider was switched to Groq (`openai/gpt-oss-20b`) to unblock development.
- **Important files**:
  - `backend/app/schemas/analysis.py`
  - `backend/app/services/ai.py`
- **Verification**: Complete — live Groq API call succeeded; returned strict structured JSON validated by `LeadAnalysis` Pydantic model with all 5 score signals within 0–100.
- **Commit**: `feat: switch LeadDesk AI to Groq`

## Phase 4 — Priority Scoring
- **Status**: Complete
- **What was implemented**:
  - Priority scoring calculation from 5 AI signals into weighted total (0–100) and priority label (`HOT`, `WARM`, `COLD`)
  - Compatibility normalization mapping 0–10 model ratings to 0–100 percentages
- **Scoring weights**:
  - `intentStrength`: 25%
  - `timelineUrgency`: 25%
  - `budgetFit`: 20%
  - `requirementClarity`: 15%
  - `engagementSignal`: 15%
- **Normalization**: Scales `0 <= value <= 10` by 10x, preserves `10 < value <= 100`, raises `ValueError` otherwise
- **Files changed**:
  - `backend/app/services/scoring.py`
- **Verification**: Manually verified edge cases (0–10 scale, 0–100 scale, zero minimum, max 100, and out-of-bounds error handling)
- **Commit**: `feat: build LeadDesk backend core` (`adc1f0b`)

## Phase 5 — Lead Persistence and Core API
- **Status**: Complete
- **What was implemented**:
  - Core lead management endpoints (`POST /api/leads`, `GET /api/leads`, `GET /api/leads/{id}`, `POST /api/leads/{id}/analyze`)
  - MongoDB persistence storing complete leads with generated UUIDs and UTC timestamps
  - Full AI analysis and priority score computation upon lead creation before saving
  - Stored analysis retrieval on `GET /api/leads/{id}` without re-invoking AI
  - Explicit re-analysis endpoint (`POST /api/leads/{id}/analyze`) updating stored lead record
- **Important files**:
  - `backend/app/schemas/lead.py`
  - `backend/app/routes/leads.py`
  - `backend/app/main.py`
- **Verification**: Verified health check, lead creation with Groq AI analysis, MongoDB ranking by priorityScore, stored retrieval, re-analysis, and 404 handling
- **Commit**: `feat: build LeadDesk backend core` (`adc1f0b`)

## Phase 6 — Repository Setup & Backend Deployment
- **Status**: Complete
- **What was implemented**:
  - GitHub repository connection (`https://github.com/aditya-1739/LeadDesk`)
  - Pushed core backend with zero credentials committed
  - Render deployment configured at `https://leaddesk-ageb.onrender.com`
- **Verification**:
  - `GET https://leaddesk-ageb.onrender.com/api/health` returned HTTP 200 `{"status": "ok"}`
  - Repository branch `main` synchronized
- **Commit**: `feat: build LeadDesk backend core` (`adc1f0b`)

## Phase 7 — Real Lead Seed Data
- **Status**: Complete
- **What was implemented**:
  - Standalone seeding script (`backend/seed_leads.py`) using Python standard library (`urllib.request`, `json`)
  - Configured 5 realistic lead profiles covering HOT, WARM, and COLD purchase intent
  - Routes requests through the production API (`POST /api/leads`) to exercise the real Groq AI analysis and scoring flow
- **Important files**:
  - `backend/seed_leads.py`
- **Verification**: Script structure, payloads, and API endpoint integration verified

## Phase 8 — Frontend Shell
- **Status**: Complete
- **What was implemented**:
  - React, Vite, and TypeScript frontend initialized in `frontend/`
  - Tailwind CSS v4 configured with `@tailwindcss/vite`
  - Application shell (`AppShell`, `Sidebar`, `Header`) and `Dashboard` placeholder
  - Responsive layout: vertical sidebar on desktop (md+) and clean horizontal top navigation on mobile (<md) without JavaScript state
  - Disabled `+ New Lead` action button and page title in header
  - Established `VITE_API_BASE_URL` in `frontend/.env.example`
  - All default Vite demo files, SVGs, and boilerplates removed
- **Important files**:
  - `frontend/src/components/layout/AppShell.tsx`
  - `frontend/src/components/layout/Sidebar.tsx`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/App.tsx`
  - `frontend/src/index.css`
  - `frontend/vite.config.ts`
  - `frontend/.env.example`
- **Verification**: Local Vite server runs cleanly at `http://localhost:5173/`, zero TypeScript errors, successful production build, and verified responsive layout

## Phase 9 — Lead Intake Form + Real Create API
- **Status**: Complete
- **What was implemented**:
  - Functional `+ New Lead` button in Header toggling between Dashboard workspace and intake form
  - Lead intake form with 6 required fields (`name`, `location`, `propertyRequirement`, `budget`, `buyingTimeline`, `customerMessage`)
  - Client-side required-field validation trimming inputs before dispatch
  - Minimal API service (`frontend/src/services/api.ts`) using native browser `fetch`
  - Minimal TypeScript definitions (`frontend/src/types/lead.ts`) matching backend schema
  - Comprehensive UI states: loading (`"Analyzing lead..."` with disabled submit to prevent double-submission), success confirmation (showing lead name, priority label, and score with return/create-another actions), and error handling preserving entered inputs
  - Responsive Tailwind layout maintaining accessibility, form labels, and focus states
- **Important files**:
  - `frontend/src/components/leads/LeadForm.tsx`
  - `frontend/src/services/api.ts`
  - `frontend/src/types/lead.ts`
  - `frontend/src/App.tsx`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/components/layout/AppShell.tsx`
- **Verification**:
  - `npx tsc --noEmit` passed with 0 errors
  - Production build (`npm run build`) succeeded in 1.30s
  - Root cause diagnosed and resolved: Fixed browser-to-Render API access ("Failed to fetch") by configuring FastAPI `CORSMiddleware` in `backend/app/main.py` explicitly for `http://localhost:5173`
  - Real API integration verified with `POST https://leaddesk-ageb.onrender.com/api/leads`, returning HTTP 200 with CORS headers (`access-control-allow-origin: http://localhost:5173`), running Groq AI analysis, generating priority scores, and persisting into MongoDB Atlas

## Phase 10 — Real Lead List
- **Status**: Complete
- **What was implemented**:
  - `GET /api/leads` integration in `frontend/src/services/api.ts` using native browser `fetch`
  - Minimal `LeadListItem` TypeScript interface in `frontend/src/types/lead.ts`
  - Real prioritized lead list UI in `frontend/src/components/leads/LeadList.tsx` rendering lead cards with clear visual hierarchy (Name, Location, Property requirement, Budget, Buying timeline, and backend priority label & score)
  - Color-coded priority badges for `HOT`, `WARM`, and `COLD` without recalculating backend-owned scores
  - Interactive lead card selection (`selectedLeadId`) with visual ring indicator without initiating extra network or AI calls
  - Complete state coverage in `frontend/src/pages/Dashboard.tsx`: loading (`"Loading leads..."`), error (`"Unable to load leads. Please try again."`), empty state (`"No leads yet."`), and lead list presentation
  - Preserved seamless transition with Phase 9 New Lead intake form
- **Files changed**:
  - `frontend/src/types/lead.ts`
  - `frontend/src/services/api.ts`
  - `frontend/src/components/leads/LeadList.tsx`
  - `frontend/src/pages/Dashboard.tsx`
- **Verification performed**:
  - `npx tsc --noEmit` passed with 0 errors
  - Production build (`npm run build`) succeeded in 1.91s
  - Verified live backend query returning 10 leads sorted by `priorityScore` descending from MongoDB Atlas
  - UI state transitions and card selection verified by inspection
- **Important decisions**:
  - Preserved backend ordering (already sorted by `priorityScore` descending); avoided any frontend re-sorting or score recalculation
  - Created lightweight `LeadList.tsx` component to keep `Dashboard.tsx` clean and junior-developer friendly
- **Commit message recommendation**: `feat: implement real lead list and priority display (Phase 10)`

## Phase 11 — Two-Role Workspace
- **Status**: Complete
- **What was implemented**:
  - Two-role workspace switcher (`Buyer` vs. `Salesperson`) seamlessly embedded in the Header
  - Default role set to `salesperson` to preserve the complete Phase 10 lead prioritization and intake workflow
  - Role-driven navigation adaptation: `Sidebar` dynamically reflects role-specific navigation ("Leads" and "Due Today" for Salesperson; "My Inquiry" for Buyer)
  - Role-specific header action: `+ New Lead` button only displays for Salesperson role
  - Minimal `BuyerWorkspace` placeholder component with inquiry description and disabled action button reserved for Phase 12
  - Zero-reload, zero-router local React state switching (`useState<"buyer" | "salesperson">("salesperson")`)
- **Files changed**:
  - `frontend/src/App.tsx`
  - `frontend/src/components/layout/AppShell.tsx`
  - `frontend/src/components/layout/Header.tsx`
  - `frontend/src/components/layout/Sidebar.tsx`
  - `frontend/src/components/buyer/BuyerWorkspace.tsx`
- **Verification performed**:
  - `npx tsc --noEmit` passed with 0 errors
  - Production build (`npm run build`) succeeded in 1.78s
  - Role switching, Buyer workspace placeholder, and Salesperson workspace preservation verified by inspection
  - Zero backend modifications and zero new packages verified
- **Important product decision**:
  - Maintained single-system architecture: Buyer and Salesperson are two views of the same application, sharing layout and lead lifecycle
  - Avoided authentication, URL routing, or global state libraries; simple React state passed down through `AppShell`
- **Commit message recommendation**: `feat: introduce two-role workspace switcher (Phase 11)`

## Phase 12 — Buyer Intake + Temporary Demo Identity
- **Status**: Complete
- **What was implemented**:
  - Temporary browser-scoped demo identity generating and storing `buyerId` via `localStorage` and `crypto.randomUUID()` without exposing it to the UI
  - Reused existing `LeadForm.tsx` component for buyer property inquiries with buyer-specific title, subtitle, submit button, and confirmation view
  - Extended `POST /api/leads` to accept optional `buyerId` and set initial lifecycle `status: "SUBMITTED"` alongside existing Groq AI analysis and priority scoring
  - Created `GET /api/leads/mine?buyerId=<buyerId>` querying MongoDB exclusively for the requesting buyer's inquiries (returning `BuyerLeadItem` with `status`, omitting priority scores and AI analysis)
  - Real Buyer workspace in `frontend/src/components/buyer/BuyerWorkspace.tsx` displaying buyer inquiry cards with status, loading/error/empty states, and inquiry submission
  - Preserved salesperson dashboard untouched; continuing to return all leads sorted by priorityScore descending
- **Backend files**:
  - `backend/app/schemas/lead.py`
  - `backend/app/routes/leads.py`
- **Frontend files**:
  - `frontend/src/types/lead.ts`
  - `frontend/src/services/api.ts`
  - `frontend/src/components/leads/LeadForm.tsx`
  - `frontend/src/components/buyer/BuyerWorkspace.tsx`
- **Buyer ownership design**:
  - `buyerId` is embedded directly into the lead document in MongoDB
  - Buyer endpoint queries exclusively by `buyerId`, ensuring buyer isolation at the API level
- **Temporary identity design**:
  - Browser-scoped demo identity stored in `localStorage`
  - Acts as an ownership identifier for demonstration purposes, NOT proof of authentication
  - Authentication intentionally deferred to the final Supabase phase
- **Initial status design**:
  - All new leads initialize with `status: "SUBMITTED"` to establish the lead lifecycle data model
- **Supabase future migration decision**:
  - When Supabase Auth is integrated in the final phase, `buyerId` will seamlessly map to the authenticated Supabase `user.id` without requiring database schema refactoring
- **Verification performed**:
  - `npx tsc --noEmit` passed with 0 errors
  - Production build (`npm run build`) succeeded in 1.75s
  - Backend end-to-end integration verified: `POST /api/leads` creates lead with `status: "SUBMITTED"` and `buyerId`, `GET /api/leads/mine` returns only that buyer's inquiry without priority score/AI analysis, and different `buyerId` returns 0 inquiries (buyer isolation verified)
  - Salesperson `GET /api/leads` confirmed to return all leads with priority scores and labels
- **Phase 12 Correction**:
  - **Root Cause**: `GET /api/leads/mine?buyerId=...` previously returned 404 because the Render production deployment had not yet received the new route from commit `1b9a9e4` and fell back to `GET /{lead_id}` (`lead_id="mine"`).
  - **Fix Applied**: Added and deployed `GET /api/leads/mine` placed before `GET /{lead_id}`, returning `list[BuyerLeadItem]`.
  - **UX & Action Relocation**: Removed `+ New Lead` from Salesperson header. Added `+ Add Inquiry` exclusively to Buyer header and Buyer dashboard.
  - **Buyer Dashboard**: Implemented real dashboard structure displaying property inquiries with requirement, location, budget, timeline, and `SUBMITTED` status without priority or AI scores.
- **Commit message recommendation**: `feat: implement buyer intake and demo identity (Phase 12)`