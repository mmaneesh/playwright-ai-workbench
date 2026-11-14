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

## `PLAN.md` Phase 3 — Evals (Verified, complete with one honest caveat)

- [x] ~~Guardrail-checker eval~~ (`scripts/guardrails/check-rules.eval.ts`, `npm run guardrails:eval`, wired into `npm run check`): 11 known-bad/known-good cases. Found and fixed a real bug while building it - the `NO_XPATH` pattern failed on a common XPath like `"//button[@id='submit']"` because its exclusion-based middle broke on an embedded quote of the other kind.
- [x] ~~Explorer eval~~ (`scripts/evals/explorer.eval.ts`, `npm run eval:explorer`): asserts `specs/saucedemo.plan.md` still names `problem_user`'s broken image (`DEF-002`), `error_user`'s exception (`DEF-003`), `DEF-001`, and the two explicit not-covered accounts. **Honest scope**: this is a regression guard on recorded ground truth, not a live re-run of the explorer agent against Sauce Demo - a genuine live re-run would need a real LLM call and a browser, too costly/flaky to run on every `npm run check`. Verified it catches an injected regression (renamed a finding) before trusting it.
- [x] ~~Mechanical check that a `specs/<target>.plan.md` contains a well-formed `## Confidence Log`~~ (`checkConfidenceBlocks()` in `check-docs.ts`): the three fields present, `Confidence` an integer 1-10, per entry. Verified it actually catches a broken entry (out-of-range score, missing field) before trusting it. `specs/saucedemo.plan.md` backfilled with real, honestly-scored entries for the work already done.
- [x] ~~Mechanical check that `--allowed-origins` matches `docs/targets/REGISTRY.md`~~ (`checkAllowedOrigins()` in `check-docs.ts`): added an Origin column to the registry; every active target's origin must appear in all three MCP configs, and any origin in a config that isn't an active registry target is flagged as orphaned. Verified it catches an injected stale origin before trusting it. Closes the Phase 2 agnosticism gap above.
- [ ] **Open, not done today**: framework self-tests for the docs checker (`check-docs.ts`) itself are not persisted as an automated eval, unlike the guardrail checker's. Each new check above (`checkConfidenceBlocks`, `checkAllowedOrigins`) was manually verified during this session to catch an injected failure and then restored - real evidence it works today, but not a standing regression test the way `check-rules.eval.ts` is. `check-docs.ts`'s functions read hardcoded relative paths directly rather than taking an injectable base directory, which would need a small refactor first to test cleanly - deferred rather than rushed.
- [x] ~~Cleanup pass against `INTENT.md`: README.md's entire "6-phase workflow" section, its project-structure listing, skills/agents table, and "Adapting this to your own application" guide all still described the retired process as current - rewritten to the Stage 0-5 pipeline. `CORE_PRINCIPLES.md`'s one stray "Phase 2" reference fixed to "Stage 2."~~ Swept the rest of the repo (CI workflow, `.mcp.json`/`.agents`/`.codex` configs, orphaned files, empty directories, TestDino leftovers) - nothing else found.

## `PLAN.md` Phase 4 — Visual regression suite (Verified, complete with one open item)

- [x] ~~Scope agreed: which pages, which viewports, how many baseline variants.~~
      5 scenarios (`SC-011`-`SC-015`: login, inventory, cart, checkout info step,
      checkout overview step) x 3 projects (`desktop-chrome`/`tablet`/`mobile`,
      the latter two `webkit`-engine per their iPad/iPhone device presets) = 15
      screenshots. New Risk `R-008` added to `specs/saucedemo.plan.md`.
- [x] ~~Specs written with committed, Docker-generated baselines.~~
      `tests/visual/{login,inventory,cart,checkout}.spec.ts`. Baselines generated
      via `docker compose run --rm visual-tests npm run test:visual --
--update-snapshots` (approval asked and given first, per
      `CORE_PRINCIPLES.md` §6). `docker-compose.yml`'s `visual-tests` service
      pinned to `platform: linux/amd64` so baselines generated on an Apple
      Silicon (arm64) laptop still match CI's amd64 `ubuntu-latest` runners -
      verified by re-running the suite against the committed baselines
      afterward: 15/15 passed. `npm run check` passes.
- [x] ~~Wired into the CI matrix.~~ `.github/workflows/playwright.yml`'s
      `test` job matrix: new `visual` entry, `browser: 'chromium webkit'` (both
      engines needed - see above). Verified on PR #5 (`gh pr checks`):
      `test (visual, visual, chromium webkit)` passed on a real
      `ubuntu-latest` run, alongside every other existing leg - not just a
      local Docker pass.

## `PLAN.md` Phase 5 — Database testing, scoping only (Verified, complete)

- [x] ~~Decide: bring a concrete target with real DB access, or document a
      through-the-API/UI data-integrity testing strategy.~~ Decided:
      document the strategy (`CORE_PRINCIPLES.md` §8, "Database Testing
      Without Direct Access") - no new target brought in this pass. Covers
      round-trip persistence, isolation under concurrency (referencing the
      already-proven `isolatedUser` pattern), referential integrity observed
      indirectly, and idempotency - explicitly not SQL/schema/transaction
      testing. Gated to be superseded the moment Stage 0 Intake confirms a
      target with real DB access, per `INTENT.md` §8. Zero new test files,
      zero new target facts - `npm run check` passes.

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
