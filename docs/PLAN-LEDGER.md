# Agreed Scope and Verification Ledger

Updated: 2026-11-14.

This is the single place to check what's actually done versus pending -
`PLAN.md` records the agreed _plan_, this file tracks _progress against it_
with a checkbox per concrete item, struck through only once verified, never
on intent alone. If this file and reality disagree, this file is wrong and
gets fixed, not reality.

TestDino Demo Store was removed as a target on 2026-10-29 (all files, config
and doc references deleted or repointed) in favor of Sauce Demo. Entries below
that reference TestDino describe work that happened and is retained for
history, per `D-007`; they are not current state.

---

## Target Applications Registry

Moved to [`docs/targets/REGISTRY.md`](targets/REGISTRY.md), which also doubles
as the keyword list `npm run docs:check` greps the process layer against
(`INTENT.md` §2) - one file, one owner, mechanically checked.

---

## `PLAN.md` Phase 1 — Foundations (Verified, complete)

- [x] ~~Authoritative blueprint: `CORE_PRINCIPLES.md` covering Commands, Code Standards, Guardrails, Folder Structure, Naming Conventions, Workflow & Approvals.~~
- [x] ~~Signal-only orchestrators: tabular `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`.~~
- [x] ~~4 independent suite configs: `playwright.ui/api/visual/audit.config.ts`.~~ Verified: discovery clean across all 4.
- [x] ~~Atomic env switcher `npm run env:config -- <env>`.~~ Verified: copies cleanly to `.env`.
- [x] ~~Guardrail checker `scripts/guardrails/check-rules.ts`.~~ Verified: 0 violations, wired as a PreToolUse hook.
- [x] ~~Docker baseline (`Dockerfile`, `docker-compose.yml`).~~
- [x] ~~Quality tooling: TS strict mode, path aliases, ESLint, Prettier, Husky, lint-staged.~~ Verified: `npm run check` exit 0.
- [x] ~~Directory structure (`page-objects/`, `fixtures/`, `tests/`, `test-data/`, `types/`, `helpers/`).~~

---

## `PLAN.md` Phase 2 — Lean agentic workflow (Verified, complete 2026-11-14)

Commits `3c35388`, `7186750`. Full item-by-item detail of what moved where is
in `INTENT.md` §3/§5/§11 - this is the checklist, not the rationale.

- [x] ~~`specs/TEMPLATE.md` created; proven on a real target as `specs/saucedemo.plan.md`~~, replacing the retired 443-line Sauce Demo workbook with zero scenarios or defects dropped.
- [x] ~~`docs/templates/README.md` trimmed to the shared vocabulary~~ (IDs, priority math, SFDIPOT, the 3 tours, the 11 oracles, test techniques, automation-decision scoring, defect severity/status, the confidence rubric).
- [x] ~~`explorer` agent rewritten~~: Stage 0 (Intake) + Stage 1 (Explore), full checklist and 7 guardrails inline, no external 285-line template to read first.
- [x] ~~`verifier` agent created~~ (closed the gap `D-004` named but never built): Stage 5, read-only tools only (no Edit/Write), the 12-area review table inline.
- [x] ~~`scenarios`, `test-spec`, `pr-review` skills rewritten; `automation-design` and `evidence` retired into `test-spec`.~~
- [x] ~~Mechanical agnosticism check added~~ (`check-docs.ts` + `docs/targets/REGISTRY.md`) - fails the build if any agent/skill names a specific target.
- [x] ~~`AGENTS.md` rewritten lean.~~
- [x] ~~`docs/LOG.md` pruned~~ of 5 entries (`D-001`, `D-005`, `D-006`, `D-011`, `D-020`, `L-004`) whose cause no longer exists.
- [x] ~~6 retired phase templates deleted~~ (`01-EXPLORATION` through `06-PR-REVIEW`).
- [x] ~~Confidence rubric added~~: `docs/templates/README.md` (the one definition), `INTENT.md` §3/§4, all 4 agent/skill files report it.
- [ ] **Open**: `.mcp.json`/`.agents/mcp_config.json`/`.codex/config.toml` still hardcode the Sauce Demo/BillPay origins in `--allowed-origins` - a real agnosticism gap (`INTENT.md` §2). Stage 0 Intake now says to add a new target's origin there by hand; no mechanical check yet that this list matches `docs/targets/REGISTRY.md`. Folded into Phase 3 below.
- [ ] **Open**: the confidence rubric itself is not mechanically enforced - nothing verifies a stage actually reported it, or that the gate (`Confidence >= 8` and `Unknowns: none`) was honestly met. Folded into Phase 3 below.

---

## `PLAN.md` Phase 3 — Evals (Not started)

- [ ] Guardrail-checker eval: fixed known-bad snippets (`waitForTimeout`, XPath, `any`, pseudo-Gherkin) that must be rejected, known-good snippets that must pass.
- [ ] Explorer eval: run against Sauce Demo, assert the output names `problem_user`'s broken image (`DEF-002`) and `error_user`'s exception (`DEF-003`).
- [ ] Mechanical check that a touched `specs/<target>.plan.md` contains a well-formed `## Confidence` block (the three fields present, `Confidence` an integer 1-10) - makes the rubric added in Phase 2 actually enforced, not just instructed.
- [ ] Mechanical check that `--allowed-origins` in `.mcp.json`/`.agents/mcp_config.json`/`.codex/config.toml` matches `docs/targets/REGISTRY.md` - closes the Phase 2 agnosticism gap above.
- [ ] Framework self-tests: regression tests for the custom guardrail/docs checkers themselves (carried over from the 2026-10-29 punch list, still open).

## `PLAN.md` Phase 4 — Visual regression suite (Not started)

`tests/visual/` has config but zero specs - a real gap (carried over from the
2026-10-29 punch list), not a deliberate scope decision.

- [ ] Scope agreed: which pages, which viewports, how many baseline variants - before any spec is written.
- [ ] Specs written with committed, Docker-generated baselines.
- [ ] Wired into the CI matrix.

## `PLAN.md` Phase 5 — Database testing, scoping only (Not started)

- [ ] Decide: bring a concrete target with real DB access, or document a
      through-the-API/UI data-integrity testing strategy. Today's targets
      (Sauce Demo, the BillPay practice API) expose no direct DB access.

---

## Historical build-out (completed before the 2026-11-14 redesign; retained for history, not live tracking)

### Authentication, API Contracts, and Full-Stack Data Patterns (Verified)

- [x] ~~Contract validation with inferred runtime types.~~ Zod schemas in `types/schemas/` (`health`, `biller`, `bill`, `payment`, `file`, `error`, `common`, `user`), zero `any`.
- [x] ~~Independent API suite execution & token handling.~~ `fixtures/api.fixture.ts` providing `authedRequest`.
- [x] ~~Full API contract test suite~~ (`tests/api/`: `health`, `categories`, `billers`, `bills`, `auth`, `files`, `resiliency`, `billing-lifecycle`).
- [x] ~~Per-run API data isolation~~ (2026-11-14, commit `6f776ba`): `billing-lifecycle.spec.ts` no longer mutates the shared `user-demo-001` account - a dedicated `isolatedUser` fixture creates a unique user + payment method per run. Stress-tested with two concurrent runs, no collision.

### Visual, Accessibility, Component, and Advanced Coverage

- [x] ~~WCAG 2.1 AA Accessibility Specification~~ (`tests/audit/accessibility.spec.ts`): full `@axe-core/playwright` scan, zero suppressions.
- [x] ~~Core Web Vitals & Performance Audit~~ (`tests/audit/web-vitals.spec.ts`): `PerformanceObserver`-based LCP/CLS/FCP/TTFB, fixed 2026-11-10 so a missing measurement fails instead of defaulting to 0.
- [x] ~~SEO & Image Lazy-Loading Audit~~ (`tests/audit/seo.spec.ts`).
- [x] ~~UI reference suite for Sauce Demo~~ (`tests/ui/saucedemo/`) - see `specs/saucedemo.plan.md` for the live scenario list; visual regression is tracked as `PLAN.md` Phase 4 above, not here.

### Supervised AI Harness, Specialist Roles & Scaffolding (superseded 2026-11-14 by `PLAN.md` Phase 2 above)

- [x] ~~6-Phase Engineering Lifecycle & Blueprint Templates (`docs/templates/`).~~ Superseded: all 6 phase templates retired, substance moved per `INTENT.md` §3/§5/§11.
- [x] ~~Single-Workbook Target Architecture.~~ Superseded: `docs/targets/<site>.md` retired in favor of `specs/<target>.plan.md`.
- [x] ~~Agent Skills Library.~~ Superseded set (2026-11-14): `explore`, `scenarios`, `test-spec`, `pr-review`.
- [x] ~~Autonomous Exploration Agent Definition & MCP Wiring.~~ Superseded: `explorer` now also covers Stage 0 Intake; `verifier` added for Stage 5.
- [x] ~~Execution of Phase 1 Reconnaissance on TestDino~~ (6 defects logged, removed with the target 2026-10-29).

### 2026-10-29 Review Punch List (Fixed 2026-10-29, items since fully closed noted)

- [x] ~~`web-vitals.spec.ts` FCP falling back to `0`.~~ Fixed 2026-10-29.
- [x] ~~CI `independence-check` missing `chromium-authenticated`.~~ Fixed 2026-10-29.
- [x] ~~`SC-007` sort test passing vacuously on an empty array.~~ Fixed 2026-10-29.
- [x] ~~`SC-005` only asserting `toContainText('Total:')`.~~ Fixed 2026-10-29.
- [x] ~~README "5-way matrix" / stale workbook evidence.~~ Fixed 2026-10-29; the workbook itself was later retired 2026-11-14.
- [x] ~~Backend data isolation/cleanup for the BillPay API suite.~~ Fixed 2026-11-14 (`6f776ba`) - tracked above, not re-listed as open.
