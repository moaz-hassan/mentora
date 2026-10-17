# Module Review Protocol — Mentora Backend

> **Status: AGREED** (Oct 17, 2026) between project owner and AI agent.
> Applies to every module/feature deep-dive. Rules stay editable, but only with the owner's explicit approval.

---

## Review order (agreed)

| # | Module | Status |
|---|---|---|
| 1 | **Auth, Authorization & Users** | ← current |
| 2 | Chat & Sockets | pending |
| 3 | Courses & Content (courses/chapters/lessons/materials/quizzes/progress) | pending |
| 4 | Media & Storage (Cloudinary, Supabase, uploads) | pending |
| 5 | Admin & Settings (settings, instructors, logs, moderation, campaigns) | pending |
| 6 | Notifications & Background (email, Bell, Bull workers, cron) | pending |
| 7 | Reports & Analytics (admin/instructor/financial/platform) | pending |
| 8 | AI (Gemini course review, AI security) | pending |
| 9 | Payments & Enrollment (Stripe, coupons, webhooks, paywall) — **last** | pending |

**Cross-cutting concerns** (config/env, error middleware, caching, rate limiting, uploads) are examined inside every module; a dedicated consolidation pass runs if gaps remain after the module list.

---

## Rule 1 — Ten review dimensions (every module is judged on all ten)

| # | Dimension | The question | Verdict scale |
|---|---|---|---|
| D1 | Correctness | Does it actually work end-to-end? Happy path + error paths + edge cases (empty/duplicate/oversized/unauthorized) | ✅ Works · ⚠️ Works with gaps · ❌ Broken |
| D2 | Best-way | Is this the best approach for our stack? Alternatives? Trade-offs? | 🟢 Keep · 🟡 Improve · 🔴 Rework |
| D3 | Security | Authn, per-endpoint authz, validation coverage, NoSQL/regex injection, data exposure, rate limiting, secrets, abuse vectors | ✅ Safe · ⚠️ Gaps · ❌ Vulnerable |
| D4 | API & data contract | Envelope, status codes, frontend expectations, breaking-change risk | ✅ Compatible · ⚠️ Drift · ❌ Breaking |
| D5 | Data integrity | Schema ↔ code alignment (phantom fields), indexes, uniqueness, transactions, idempotency | ✅ Aligned · ⚠️ Drift · ❌ Corruption risk |
| D6 | Reliability | External service failure modes, retries, queues, graceful degradation | ✅ Resilient · ⚠️ Partial · ❌ Fragile |
| D7 | Performance & scale | N+1 queries, pagination, indexes, unbounded queries, payload sizes | ✅ Fine · ⚠️ Watch · ❌ Problem |
| D8 | Observability | Logs, audit trail, error visibility — could we debug it in production? | ✅ Good · ⚠️ Partial · ❌ Blind |
| D9 | Code quality & architecture | 4-tier discipline, naming, dead code, AGENTS.md conformance | ✅ Conformant · ⚠️ Deviations · ❌ Violations |
| D10 | Plan alignment | Existing plan IDs (SEC-/PAY-/SCH-/INF-/ARC-/TST-) + newly proposed IDs | List + new IDs |

## Rule 2 — Evidence & honesty

- Every finding = **severity + `file:line` (or reproduction) + why it matters + proposed fix + how to verify**.
- Confidence is stated and never mixed: **Verified** (reproduced/tested or provable by full code trace) · **Suspected** (needs a test) · **Unverified** (needs an environment we don't have).
- Findings are classified separately: **Bug** · **Risk** · **Preference**.

## Rule 3 — Severity (aligned with `BACKEND_ENHANCEMENT_PLAN.md`)

- **P0** = security breach / money or data loss / paywall bypass / live crash → pauses the deep-dive; owner decides *fix now* vs *schedule*.
- P1 = serious correctness/security · P2 = moderate · P3 = polish.

## Rule 4 — Workflow per module (fixed)

1. Owner names the module (or approves the order).
2. Agent delivers the **module audit doc** + numbered **decision points** (options + recommendation each).
3. **Owner negotiates/approves — zero code before this.**
4. Agent implements only approved items, with verification evidence.
5. Plan doc statuses updated → next module.

## Rule 5 — Audit doc format (`backend/docs/audits/<MODULE>.md`)

1. Scope & entry points (routes / socket events / jobs)
2. End-to-end flow map (happy + error paths)
3. Data contract (request/response + frontend consumers)
4. Schema & data-integrity check
5. Authz matrix (endpoint × role × what the code actually checks)
6. Business rules & edge cases inventory
7. Findings table (Rule 2 format)
8. Best-way review (alternatives + trade-offs + recommendation)
9. Plan alignment (existing IDs + new proposed IDs)
10. Verdict scorecard (D1–D10)
11. Decision points list
12. Verification plan

## Rule 6 — Change rules

- No breaking API/data change without explicit owner approval + frontend coordination note.
- Frontend contract is **frozen by default** — compatibility must be proven or flagged.
- No scope creep: every change maps to a decision ID.
- Every fix ships with evidence; once the Jest harness (FND-02) lands, security fixes require tests.

## Rule 7 — Commit cadence

- **Option A (agreed):** one commit + push per completed module → clean GitHub review + easy per-module revert.
- Nothing is committed for a module until the owner confirms the module work as done (audit + approved implementations).

## Rule 8 — Rules themselves

- The protocol is renegotiable at any time — only with the owner's explicit approval.

---

## Module audit checklist (owner-facing summary)

When a deep-dive finishes, the owner receives:
- Module verdict scorecard (D1–D10 with evidence-based ratings)
- Findings table (P0–P3, Bug/Risk/Preference, Verified/Suspected/Unverified)
- Best-way review with concrete alternatives
- Decision points requiring an owner decision before any code
- Verification plan for every proposed fix
