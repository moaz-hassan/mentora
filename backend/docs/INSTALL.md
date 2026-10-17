# INSTALL & Quick Start — Mentora Backend

This guide shows how to run the backend locally for development and basic testing. It assumes you are working from the `backend/` folder.

## Prerequisites
- Node.js (recommended v18+ LTS)
- npm (comes with Node)
- MongoDB 6+ (or Docker)
- Redis 7+ (or Docker)
- (Optional) Docker & Docker Compose for local infra

## 1) Clone and prepare

```bash
git clone <repo-url>
cd backend
```

Copy the example env file and fill real values:

```bash
# Linux / macOS
cp .env.example .env
# Windows PowerShell
copy .env.example .env
```

File reference: `backend/.env.example` documents every variable. At minimum set:
- `MONGODB_URI` — MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT` — caching and Bull queues
- `JWT_SECRET` — use a strong secret (no insecure fallback in production)
- `GMAIL_USER`, `GMAIL_APP_PASSWORD` — transactional email
- `CLIENT_URL`, `FRONTEND_URL` — email links and certificate verification
- `QUIZ_PASS_THRESHOLD` — quiz pass percentage

## 2) Install dependencies

```bash
npm install
```

## 3) Database & Redis (MongoDB — no SQL)

This backend is 100% MongoDB/Mongoose. There is no migration step today: Mongoose creates collections and indexes on first use.

### Option A — Docker Compose (recommended)

`docker-compose.yml` brings up MongoDB 6, Redis 7, and a mongo-express UI:

```bash
# from backend/
npm run docker:up      # docker-compose up -d
```

| Service | URL / Port |
| --- | --- |
| MongoDB | `mongodb://localhost:27017/mentora` |
| Redis | `localhost:6379` |
| mongo-express (MongoDB UI) | http://localhost:8081 |

Stop everything with:

```bash
npm run docker:down
```

### Option B — Local services

Install and run MongoDB and Redis locally, then point `MONGODB_URI`, `REDIS_HOST`, and `REDIS_PORT` at them.

### Schema / migrations

Schemas live in `src/models/*` (pure Mongoose). Scripted migrations are tracked as INF-08 in `docs/BACKEND_ENHANCEMENT_PLAN.md`; until then, coordinate schema changes through code review.

## 4) Start the API

Start the server (development):

```bash
# using node
node server.js

# or using package script (uses nodemon if available)
npm run start
```

The server connects to MongoDB first, then exposes the root health endpoint:

```bash
curl http://localhost:3000/
```

You should see a JSON response like: `{ "success": true, "message": "LMS API is running" }`.

## 5) Workers & Cron

- Cron jobs are initialized when the server starts (`initCronJobs()` in `src/app.js`).
- Background workers (logging, notifications) run in a separate process and require Redis:

```bash
node src/workers/index.js
```

For production, run API + workers as separate processes (PM2/systemd/container orchestrator):

```bash
# example with PM2
npm i -g pm2
pm2 start server.js --name mentora-api
pm2 start src/workers/index.js --name mentora-workers
```

## 6) Mailer
The default mailer in `src/config/mailer.js` uses Gmail SMTP. For production use a proper transactional email provider or Resend. Ensure `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in `.env` or configure another provider.

## 7) Optional: Supabase & Cloudinary
If you want certificates and materials stored in Supabase, set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` and create buckets defined in `.env`.

For Cloudinary direct uploads, provide Cloudinary keys and use the signed endpoints (routes under `src/controllers/media`).

## 8) Payments
Paid courses require `STRIPE_SECRET` and `STRIPE_WEBHOOK_SECRET`. Stripe is integrated (PaymentIntents + webhook); production hardening (webhook idempotency, server-side amount validation) is tracked as PAY-02/PAY-03 in `docs/BACKEND_ENHANCEMENT_PLAN.md`. PayPal credentials exist in `.env.example` but there is no PayPal integration yet.

## 9) Verification commands

```bash
npm run check:nosql        # fails if any SQL/Sequelize artifact reappears in src/
npm run smoke:imports      # imports every module under src/ (import-time crash detector)
npm run verify:migration   # settings + socket + logging worker against an in-memory MongoDB
```

`verify:migration` boots its own in-memory MongoDB and needs no local services. The Jest harness (`npm test`) is planned under FND-02 in `docs/BACKEND_ENHANCEMENT_PLAN.md`.
