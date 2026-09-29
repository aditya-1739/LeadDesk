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
- **Commit**: Pending (Do not commit)

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
- **Commit**: Pending (Do not commit)
