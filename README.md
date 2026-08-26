# CareerTwin

CareerTwin is a production-oriented career exploration platform built from the supplied Figma UI. The approved Figma frames remain the pixel-accurate visual layer; real form controls, navigation, personalized data and accessible dialogs are placed on top without redesigning the UI.

## Architecture

```text
Next.js 16 App Router
  ├─ Figma-exact interactive frontend
  ├─ Route Handlers (/api/*)
  ├─ HTTP-only JWT session authentication
  ├─ Career recommendation + simulation engines
  ├─ Gemini multi-model adapter + deterministic fallback
  └─ Prisma ORM
       └─ PostgreSQL
```

## Implemented features

- Email/password registration, login, logout, route protection, password change and account deletion
- Four-step onboarding with persisted personal information, interests, skills and goals
- Personalized career ranking with score breakdown
- Career search, category filtering, details and saved careers
- Career Map and progress tracking by career and stage
- Answer-based job simulation with feedback and history
- Career report, snapshots and browser Print/Save PDF flow
- Three-career comparison using live database values
- Roadmap progress and AI-generated next-step advice
- Knowledge library with search, article details and reading history
- Profile, privacy, notification and appearance preferences
- CareerTwin AI history, rate limiting, Gemini model fallback and an offline deterministic fallback
- Cloud Run Docker/Cloud Build and Vercel configuration
- Desktop pixel matching and readable horizontal-canvas behavior on narrow mobile screens

## Requirements

- Node.js 24+
- PostgreSQL 15+ (PostgreSQL 17 is used in `docker-compose.yml`)
- A Gemini API key for external AI. The site remains functional without one.

## Environment

Copy `.env.example` to `.env` and configure:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | At least 32 random characters |
| `GEMINI_API_KEY` | Production AI | Gemini API key |
| `GEMINI_MODEL` | No | Primary model; default `gemini-3.6-flash` |
| `GEMINI_FALLBACK_MODELS` | No | Comma-separated fallback chain |
| `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` | No | OpenAI-compatible provider fallback |
| `NEXT_PUBLIC_APP_URL` | Deploy | Canonical application URL |

Never commit a real `.env` file.

## Run locally

With Docker:

```bash
docker compose up -d db
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

Without Docker, create a PostgreSQL database in Cloud SQL, Neon, Supabase or another provider, place its connection string in `DATABASE_URL`, then run the same migration and seed commands.

Open [http://localhost:3000](http://localhost:3000).

Demo account:

- Email: `demo@careertwin.vn`
- Password: `CareerTwin123!`

## Quality checks

```bash
npm run typecheck
npm test
npm run build
npm audit
```

To smoke-test every configured Gemini model:

```bash
npm run ai:test
```

The command does not expose the API key. It skips external calls when `GEMINI_API_KEY` is empty.

## PostgreSQL migrations

- Development migration: `npm run db:migrate`
- Production deployment: `npm run db:deploy`
- Seed reference data: `npm run db:seed`

The initial PostgreSQL migration is in `prisma/migrations/20260826000000_init`.

## Deploy to Vercel

1. Create a managed PostgreSQL database.
2. Import the repository into Vercel.
3. Add `DATABASE_URL`, `SESSION_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL` and `NEXT_PUBLIC_APP_URL`.
4. Deploy. `vercel.json` uses `npm run vercel-build`, which generates Prisma Client, applies migrations and builds Next.js.
5. Run `npm run db:seed` once against the production database.

## Deploy to Google Cloud Run

1. Create an Artifact Registry repository named `careertwin`.
2. Store values in Secret Manager using these secret names:
   - `careertwin-database-url`
   - `careertwin-session-secret`
   - `careertwin-gemini-api-key`
3. Grant the Cloud Run runtime service account Secret Manager access.
4. Deploy:

```bash
gcloud builds submit --config cloudbuild.yaml
```

The container applies pending Prisma migrations before starting the standalone Next.js server on port 8080. Seed the production database once after the first deployment.

## Authentication note

The production authentication flow included in this repository is email/password. The Google button is retained to preserve the approved Figma UI and currently displays configuration guidance; enabling Google OAuth requires provider credentials and a verified callback domain.
