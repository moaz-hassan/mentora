# Mentora Backend — Enhancement & Remediation Plan

> **What this is:** the complete plan to fix every weakness found in the full backend analysis (security, correctness, money flows, data integrity, infrastructure, architecture, docs).
> **How to use it:** this is a living document. Every task has an ID, priority, size, and "done when" criterion. It is the contract for the enhancement program and the checklist we negotiate against, module by module.
> **Core principle: NO REWRITE.** The domain logic largely exists. We align code to schemas, close security holes, make failures loud, and lock everything with tests.

- **Created:** 2026-10-17
- **Status:** ⏳ Awaiting owner decisions (Section 8) — implementation has not started.
- **Owner:** project owner
- **Analyst/implementer assist:** AI agent

---

## 1. Definition of Done (global)

The enhancement program is complete when:

1. **No open P0/P1 security findings.** Each closed finding has a regression test that fails without the fix.
2. **Payments & enrollment are trustworthy end-to-end:** server-side pricing, cryptographically verified webhooks, idempotent transactional fulfillment, paywall actually enforced.
3. **Zero phantom fields.** Running the test suite with `mongoose.set("strict", "throw")` produces no undeclared-field writes; every field read/written by code exists on a schema (or the code is removed).
4. **No silent failures.** No broken import paths, no swallowed errors, no dead wiring. Queues and workers are actually running.
5. **Transactions + idempotency** on every multi-document flow (payment, coupon use, cascades, gifts).
6. **4-tier architecture enforced mechanically** (ESLint boundaries); services no longer import models or controllers directly.
7. **Observability in place:** structured logs, request IDs, error tracker (Sentry), health/readiness endpoints.
8. **Regression suite in CI:** every protected route family has authorization-negative tests; critical modules (auth, payments, enrollment) have full happy/negative coverage.
9. **Docs match the code:** API documentation, Postman collection, install/system design docs updated (no Sequelize/MySQL leftovers).

---

## 2. Priorities & sizes

| Tag | Meaning |
|---|---|
| **P0** | Security / money / data-loss blocking. Must be done before anything else ships. |
| **P1** | High: broken features, integrity, operability. |
| **P2** | Quality, performance, cleanup, documentation. |

| Size | Estimate (one experienced dev) |
|---|---|
| **S** | ≤ 1 day |
| **M** | 2–5 days |
| **L** | 1–3 weeks (parallelizable) |

---

## 3. Phase overview (execution order)

| Phase | Name | Contains | Exit criteria |
|---|---|---|---|
| **0** | Foundations & Safety Net + NoSQL completion | FND-*, **MIG-*** (audit: `NOSQL_MIGRATION_AUDIT.md`), INF-09, INF-01 | App boots fail-fast on bad config; test harness exists; lint enforces boundaries; queues import cleanly; **zero Sequelize API usage remains** and the `check:nosql` CI guard is green |
| **1** | Money (Payments & Enrollment) | PAY-01…04, PAY-06, DAT-01, SEC-13 | Paywall enforced; webhook verified; fulfillment idempotent + transactional; no admin self-registration |
| **2** | Critical Security | SEC-01…04, SEC-06, SEC-07, SEC-12 | Sockets authenticated; rate limits on; JWT lifecycle fixed; audit trail writes; headers/secret hygiene |
| **3** | Schema Alignment ("unbreak pass") | SCH-01…10, SEC-05, SEC-08 | Strict-throw clean; chapter workflow, notifications scheduling, admin logs, settings all functional |
| **4** | Integrity & Bug Sweep | DAT-02…07, PAY-05, PAY-08, INF-02…06 | Known bugs fixed; emails via queue; Redis/cron hardened |
| **5** | Observability & Ops | INF-04, INF-07, INF-08, INF-10 | Logs/metrics/health/Sentry; migrations + seed tooling; socket adapter decision implemented |
| **6** | Architecture Convergence | ARC-01…08 | Repositories own all queries; dead code removed; duplicates consolidated; envelope + docs consistent |
| **7** | Final Validation | TST-01…04 | Full regression + security suite green; load smoke passed; docs frozen |

Phase 1 must follow Phase 0. Phases 2–3 can partially interleave. Phases 4–6 are independent enough to parallelize with a second developer.

---

## 4. Workstreams

### WS0 — Foundations & Safety Net (FND)

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| FND-01 | P0 | S | **Config module `src/config/env.js`** using zod: validate every env var at boot, fail fast with a readable list. Remove the JWT fallback default. Add `FRONTEND_URL`, `STRIPE_*` to `.env.example`. | App refuses to start with missing/invalid env; `.env.example` documents everything used by code |
| FND-02 | P0 | M | **Test harness**: Jest (ESM) + `mongodb-memory-server` + supertest + factories + JWT helper. First tests: auth register/login, one protected route, one admin route. | `npm test` runs a green suite locally and in CI |
| FND-03 | P0 | M | **Boundary enforcement + strict mode**: ESLint `no-restricted-imports` (services ↛ models/mongoose/controllers; controllers ↛ mongoose). `mongoose.set("strict","throw")` in dev/test. | Lint fails on layering violation; strict-throw test run surfaces all phantom writes (baseline report produced) |
| FND-04 | P1 | M | **Structured logging**: pino + request-id middleware; replace all `console.*`; redact secrets (password/token/secret/apiKey). | No `console.log` in `src/`; every log line carries request id |
| FND-05 | P1 | S | **Error-handling polish**: keep `{success,message,code}` shape, ensure no stack leaks in prod, consistent 404, no double-response paths. | Error review checklist passed |
| FND-06 | P1 | S | **CI pipeline**: GitHub Actions (install → lint → test); optional pre-commit. | PRs blocked on red CI |

### WS0.5 — SQL→NoSQL Migration Completion (MIG)

> Full evidence, line numbers, and the proof matrix live in [`NOSQL_MIGRATION_AUDIT.md`](./NOSQL_MIGRATION_AUDIT.md). **✅ Completed Oct 17, 2026** — all 13 Sequelize call sites fixed and verified; see the Execution Log in the audit doc.

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| ✅ MIG-01 | **P0** | M | **Finish settings migration**: rewrite `settings.service.js` to Mongoose via a purpose-built `settings.repository.js`; decide/add schema fields (`category`, `data_type`, `is_public`) or simplify the code to `key/value/description`; remove `console.log`. (Cross-ref SCH-05) | Admin settings endpoints (all/by-category/by-key/update/bulk/public) work against MongoDB (tests) |
| ✅ MIG-02 | **P0** | M | **Socket authenticate handler**: replace `ChatParticipant.findAll({ where, include })` with a Mongoose repository/query; remove Sequelize options; keep room auto-join. (Cross-ref SEC-01) | Socket `authenticate` joins the user's rooms without errors (test) |
| ✅ MIG-03 | P1 | M | **Logging worker flush**: `bulkCreate(..., { ignoreDuplicates: true })` → `insertMany(docs, { ordered: false })` with duplicate-key handling; align log payload field names with the schemas. (Cross-ref SCH-04, INF-02) | Batch flush persists all log types; duplicates don't crash (test) |
| ✅ MIG-04 | P1 | S | **Mongoose 9 compatibility sweep**: `result.nModified` → `modifiedCount` in `coupon.service.js`; fix the no-op `select("+password")`; audit for other removed/deprecated APIs. (Cross-ref PAY-06, SEC-05) | Coupon deactivation returns the real count; grep sweep clean |
| ✅ MIG-05 | P1 | S | **CI NoSQL guard**: `npm run check:nosql` failing the build on SQL artifacts in `src/` (`sequelize`, `DataTypes`, `Op.`, `findByPk`, `bulkCreate`, `mysql`, raw-SQL keywords) with a small allowlist for legitimate names; plus `npm ls sequelize mysql2 pg` check. | CI fails if any SQL artifact is reintroduced |
| ✅ MIG-06 | P1 | M | **Docs de-Sequelize**: rewrite `INSTALL.md` (MongoDB + actual compose services + real npm scripts), fix `BACKEND_FEATURES.md` env/SQL sections, fix `BACKEND_ARCHITECTURE.md` wording; remove references to the non-existent `npm run migrate/seed` until INF-08 provides them. | No SQL/Sequelize instructions remain anywhere outside the migration-notes contexts |
| ✅ MIG-07 | P2 | S | **Naming convention decision**: repository methods named `findAll`/`bulkCreateMaterials` are Mongoose implementations (verified) — either keep with a documented convention or rename to `list`/`findMany`/`insertMaterials`. | Decision recorded (rename optional) |
| ✅ MIG-08 | P2 | S | **Env documentation**: document `QUIZ_PASS_THRESHOLD` and `FRONTEND_URL` in `.env.example`; remove the unused `UPLOAD_PRESET` from `.env` (referenced nowhere) or wire it deliberately. (Cross-ref FND-01) | `.env.example` covers every env var the code reads |
| ✅ MIG-09 | **P0** | S | **Runtime verification** (after MIG-01…03): import-all-modules smoke test + settings CRUD + socket authenticate + worker flush against `mongodb-memory-server`. Requires FND-02 harness. | The three previously-broken paths verified working at runtime |

### WS1 — Security (SEC)

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| SEC-01 | **P0** | L | **Socket.io authentication**: `io.use()` JWT handshake middleware; server derives identity (never trust client `userId`); join rooms from DB membership; CORS allowlist; per-event rate limits; socket handler is already Mongoose-native (✅ MIG-02); add tests (impersonation attempt fails). | A client without a valid JWT cannot authenticate; a user cannot join rooms they don't belong to |
| SEC-02 | **P0** | M | **Rate limiting**: re-enable/tune global limiter; add AI limiter (per-user + daily quota), enrollment limiter, chat-send limiter, password-change limiter; set `trust proxy`. | Abuse tests: repeated AI calls / logins / messages get 429 |
| SEC-03 | **P0** | S | **Stop email spam**: remove verification-email send from `authenticate`; keep register/resend endpoints (rate-limited). | Unverified user hammering `/api/auth/me` sends 0 emails |
| SEC-04 | P1 | M | **JWT lifecycle**: single secret source; `token_version` on User; invalidate on password change / deactivation / role change; decide refresh-token model (see D9). | Old token stops working after password change (test) |
| SEC-05 | P1 | S | **Password handling**: `select:false` on password; audit every user-serialization path. | No endpoint can leak `password` (grep + tests) |
| SEC-06 | P1 | M | **Audit trail fix**: replace `req.path.startsWith('/api/admin')` guard (use `req.originalUrl`/`baseUrl`); record action, resource, before/after, ip, user-agent; test an admin mutation appears in logs. | Audit log row written for a sample admin action |
| SEC-07 | P1 | S | **Helmet + headers + CORS/body limits**: helmet, JSON body size cap, CORS allowlist from env (REST + socket). | Security headers present; oversized bodies rejected |
| SEC-08 | P1 | S | **Leak & injection sweep**: remove quiz-answer `console.log`; escape all user input used in `$regex` (central helper); restrict public instructor stats payload (or require auth — see D5-adjacent); remove sensitive fields from error messages. | Grep-clean + tests for regex-escaping helper |
| SEC-09 | P2 | M | **Upload hardening**: keep MIME/extension checks; add magic-byte sniffing (`file-type`); sanitize filenames; configurable extension lists. | Spoofed `.pdf` (exe bytes) rejected |
| SEC-10 | P1 | M | **Account protection**: login throttling/lockout per email+IP; security email on password change. | Brute-force test gets throttled |
| SEC-11 | P1 | M | **AI hardening**: input size caps, per-user quotas, request timeout, token/cost logging; keep forbidden-action validation; injection test cases. | Quota + timeout enforced; injection patterns blocked in tests |
| SEC-12 | P1 | S | **Secret hygiene**: verify `.env` never committed; run gitleaks on history; rotate any exposed credentials (Gmail app password, Stripe, Cloudinary, Supabase, JWT). | Clean scan report; rotated keys recorded in password manager |
| SEC-13 | **P0** | S | **Public registration role escalation**: verify & fix `registerValidator`/`registerUser` so public registration cannot create `admin` (and decide instructor policy — see D1). | Attempt to register `role:"admin"` is rejected (test) |

### WS2 — Payments & Enrollment (PAY)

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| PAY-01 | **P0** | M | **Server-side pricing**: compute Stripe amount from course price + discount − validated coupon server-side; ignore client `amount` entirely; reject tampering. | Client-supplied amount has no effect (test) |
| PAY-02 | **P0** | M | **Webhook fix**: make raw body available (verify-callback on `express.json` or mount webhook before it); enforce signature verification; return 400 only on genuinely bad signatures. | Stripe CLI-simulated signed event parses correctly; unsigned payload rejected (test) |
| PAY-03 | **P0** | L | **Fulfillment: transaction + idempotency**: on `payment_intent.succeeded` → single transaction: mark payment completed, create enrollment (if absent), notification; deduplicate events (unique `stripe_event_id` / processed-events collection); `payment_failed` → status only. | Replaying the same event twice creates exactly one enrollment (test) |
| PAY-04 | **P0** | M | **Paywall gating**: `createEnrollment` rejects paid courses without a completed payment (free/preview/gift paths excluded); re-check inside transaction. | `POST /api/enrollments` on a paid course without payment → 402/403 (test) |
| PAY-05 | P1 | M | **Payment model extensions**: `stripe_payment_intent_id`, `stripe_event_id`, `failure_reason`, refund fields (if D3 says now); data migration for existing rows. | Schema + migration script + tests |
| PAY-06 | P1 | M | **Coupon integrity**: atomic `used_count` increment with payment (conditional `findOneAndUpdate`); fix `nModified` → `modifiedCount`; per-user redemption limit (D6); validate max_count under race. | Concurrent usage test never exceeds max_count |
| PAY-07 | P2 | M | **Refunds/disputes** (scope per D3): status transitions, admin visibility, financial reporting effects. | Decision implemented + tested |
| PAY-08 | P1 | M | **Financial reporting alignment**: fix `student_id` vs `user_id`; exclude refunded correctly; payout/commission constants configurable (D5-adjacent); exports consistent. | Financial dashboards return non-zero correct data in seeded test |

### WS3 — Schema Alignment ("unbreak pass")

Rule for every item: **either add the field to the schema, or delete the code using it.** No third option.

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| SCH-01 | P1 | M | **Chapter review workflow**: add review fields (status/submitted_for_review_at/reviewed_at/reviewed_by/rejection_reason) OR remove the workflow (D4). | Verify flow works end-to-end or is removed cleanly |
| SCH-02 | P1 | M | **Course publish flag**: single source of truth for published state (D5); migrate references; `getCoursePreview`/`getPublicCurriculum` authorize correctly. | Preview/curriculum tests pass for approved/draft/rejected |
| SCH-03 | P1 | L | **Notifications scheduling**: dedicated `ScheduledNotification` model (D12) or extended NotificationLog; fix `scheduleNotification` duplicate-key bug; metrics queries match schema. | Scheduled notification fires exactly once (test with fake timers) |
| SCH-04 | P1 | M | **Admin log models**: align field names across schemas ↔ `logs.service.js` (action_type/resource_*/before/after/user_agent; error_type/error_message/stack_trace/severity; enrollment_source/payment_status). | Admin log screens return real rows; writer persists all fields |
| SCH-05 | P1 | M | **Settings module**: rewrite `settings.service.js` with Mongoose (via repository); decide `category`/`data_type`/`is_public` fields. | Admin settings CRUD works (test) |
| SCH-06 | P1 | M | **Chat fields**: `ChatParticipant.last_read_at/role/is_active` and `ChatMessage.message_type/file_url` — add or remove per D8; unread counts become correct. | Unread count test; mark_read persists |
| SCH-07 | P1 | S | **Enrollment `gifted_by`** field + gift flow test. | Gift enrollment records gifter |
| SCH-08 | P1 | S | **Report fields**: `ai_reasoning`; fix `content_type` casing mismatch; verify `priority` filtering. | Report detail returns linked content (test) |
| SCH-09 | P1 | S | **Marketing module**: delete `marketing.service.js` + unused repos (or fully implement — plan says delete; D13). | No imports remain; lint clean |
| SCH-10 | P2 | S | **Quiz schema**: validate `questions` as a proper subschema (text/type/options/correct answer) per D7. | Invalid quiz payload rejected |
| SCH-11 | P2 | S | **Unique index** `SubCategory (category_id, name)`; migration. | Duplicate creation rejected |
| SCH-12 | P2 | M | **Index audit** on hot queries: notifications(user_id,is_read,createdAt), payments(status,user_id), reports(status,priority), chat_messages(sender), courses(status,createdAt). Run `explain` on top queries. | Index plan reviewed; slow queries documented before/after |

### WS4 — Data Integrity & Logic (DAT)

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| DAT-01 | P0 | M | **Transaction helper** + apply to: payment fulfillment (PAY-03), course deletion cascade, coupon usage, gift enrollment, chapter/lesson reorder. | Multi-doc flows roll back on partial failure (tests) |
| DAT-02 | P1 | M | **One quiz submission path**: unify `enrollment.service.submitQuiz` vs `quiz.service.submitQuizResult`; single threshold source with safe default (D7); progress recalculation shared. | Both entry points produce identical results (tests) |
| DAT-03 | P1 | M | **Single profile source** (D11): embedded vs standalone decision; migration script; update sync logic in auth/user/profile services. | Profile updates visible through every endpoint (tests) |
| DAT-04 | P1 | M | **Bug sweep**: coupon `modifiedCount`; financial `user_id`; `pending_review` counts; `instructorManagement` deactivation via status; chapter repo phantom virtual; `countByCategory` phantom fields; notification duplicate key; `getCurrentUser` Profile attach; `deactivateExpired` job; remove console logs. | Each item covered by a test or a verified manual check |
| DAT-05 | P1 | M | **Enrollment invariants**: only approved courses; block self-enroll (instructor of course); position bounds; complete-lesson idempotent; progress math for quizzes. | Invariant test suite |
| DAT-06 | P2 | S | **Certificate checks**: access control on get/download; signed-URL expiry; verification endpoint anti-enumeration (opaque ids). | Tests for owner/admin/other-user access |
| DAT-07 | P2 | M | **Gift flow integrity**: recipient rules; payment semantics (D2); one email; `gifted_by`. | Gift test end-to-end |
| DAT-08 | P2 | L | **N+1 elimination** on hot paths: course search, course reviews, chat room lists/messages, logs joins, report lists — batch fetch or `$lookup`. | Query-count assertions per request in tests |

### WS5 — Infrastructure & Operations (INF)

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| INF-01 | **P0** | S | **Fix Bull wiring**: `redisQueueClient` export (or refactor `queue.js` to use `redisClient`); queues import cleanly. | `node -e "import('./src/config/queue.js')"` succeeds |
| INF-02 | P1 | M | **Workers process**: start logging+notification workers from `src/workers/index.js`; convert `bulkCreate` → `insertMany`; npm script `worker`; graceful shutdown; prod runbook (separate process). | Worker process starts, processes a test job |
| INF-03 | P1 | M | **Email via queue**: producers in email service; email worker with retry/backoff; provider decision D10 (SMTP dev / transactional prod). | Email job retried on transient failure (test) |
| INF-04 | P1 | M | **Scheduled jobs real**: move `platformAnalytics.scheduleReport` stub → real scheduled job OR remove; fix notification schedule worker interval. | No fake/stub scheduling remains |
| INF-05 | P1 | M | **Redis lifecycle**: awaited explicit connect in bootstrap; remove import-time side effects; fix chat cache import path; cache invalidation strategy (tag map); fail-open on Redis outage for reads. | App boots with Redis down (reads degrade gracefully); cache invalidation test |
| INF-06 | P1 | M | **Cron hardening**: Redis lock per job (multi-instance safe), timezone config, batch sending, move heavy work to queues, dry-run script. | Two instances → one email run (test) |
| INF-07 | P1 | M | **Observability**: Sentry init, request-id propagation, queue dashboards (bull-board, D-adjacent), `/healthz` + `/readyz` (mongo/redis), structured startup logs. | Health endpoints answer correctly; Sentry receives a test error |
| INF-08 | P1 | M | **DB operations**: connection pool config; migrations folder + npm script (backfills, index sync); dev seed script; backup/restore docs. | Fresh clone → seed → run works from README |
| INF-09 | **P0** | S | **Startup hardening**: `server.js` awaits/validates db+redis before listen; graceful shutdown closes mongoose, redis, queues, http; unhandled-rejection handler. | Killing server closes all connections cleanly |
| INF-10 | P2 | M | **Socket scale-out**: `@socket.io/redis-adapter` + sticky-session note (when scaling beyond one instance). | Two instances share rooms (staging test) |

### WS6 — Architecture & Code Quality (ARC)

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| ARC-01 | P2 | L | **Repository migration waves** (per module, during its deep-dive): auth/users, courses/chapters/lessons/quizzes, enrollment/progress, certificates, chat/notifications, instructor analytics, admin (analytics/financial/logs/settings), reports. Keep behavior identical; tests added per wave. | Lint boundary clean; services contain no Mongoose calls |
| ARC-02 | P1 | S | **Remove service→controller imports**: move `validateCloudinaryUrl` into a service/util. | No service imports from `controllers/` |
| ARC-03 | P2 | S | **Dead code deletion**: `marketing.service.js`, `logging.middleware.js`, unused repos (after ARC-01 decides), unused `api.limiter` entries decision, unmounted `instructor-stats.routes.js`, `getScopeForRole`/`sanitizeQuery` decision, unused npm deps (`@upstash/redis`, `resend` decision via D10). | Grep-clean; bundle deps pruned |
| ARC-04 | P2 | L | **Duplicate consolidation**: two instructor analytics suites → one; two admin analytics suites → one; chart/service duplication resolved (backend side). | Single implementation per capability; imports updated |
| ARC-05 | P2 | M | **Service splitting**: course.service (799 ln), admin logs (665 ln), instructor analytics (654 ln), platform analytics (528 ln) → cohesive modules + DTO mappers. | Each service < ~300 lines, single responsibility |
| ARC-06 | P1 | M | **Envelope standardization & DTOs**: standardize coupons/reports/AI/materials/chat-pagination to `{success,message,data[,count]}` (or document approved exceptions); one formatter module per domain. **Coordinate with frontend release.** | Frontend builds on the new contracts; doc lists no unapproved exceptions |
| ARC-07 | P1 | M | **Docs refresh**: regenerate `ALL_API_DOCUMENTATION.md`, Postman; strip Sequelize/MySQL from INSTALL/system design; README runbook (dev, worker, cron, env). | Docs match code; runbook validated on a clean machine |
| ARC-08 | P2 | S | **API versioning decision** (D14): document `API_PREFIX`; defer `/v1` migration or plan it. | Decision recorded in this doc |

### WS7 — Final Validation (TST)

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| TST-01 | P0 | M | **Security regression suite**: paywall bypass, webhook signature, socket impersonation, role escalation, rate limits, token revocation, regex escaping. | Suite green in CI |
| TST-02 | P1 | M | **Authz-negative matrix**: for every protected route family, test wrong-role + no-token + other-user's-resource (IDOR). | Matrix complete & green |
| TST-03 | P1 | S | **Load smoke**: catalog search + lesson stream + chat send with k6/artillery; no regressions vs baseline. | Numbers recorded |
| TST-04 | P1 | S | **Pen-test checklist run**: OWASP API Top 10 pass against staging. | Findings triaged (none P0/P1 open) |

---

## 5. Testing strategy

- **Tools:** Jest (ESM), supertest, `mongodb-memory-server`, factory helpers, JWT mint helper, fake timers for cron/scheduling, Stripe CLI fixtures for webhooks.
- **Levels:** integration tests per route family (primary), unit tests for services with mocked repositories (secondary).
- **Mandatory test types per module:**
  1. Happy path.
  2. Validation negatives.
  3. **Authorization negatives** (no token, wrong role, wrong owner).
  4. Idempotency/concurrency where money or counters are involved.
- **Gate:** CI blocks merge on red; security suite is a required check.

## 6. Data migrations & rollout safety

- Introduce `backend/src/migrations/` + `npm run migrate` (scripted, idempotent) before Phase 3 schema changes.
- Backfills needed: `Course.is_published`/status reconciliation; settings; notification-log rows (or drop if design changes); payment records (intent ids); profile consolidation.
- Risky changes (strict-throw, envelope standardization, queue migration) ship behind a **feature flag** where a rollback path is not obvious; strict-throw stays dev/test only.
- Stripe webhook changes verified with **Stripe CLI** in staging before production.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Strict-throw surfaces a flood of phantom writes | Run it at Day 1 of Phase 3 as a baseline report; fix in scheduled order (SCH list) |
| Envelope changes break the frontend | Single coordinated release; frontend task list tracked separately |
| Queue migration changes email timing | Keep inline fallback flag for dev; verify with retry tests |
| Refactor regressions (zero tests today) | FND-02 harness first; module waves gated by tests |
| Secrets may exist in git history | SEC-12 gitleaks + rotate everything touched |
| Multi-instance duplicate cron/emails | INF-06 locks before any horizontal scaling |

## 8. Decisions needed before execution (negotiation points)

| # | Decision | My recommendation |
|---|---|---|
| D1 | Public registration roles: student only, or student+instructor application flow? | student only; instructor via `become-instructor` application (admin-approved) |
| D2 | Paid enrollment flow: webhook auto-enroll, or enrollment-POST verifies payment? | **Both**: webhook fulfills; POST re-checks payment; idempotent |
| D3 | Refunds/disputes in scope now? | Later module phase; schema fields prepared now |
| D4 | Chapter-level review workflow: keep or drop (course-level review only)? | Keep only if product needs granular moderation; else drop (simpler) |
| D5 | `is_published` vs `status` single source | Real `is_published` boolean maintained by repo on status transitions (frontend contract safe) |
| D6 | Coupons: per-user limits, stacking with course discount, global coupon rules | Per-user limit yes; no stacking; one active global coupon (current rule kept) |
| D7 | Quiz policy: threshold source, attempts, retakes | Per-quiz `pass_threshold` (default 70), attempt limit configurable, best score kept |
| D8 | Chat policy: who can DM; file attachments now? | DMs restricted to enrolled student ↔ course instructor; files later (fields prepared) |
| D9 | Session model: Bearer-only (+ revocation) or cookies + refresh tokens | Bearer + `token_version` revocation now; refresh tokens later |
| D10 | Email provider for production | Transactional provider (Resend already a dependency) in prod; Gmail SMTP dev only |
| D11 | Profile storage: embedded `User.profile` or standalone collection | Embedded as single source; drop standalone + migrate |
| D12 | Scheduled notifications: new model or extend NotificationLog | Dedicated `ScheduledNotification` model |
| D13 | Marketing module: build or delete | Delete (no routes/UI consume it) |
| D14 | API versioning `/api/v1` now? | Document prefix; defer versioning |
| D15 | Envelope standardization scope | Standardize non-approved exceptions; keep binary exports and Stripe webhook responses as-is |
| D16 | Rate-limit defaults | global 300/15m/IP; AI 20/hr/user; chat 60/min/user; enrollments 10/hr/user; uploads 20/hr/user |

## 9. Stage C — module-by-module deep dives (owner-driven, later)

After Phases 0–3, we take each module/feature one at a time (owner picks the order). Each deep dive produces:

1. **Audit document** for the module: flow map (route→middleware→controller→service→repo→model→side-effects), data contract (field-by-field vs schema), authz matrix, business-rule inventory, side-effect review, risk list.
2. **Negotiation**: we agree the intended logic/rules where the current behavior is wrong or ambiguous.
3. **Implementation** with tests + docs update, following this plan's standards.

Recommended order (from risk analysis):
1. Payments & Enrollment (extends Phase 1)
2. Auth & Users
3. Chat & Sockets
4. AI features
5. Courses / Chapters / Lessons / Quizzes
6. Materials & Media
7. Admin platform
8. Notifications & Cron
9. Reports
10. Analytics

## 10. Out of scope (this plan)

- Frontend remediation (separate plan; coordinated only where contracts change).
- New features (PayPal, MFA, file sharing in chat, mobile app) — decisions recorded, built later.
- Infrastructure migration (K8s, Terraform), TypeScript migration (D-adjacent, deferred).
- i18n.

## 11. Progress tracking

- Task statuses marked in this document: ☐ todo / ◐ in progress / ☑ done / ⊘ deferred (with reason).
- Every task references its PR and test names once implemented.
- Weekly review: re-rank P0/P1 items; update Section 8 decisions as they are made.
