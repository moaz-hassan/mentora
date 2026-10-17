# Mentora Backend — Enhancement & Remediation Plan

> **What this is:** the complete plan to fix every weakness found in the full backend analysis (security, correctness, money flows, data integrity, infrastructure, architecture, docs).
> **How to use it:** this is a living document. Every task has an ID, priority, size, and "done when" criterion. It is the contract for the enhancement program and the checklist we negotiate against, module by module.
> **Core principle: NO REWRITE.** The domain logic largely exists. We align code to schemas, close security holes, make failures loud, and lock everything with tests.
>
> **Revision 2 — redesign-aligned (2026-10-17):** the MongoDB data-layer redesign (`MONGODB_REDESIGN.md`; UML in `uml_data_design.drawio`) is folded into this plan:
> 1. a new DB-baseline workstream **WS0.7 — DBR** (26 models, indexes, seed, repositories, stats pipeline);
> 2. a **redesign-effect note after every workstream** saying what the new schema gives us for free and what stays code work;
> 3. **§9 rewritten** as the 9-module plan in the agreed review order (`MODULE_REVIEW_PROTOCOL.md`), each module stating *what the new design enhances* and *what we will do*;
> 4. the decision table (§8) annotated with what the redesign already answers (DP references), and the new IDs listed in §12.
>
> **Still zero code.** Implementation stays blocked until the owner approves **DP-01…DP-20** (redesign §9) and the §8 decisions.

- **Created:** 2026-10-17 · **Revision 2:** 2026-10-17
- **Status:** ⏳ Awaiting owner decisions (DP-01…DP-20 + Section 8) — implementation has not started.
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
10. **The new schema is the single source (Revision 2):** the 26-collection baseline (`MONGODB_REDESIGN.md` §4) is live; strict-throw produces no undeclared-field writes against it; every read/write maps to a declared field, index, or migration-free baseline creation.
11. **Dashboards by construction (Revision 2):** no full-collection loads into Node, no N+1 loops, no title-matched metrics anywhere (redesign §6 bans them); counters + `stats_daily` + indexed reads only; `npm run stats:rebuild` reproduces identical numbers from the sources.
12. **Retention & soft-delete enforced (Revision 2):** TTL / per-doc expiry per redesign §7; users, courses, messages, ratings soft-delete; financial documents are never deleted.
13. **Contract rules locked (Revision 2):** DTOs expose `id` strings (DP-01), money is integer `*_cents` everywhere (DP-07), one response envelope — with only the approved exceptions of D15.

*(Items 1–9 are unchanged from Revision 1.)*

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
| **0.5** | **DB Redesign Baseline — NEW (Revision 2)** | **DBR-01…DBR-06** | 26 models + shared helpers; `verify:indexes` green; seed works; repositories + DTO mappers land; stats rebuild reproduces the sources. **Gate: DP-01…DP-20 approved first — nothing starts before that.** |
| **1** | Money (Payments & Enrollment) | PAY-01…04, PAY-06, DAT-01, SEC-13 | Paywall enforced; webhook verified; fulfillment idempotent + transactional — implemented **against the new `payments` / `payment_events` / `coupons` / `coupon_redemptions` / `payouts` schemas**; no admin self-registration |
| **2** | Critical Security | SEC-01…04, SEC-06, SEC-07, SEC-12 | Sockets authenticated; rate limits on; JWT lifecycle fixed; audit trail writes; headers/secret hygiene — several items are now **schema invariants** (see WS1 note) |
| **3** | Schema Alignment ("unbreak pass") | SCH-01…12, SEC-05, SEC-08 | **Mostly satisfied by design:** this phase becomes the verification pass that code conforms to the new schemas — strict-throw clean; chapter workflow, notifications scheduling, admin logs, settings all functional (see WS3 note) |
| **4** | Integrity & Bug Sweep | DAT-02…07, PAY-05, PAY-08, INF-02…06 | Known bugs fixed — or **closed by verification where the redesign removed the failure class** (see WS4 note); emails via queue; Redis/cron hardened |
| **5** | Observability & Ops | INF-04, INF-07, INF-08, INF-10 | Logs/metrics/health/Sentry; baseline + seed tooling; socket adapter decision implemented |
| **6** | Architecture Convergence | ARC-01…08 | Repositories own all queries; dead code removed; duplicates consolidated; envelope + docs consistent |
| **7** | Final Validation | TST-01…05 | Full regression + security suite green; rollup/index integrity checks green; load smoke passed; docs frozen |

Phase 1 must follow Phase 0 — and, with Revision 2, **Phase 0.5 sits between them** (DB baseline first). Phases 2–3 can partially interleave. Phases 4–6 are independent enough to parallelize with a second developer.

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

> **Redesign effect:** no task changes — but FND-02/03 run against the **new** schemas, so the strict-throw baseline documents conformance to the 26-collection design instead of triaging 30 legacy models. The test harness is the same one the DB baseline (§WS0.7) verifies itself with.

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

> **Redesign effect:** MIG stays history (✅ done). Its CI guard (`check:nosql`) also protects the redesign from any SQL regression.

### WS0.7 — DB Redesign Baseline (DBR) — **NEW in Revision 2**

> Implements `MONGODB_REDESIGN.md` §11 (design + UML: `uml_data_design.drawio`). **Blocked until DP-01…DP-20 are approved.** Pure DB-layer work: no API/business changes beyond field contracts and DTO mapping.

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| DBR-01 | **P0** | L | **26 model files** (pure schemas + indexes, zero business logic) + shared helpers: money (cents), enums, retention, toJSON `id` transform, `select:false` password + unconditional deletion | Models load; strict-throw clean; no business logic in models |
| DBR-02 | **P0** | M | **Index-ensure script + `verify:indexes`** (mongodb-memory-server): exactly the §4 index budget exists, nothing extra/duplicated | CI check green; zero index drift |
| DBR-03 | P1 | M | **Seed script**: demo data across all 26 collections (+ one active campaign + stats rows) | Fresh clone → seed → app runs |
| DBR-04 | **P0** | L | **Repository layer per aggregate** + explicit DTO mappers (id strings, cents) + pagination helper | Services import no Mongoose; boundary lint clean |
| DBR-05 | P1 | M | **Stats pipeline**: nightly `$merge` rollup job, hourly today refresh, `stats:rebuild` script (updated to match the redesign's newest numbers) | Rebuild reproduces identical numbers from sources (test) |
| DBR-06 | P1 | S | **Re-wire workers/queues/audit writers** to the new schemas (field contract: canonical before/after, channel status) | Worker flush + audit writes produce valid docs |

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

> **Redesign effect (schema-level, per redesign §8):** SEC-04 `token_version` is a first-class `users` field; SEC-05 becomes a schema rule (`select:false` + unconditional toJSON deletion); SEC-13 is enforced by the repo rule "public registration can only ever produce `role:'student'`"; SEC-06 audit writes land in the unified `audit_logs` (categories + canonical before/after). The rest (SEC-01/02/03/07/08/09/10/11/12) stay code-level work.

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

> **Redesign effect:** PAY-01 = `payments.amount.*_cents` computed server-side (DP-07) — the client sends a course id and coupon code only. PAY-03 = `payment_events.provider_event_id` 🔑 + the transaction map (redesign §7). PAY-05's "extensions + migration" **is** the new `payments` schema (provider_refs, breakdown snapshot, refunds[] — greenfield: nothing to migrate). PAY-06 = `coupons` atomic claim + `coupon_redemptions` unique per-user (DP-11). PAY-08's drift (`student_id` vs `user_id`) disappears — one field contract in the new schemas; period totals also come from `stats_daily` (module 7).

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

> **Redesign effect — most of WS3 is satisfied by design; this workstream becomes a verification pass:**
> - SCH-01 chapter workflow → real fields in the embedded outline (DP-02); verify end-to-end again.
> - SCH-02 published state → single `courses.status` enum; the `is_published` split is gone.
> - SCH-03 scheduled notifications → `notification_campaigns` {status, scheduled_at} + scheduler (DP-13 area).
> - SCH-04 admin logs → unified `audit_logs` + `error_logs` with one field contract.
> - SCH-05 settings → `settings {key UQ, typed value, category, is_public}` (MIG-01 already Mongoose-native).
> - SCH-06 chat fields → `chat_participants` read-state (`last_read_at`, `unread_count`; DP-12).
> - SCH-08 report fields → typed `reports` (+ `ai{}` object).
> - SCH-09 marketing delete → unchanged.
> - SCH-11 subcategory uniqueness → embedded subcategories + delete guard (a subcategory with courses cannot be removed).
> - SCH-12 index audit → replaced by the curated index budget + `verify:indexes` (DBR-02).
> - **Remaining real code work:** SCH-07 (`gifted_by` decision lands in module 9) and SCH-10 (quiz sub-schema validation = the `quizzes` schema).

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

> **Redesign effect:** DAT-01's helper applies to the redesign transaction map (purchase, certificate issue, payout, role/status change). DAT-03 is **resolved** by DP-06 (embedded `users.profile` only; greenfield — nothing to migrate). DAT-04's list shrinks — the chapter virtual, financial `user_id`, notification duplicate key and `countByCategory` phantom fields are impossible on the new schemas (close each by verification); keep coupon `modifiedCount`, deactivation-via-status, `deactivateExpired` job and console-log removal as code tasks. DAT-08 is **banned by design** in the dashboards model (redesign §6) — verify with query-count tests.

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

> **Redesign effect:** INF-02's flush writes the new log schemas (MIG-03 already migrated the `insertMany` path); INF-03/04 email + scheduler run on `notification_campaigns` + Bull; INF-06's locks also protect the stats rollup job; INF-08's "migrations" become the greenfield baseline — `createIndexes` (DBR-02) + seed (DBR-03), no data backfills, and `stats:rebuild` is operated as the standing reconciliation tool.

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

> **Redesign effect:** ARC-01's waves target the new aggregate boundaries (users; courses + embedded outline; quizzes; enrollments + progress; certificates; chat; notifications; ops; stats) — DBR-04 lands the first cut and each module deep dive finishes its wave. ARC-06 gains the two contract rules: `id` strings (DP-01) and integer cents (DP-07). ARC-03's dead-code list is unchanged.

### WS7 — Final Validation (TST)

| ID | Pri | Size | Task | Done when |
|---|---|---|---|---|
| TST-01 | P0 | M | **Security regression suite**: paywall bypass, webhook signature, socket impersonation, role escalation, rate limits, token revocation, regex escaping. | Suite green in CI |
| TST-02 | P1 | M | **Authz-negative matrix**: for every protected route family, test wrong-role + no-token + other-user's-resource (IDOR). | Matrix complete & green |
| TST-03 | P1 | S | **Load smoke**: catalog search + lesson stream + chat send with k6/artillery; no regressions vs baseline. | Numbers recorded |
| TST-04 | P1 | S | **Pen-test checklist run**: OWASP API Top 10 pass against staging. | Findings triaged (none P0/P1 open) |
| TST-05 | P1 | S | **Rollup & index integrity** (NEW): `stats:rebuild` reproduces identical numbers from sources; `verify:indexes` matches the §4 budget; counters rebuildable (courses.stats, coupons.stats). | CI checks green; drift impossible without failing |

> **Redesign effect:** TST-01 adds rollup integrity and the "counters are never used for security decisions" rule (paywall = enrollment existence inside the transaction). TST-05 is the new integrity gate.

---

## 5. Testing strategy

- **Tools:** Jest (ESM), supertest, `mongodb-memory-server`, factory helpers, JWT mint helper, fake timers for cron/scheduling, Stripe CLI fixtures for webhooks.
- **Levels:** integration tests per route family (primary), unit tests for services with mocked repositories (secondary).
- **Mandatory test types per module:**
  1. Happy path.
  2. Validation negatives.
  3. **Authorization negatives** (no token, wrong role, wrong owner).
  4. Idempotency/concurrency where money or counters are involved.
  5. **Read-model tests (Revision 2):** query-count assertions on dashboards (no full scans, no N+1) and rollup reproducibility where counters/`stats_daily` are involved.
- **Gate:** CI blocks merge on red; security suite is a required check.

## 6. Data migrations & rollout safety

- **Greenfield baseline (Revision 2):** the redesign is created fresh — there is **no data to migrate**. The Revision 1 backfill list (Course.is_published reconciliation, settings, notification logs, payment intent ids, profile consolidation) is obsolete: the new schemas make those drifts structurally impossible.
- Bootstrap sequence: DBR-01 models → DBR-02 `createIndexes` + `verify:indexes` → DBR-03 seed → `smoke:imports` → then Phase 1.
- The `backend/src/migrations/` + `npm run migrate` tooling (INF-08) is still introduced — but ships with an empty slate, reserved for future backfills/index sync.
- Risky changes (strict-throw, envelope standardization, queue migration) ship behind a **feature flag** where a rollback path is not obvious; strict-throw stays dev/test only.
- Stripe webhook changes verified with **Stripe CLI** in staging before production.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Strict-throw surfaces a flood of phantom writes | Run it at Day 1 of Phase 3 as a baseline report; fix in scheduled order (SCH list) — and most of the class is designed away in the new schemas |
| Envelope changes break the frontend | Single coordinated release; frontend task list tracked separately |
| Queue migration changes email timing | Keep inline fallback flag for dev; verify with retry tests |
| Refactor regressions (zero tests today) | FND-02 harness first; module waves gated by tests |
| Secrets may exist in git history | SEC-12 gitleaks + rotate everything touched |
| Multi-instance duplicate cron/emails | INF-06 locks before any horizontal scaling |
| **Redesign decisions delayed (DP-01…DP-20)** | Everything DB-related stays paused by design — no code lands until approved (redesign §9) |
| **Contract shifts (ObjectId ids, integer cents) reach the frontend late** | ARC-06/D15 one coordinated release; DBR-04 DTO mappers centralize the mapping |

## 8. Decisions needed before execution (negotiation points)

| # | Decision | My recommendation | Redesign note (Revision 2) |
|---|---|---|---|
| D1 | Public registration roles: student only, or student+instructor application flow? | student only; instructor via `become-instructor` application (admin-approved) | Enforced at schema level: public registration can only ever produce `role:"student"` (redesign §8.1) |
| D2 | Paid enrollment flow: webhook auto-enroll, or enrollment-POST verifies payment? | **Both**: webhook fulfills; POST re-checks payment; idempotent | Matches the redesign transaction map: fulfillment in one session; POST re-checks inside it (§7) |
| D3 | Refunds/disputes in scope now? | Later module phase; schema fields prepared now | Prepared in the new `payments` schema: `refunds[]`, `refunded_total_cents`, statuses |
| D4 | Chapter-level review workflow: keep or drop (course-level review only)? | Keep only if product needs granular moderation; else drop (simpler) | **Resolved — keep:** DP-02 gives the embedded chapter real workflow fields; the workflow works end-to-end |
| D5 | `is_published` vs `status` single source | Real `is_published` boolean maintained by repo on status transitions (frontend contract safe) | **Superseded:** one `courses.status` enum (draft…archived); no `is_published` split |
| D6 | Coupons: per-user limits, stacking with course discount, global coupon rules | Per-user limit yes; no stacking; one active global coupon (current rule kept) | Implemented: atomic claim + `coupon_redemptions` unique per-user (DP-11); stacking rule unchanged |
| D7 | Quiz policy: threshold source, attempts, retakes | Per-quiz `pass_threshold` (default 70), attempt limit configurable, best score kept | `quizzes.pass_threshold` typed; all attempts kept, best/latest in progress (DP-17) |
| D8 | Chat policy: who can DM; file attachments now? | DMs restricted to enrolled student ↔ course instructor; files later (fields prepared) | `chat_participants` read-state (DP-12); typed `attachments[]` prepared now |
| D9 | Session model: Bearer-only (+ revocation) or cookies + refresh tokens | Bearer + `token_version` revocation now; refresh tokens later | `token_version` lives on the new `users` schema |
| D10 | Email provider for production | Transactional provider (Resend already a dependency) in prod; Gmail SMTP dev only | Unchanged — email via Bull worker on the new `notifications` doc |
| D11 | Profile storage: embedded `User.profile` or standalone collection | Embedded as single source; drop standalone + migrate | **Resolved:** embedded only, `profiles` collection deleted (DP-06) |
| D12 | Scheduled notifications: new model or extend NotificationLog | Dedicated `ScheduledNotification` model | **Resolved:** `notification_campaigns` (status + `scheduled_at` + stats) |
| D13 | Marketing module: build or delete | Delete (no routes/UI consume it) | Unchanged |
| D14 | API versioning `/api/v1` now? | Document prefix; defer versioning | Unchanged |
| D15 | Envelope standardization scope | Standardize non-approved exceptions; keep binary exports and Stripe webhook responses as-is | Aligned with ARC-06 + the two contract rules (DP-01 ids, DP-07 cents) |
| D16 | Rate-limit defaults | global 300/15m/IP; AI 20/hr/user; chat 60/min/user; enrollments 10/hr/user; uploads 20/hr/user | Unchanged |

## 9. Module plan (redesign-aligned) — the pre-plan, updated

> **Same workflow as agreed in [`MODULE_REVIEW_PROTOCOL.md`](./MODULE_REVIEW_PROTOCOL.md):** per module → audit doc → numbered decision points → owner negotiation → implementation with evidence → **one commit per module** (Rule 7). What Revision 2 adds: every module now names **what the new DB design gives it** (schema-level enhancements) and **what we will actually do** in its deep dive — task IDs and DP references included.
>
> **Order:** the agreed 9-module order replaces Revision 1's 10-item Stage C list. Mapping: Materials & Media = old #6; Reports + Analytics = old #9+#10 merged; the rest 1:1.
>
> **Gate:** all modules are **pending**. The graph is: **DP-01…DP-20 approval → WS0.7 (DBR) → modules in the order below.** The auth audit is already drafted (`backend/docs/audits/AUTH_USERS_AUDIT.md`) and will be re-based on the new schema when module 1 starts.

| # | Module | Key DPs | Lands task IDs |
|---|---|---|---|
| 1 | Auth, Authorization & Users | 01, 06, 08 | SEC-03/04/05/10/13, FND-01 |
| 2 | Chat & Sockets | 12 | SEC-01, INF-10, DAT-08 (partial) |
| 3 | Courses & Content | 02, 03, 17, 20 | SCH-01/02/10, DAT-02/05/06 |
| 4 | Media & Storage | 03, 06 | SEC-09, DAT-06 (files), ARC-02 |
| 5 | Admin & Settings | 05, 14, 15, 16, 18 | SEC-06, SCH-04/05/08/09 |
| 6 | Notifications & Background | 13 | SCH-03, INF-02/03/04/05/06 |
| 7 | Reports & Analytics | 19 | DAT-08, INF-04, PAY-08, ARC-04/05, TST-05 |
| 8 | AI | — | SEC-11 |
| 9 | Payments & Enrollment | 07, 09, 10, 11, 16 | PAY-01…08, DAT-01/07 (SCH-07) |

### 1 · Auth, Authorization & Users

**Scope.** Register/login/logout · email verification · password reset/change · profile & avatar · roles/status (admin) · sessions.
**New-design enhancements (schema-level):**
- `users.role`/`status`/`password_hash`/`token_version` writable only via dedicated repository methods — the escalation class is dead by design (redesign §8.1).
- One identity document: embedded `profile` + `security` (lock state) — the dual-profile store and the "zero auth trail" finding become structurally impossible.
- `auth_tokens`: sha256 only, attempt cap ≤ 5, single-use, one active token per purpose, TTL verify 24h / reset 30m (DP-08).
- `audit_logs(category:"security")` covers login success/failure, reset, verify, role/status changes.
**What we will do.** Re-base `AUTH_USERS_AUDIT.md` on the new schema → negotiate remaining choices → implement the code-level items against the new models: SEC-13 (escalation regression test), SEC-03 (no email send on `authenticate`), SEC-04 (revocation end-to-end), SEC-05 (DTO sweep — password can never serialize), SEC-10 (lockout + security email), FND-01 (config fail-fast); every fix ships with a test + audit events.
**Depends on.** DBR-01/04 · DPs 01, 06, 08. **Exit.** Auth suite green on the new schema (happy / negatives / revocation / lockout / escalation); zero phantom fields; one commit.

### 2 · Chat & Sockets

**Scope.** REST rooms/messages · Socket.io realtime · unread/read state · membership.
**New-design enhancements:**
- `chat_participants` carries membership **and** read state — `unread_count` maintained by fan-out `$inc` (DP-12); "unread always 0" is impossible.
- `chat_rooms`: `last_message` denormalized (room list = one indexed read); `course_id` unique sparse (one room per course); `participants_key` unique sparse (no duplicate DMs).
- `chat_messages`: ObjectId cursor ordering (no skip/limit scans), typed `attachments[]`, soft delete.
**What we will do.** SEC-01 (handshake JWT, server-derived identity, membership from DB, per-event limits), verify the unread write-path + mark-read, cursor pagination + query-count tests, INF-10 decision executed or scheduled, socket regression tests (impersonation + unauthorized-room joins fail).
**Depends on.** DBR-01/04 · DP-12. **Exit.** Impersonation/room tests green; unread correct under concurrent sends; one commit.

### 3 · Courses & Content (courses/chapters/lessons/materials/quizzes/progress)

**Scope.** Courses CRUD + publish · embedded outline + review workflow · quizzes + attempts · lesson completion & progress · certificates.
**New-design enhancements:**
- Real chapter workflow fields (DP-02) — the dead review workflow is replaced; doc guardrails: ≤ 20 chapters, ≤ 100 lessons, ≤ 100KB content (DP-20).
- `quizzes` separate with typed questions — `correct_option_ids`/`explanation` never reach students (DP-03, §8.4).
- Typed `enrollments.progress` (watch map, `quiz_scores`) — Mixed is gone; `courses.stats` counters updated by `$inc` with a rebuild script.
- Certificate uniqueness `{student_id, course_id}` protects double-issue inside the completion transaction.
**What we will do.** Verify the review workflow end-to-end again (SCH-01 closure), SCH-02 single status source, SCH-10 quiz validation, DAT-02 one quiz-submission path, DAT-05 enrollment invariants, DAT-06 certificate access control + anti-enumeration, progress math tests; ARC-01 wave for the courses aggregate.
**Depends on.** DBR-01/04 · DPs 02, 03, 17, 20. **Exit.** Workflow + grading + progress + certificate suites green; strict-throw clean; one commit.

### 4 · Media & Storage (Cloudinary, Supabase, uploads)

**Scope.** Uploads (avatar, thumbnail, intro video, lesson materials) · Cloudinary HLS · Supabase files · downloads.
**New-design enhancements:** storage refs only (`courses.media`, `lesson_materials.storage`, `profile.avatar_url`, `certificates.storage`) — no blob or phantom URL fields; `lesson_materials.course_id` denormalized for access checks without loading the course; deterministic public_ids + cascade cleanup hook on delete.
**What we will do.** SEC-09 (magic-byte sniffing, filename sanitization, extension lists); verify signed download authz (enrollment or `is_preview`) then short-TTL URLs; ARC-02 (`validateCloudinaryUrl` → service/util); DAT-06 certificate file access; upload negative tests (size/mime/spoofed).
**Depends on.** DBR-01/04 · DPs 03, 06. **Exit.** Upload/download security tests green; no local disk writes; one commit.

### 5 · Admin & Settings (settings, instructors, logs, moderation, campaigns)

**Scope.** Settings editor · instructor management · users admin ops · logs explorer · moderation (reports/ratings/courses) · campaigns (banner/featured).
**New-design enhancements:** `settings` (typed, `is_public`, Redis cache contract); one `audit_logs` with canonical before/after + retention (general 24m / financial 7y) and `error_logs` (90d TTL); `campaigns` is the single source of "featured" (DP-05); `reports` typed queue with `ai{}`; moderation = status changes (hide rating / archive course), never hard delete (DP-16).
**What we will do.** SEC-06 (audit guard + before/after writer), SCH-04/05/08 closures by verification, SCH-09 marketing deletion, DBR-06 audit-writer wiring, campaign curation endpoints, logs explorer (pagination + anchored regex only), tests proving every admin mutation leaves a trail.
**Depends on.** DBR-01/04/06 · DPs 05, 14, 15, 16, 18. **Exit.** Admin mutations always trail; moderation never deletes; one commit.

### 6 · Notifications & Background (email, Bell, Bull workers, cron)

**Scope.** In-app bell + inbox · email delivery · admin campaigns/scheduling · Bull workers · cron jobs.
**New-design enhancements:** `notifications` per-channel delivery status + TTL for read items (DP-13); `notification_campaigns` real fields, `{status, scheduled_at}` scheduler and metrics from `{campaign_id, is_read}` — kills the title-matching and the dropped-field façade; one `notify()` helper used by every module; workers write the new log contracts.
**What we will do.** SCH-03 closure by verification; INF-02 worker process + INF-03 email queue + INF-04 real scheduler + INF-06 Redis locks; retry/backoff tests; confirm stats-rollup job ownership (DBR-05 vs this module) and wire it.
**Depends on.** DBR-01/04/05/06 · DP-13. **Exit.** Scheduled campaign fires exactly once (fake timers); email retried on transient failure; worker graceful shutdown; one commit.

### 7 · Reports & Analytics (admin/instructor/financial/platform)

**Scope.** Admin dashboards (overview/revenue/users/enrollments/courses) · instructor stats · financial · exports · report queue read paths.
**New-design enhancements:** the read model — entity counters (instant) + `stats_daily` rollups (range charts) + indexed live reads (today) + `$lookup` only in bounded pages; **banned:** scans in Node, N+1 loops, title-matched metrics (redesign §6); documented freshness (≤ 1h today; final after the nightly rollup); `stats:rebuild` reproducible.
**What we will do.** Implement the dashboards per the §6 mapping as repository reads (not service loops); INF-04 platformAnalytics stub replaced by real rollup jobs; PAY-08 financial alignment on `payments`/`payouts`; ARC-04/05 consolidate the duplicate suites; TST-05 rollup + index integrity; query-count + rebuild-determinism tests.
**Depends on.** DBR-01/04/05 · DP-19. **Exit.** Every dashboard answers from the read model (zero scans); rebuild reproduces numbers; one commit.

### 8 · AI (Gemini course review, AI security)

**Scope.** Gemini course review · report triage hints · assistant (chat/suggest/analyze/examples).
**New-design enhancements:** `courses.ai_review` latest-only embedded + hidden from students; `reports.ai{}` typed; `settings` holds model config; `audit_logs(category:"system")` on runs; no Mixed AI blobs anywhere.
**What we will do.** SEC-11 hardening (size caps, per-user quota, timeout, cost logging, injection tests); Bull retry for failed runs; prompt builder strips PII; instructor notification on review-ready; failures recorded (status + audit), never silently dropped.
**Depends on.** DBR-01/04 · SEC-11. **Exit.** Quota + timeout enforced; injection cases blocked; failures retried then recorded; one commit.

### 9 · Payments & Enrollment (Stripe, coupons, webhooks, paywall) — last

**Scope.** Stripe checkout · webhooks · coupons · enrollment (paid/free/gift) · refunds · payouts · earnings.
**New-design enhancements:** append-only `payments` (integer cents, `provider_refs` unique sparse, breakdown snapshot, `refunds[]`); `payment_events` idempotency (`provider_event_id` UQ); `coupons` atomic claim + `coupon_redemptions` unique per-user (DP-11); real `payouts` with payment assignment (DP-10); enrollment upsert + counters + chat participant in **one transaction** (redesign §7); counters never used for security decisions.
**What we will do.** PAY-01…PAY-08 against the new schemas (server pricing, raw webhook + signature, transactional fulfillment, paywall inside the tx, refunds per D3, coupon race test, payouts); DAT-01 transaction helper; DAT-07 + SCH-07 (gift attribution / `gifted_by` decision); Stripe CLI staging verification; TST-01 money-regression suite.
**Depends on.** DBR-01/04 · DPs 07, 09, 10, 11, 16. **Exit.** Replayed webhook → exactly one enrollment; tampered amount ignored; coupon race never exceeds limits; payout totals deterministic; one commit.

## 10. Out of scope (this plan)

- Frontend remediation (separate plan; coordinated only where contracts change).
- New features (PayPal, MFA, file sharing in chat, mobile app) — decisions recorded, built later.
- Infrastructure migration (K8s, Terraform), TypeScript migration (D-adjacent, deferred).
- i18n.
- Data migration tooling beyond the greenfield baseline (Revision 2 — nothing to migrate; the tooling is reserved for future backfills).

## 11. Progress tracking

- Task statuses marked in this document: ☐ todo / ◐ in progress / ☑ done / ⊘ deferred (with reason).
- Every task references its PR and test names once implemented.
- Weekly review: re-rank P0/P1 items; update Section 8 decisions as they are made.
- **Current graph (Revision 2):** DP-01…DP-20 approval → WS0.7 (DBR-01…DBR-06) → Phases 1–7 → module deep dives in the §9 order. Until the first gate opens, everything DB-related stays paused — **no code**.
- **Revision 2 note:** this rewrite is docs-only; nothing was implemented. MIG-* remains the only completed workstream (✅). Auth deep-dive audit is drafted and parked.

## 12. New in Revision 2 (ID map)

- **WS0.7 — DBR-01…DBR-06** (DB redesign baseline) — new workstream.
- **TST-05** (rollup & index integrity) — extended validation.
- Notes only (no new IDs): the redesign-effect blocks after each workstream, the §8 "redesign note" column, the §9 module rewrite, and the §6 reframe for the greenfield baseline.
