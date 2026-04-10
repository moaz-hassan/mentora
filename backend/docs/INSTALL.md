# INSTALL & Quick Start — Mentora Backend

This guide shows how to run the backend locally for development and basic testing. It assumes you are working from the `backend/` folder.

## Prerequisites
- Node.js (recommended v18+ LTS)
- npm (comes with Node)
- MySQL server (or Docker)
- Redis server (or Docker)
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

Edit `.env` and set values for DB, Redis, JWT, mail, Cloudinary, Supabase, and AI keys.

File reference: `backend/.env.example` contains all variables you need.

## 2) Install dependencies

```bash
npm install
```

## 3) Database

Create the MySQL database referenced by `DB_NAME` in your `.env`.

If you have MySQL client access:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mentora;"
```

Quick local MySQL using Docker:

```bash
docker run --name mentora-mysql -e MYSQL_ROOT_PASSWORD=0000 -e MYSQL_DATABASE=mentora -p 3306:3306 -d mysql:8.0
```

### Migrations / schema
This repo uses Sequelize. Prefer running Sequelize migrations in production. If migration files are not present, for quick local testing you can use Sequelize `sync()` (not recommended for production). Implement migrations with `sequelize-cli` or `umzug` before publishing.

Example (when migrations are available):

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

If you don't have migrations and want a quick local setup for development, you can temporarily enable `sequelize.sync()` in `src/config/db.js` (development only).

## 4) Start the API

Start the server (development):

```bash
# using node
node server.js

# or using package script (uses nodemon if available)
npm run start
```

The app exposes a root health endpoint; verify with:

```bash
curl http://localhost:3000/
```

You should see a JSON response like: `{ "success": true, "message": "LMS API is running" }`.

## 5) Workers & Cron

Some features run as background workers and cron jobs:
- Queues/workers: `src/workers/*` (notification, logging, etc.)
- Cron jobs are initialized when the server starts (`initCronJobs()` in `src/app.js`)

Start the worker process in a separate terminal:

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

## 8) Payment provider
The code records payments but does not include a fully wired server-side gateway for all providers. To accept live payments, wire up Stripe/PayPal webhooks and credentials and test end-to-end.