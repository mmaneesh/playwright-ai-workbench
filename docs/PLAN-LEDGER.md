# Agreed Scope and Verification Ledger

Updated: October 29, 2026.

TestDino Demo Store was removed as a target on 2026-10-29 (all files, config and doc references deleted or repointed) in favor of Sauce Demo, a second target chosen to prove the framework and the `storageState` auth pattern against a genuinely different, auth-gated application. Phase entries below that reference TestDino describe work that happened and is retained for history, per `D-007`; they are not current state.

`PLAN.md` records the agreed scope. This ledger records evidence and outstanding work; implementation alone does not imply approval. The full roadmap is retained as agreed in architectural planning. Pending roadmap entries do not authorize implementation; review and approval are required before each later phase.

---

## Target Applications Registry

- **API Contract Target**: Gaurav Khurana Bill Payment API (`https://billpay-api.gauravkhurana-practice-api.workers.dev`)
  - Auth: `X-API-Key: demo-api-key-123`
- **Primary UI / Visual / Audit Target**: Sauce Demo / Swag Labs (`https://www.saucedemo.com`)
  - Configured in `env-config/saucedemo.env` and active `env-config/dev.env` (`.env`)
  - Workbook: [`docs/targets/saucedemo.md`](targets/saucedemo.md); ledger: [`docs/targets/saucedemo-defects.md`](targets/saucedemo-defects.md)
- **Archived UI Target**: LambdaTest eCommerce Playground (`https://ecommerce-playground.lambdatest.io`)
  - Preserved in `env-config/lambdatest.env` for environment toggling via `npm run env:config -- lambdatest`; never exercised by any current spec

---

## Phase 1 — Foundations Status (Verified)

- [x] ~~P1.1 Authoritative blueprint: `CORE_PRINCIPLES.md` defining Commands, Code Standards, Guardrails, Folder Structure, Naming Conventions, and Workflow & Approvals.~~ Implemented at repository root with all 6 core sections.
- [x] ~~P1.2 Signal-only orchestrators: Tabular `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md` free from task checklists and prose filler.~~ Implemented across all 3 AI entrypoints with dense tabular quick-reference format.
- [x] ~~P1.3 Suite configurations: 4 independent configs (`playwright.ui.config.ts`, `playwright.api.config.ts`, `playwright.visual.config.ts`, `playwright.audit.config.ts`).~~ Verified: test discovery listed all suites cleanly across all 4 configs without path prefixes.
- [x] ~~P1.4 Environment management: Atomic `env:config` (`dev`, `stg`, `uat`, `prod`, `saucedemo`, `lambdatest`) with fallback defaults.~~ Verified: `npm run env:config -- <env>` copies templates cleanly to `.env`.
- [x] ~~P1.5 Single-stack guardrails: Pure TypeScript rule checker (`scripts/guardrails/check-rules.ts`) blocking forbidden anti-patterns (`waitForTimeout`, XPath, `any`, untyped JSON, pseudo-Gherkin).~~ Verified: executed via `tsx` with 0 violations; wired as a Claude Code PreToolUse hook.
- [x] ~~P1.6 Docker setup: `Dockerfile` and `docker-compose.yml` for containerized visual snapshot execution.~~ Configured with dedicated `visual-tests` service and workspace volume mounting.
- [x] ~~P1.7 Package and quality tooling: Strict TypeScript path aliases, ESLint with `eslint-plugin-playwright`, Prettier, Husky, lint-staged.~~ Verified: `npm run check` passed with exit code 0.
- [x] ~~P1.8 Directory structure: `page-objects/` (pages & components), `fixtures/`, `tests/` (ui, api, visual, audit), `test-data/`, `types/`, `helpers/`.~~ Standardized on kebab-case directories.
- [x] ~~P1.9 Foundations verification: `npm run check`, suite discovery across all 4 configs, and atomic env switching.~~ Fully verified on local environment.

---

## Phase 3 — Authentication, API Contracts, and Full-Stack Data Patterns (Verified)

- [x] ~~P3.1 Contract validation with inferred runtime types and useful errors.~~ Implemented comprehensive runtime Zod schemas in `types/schemas/` (`health.schema.ts`, `biller.schema.ts`, `bill.schema.ts`, `payment.schema.ts`, `file.schema.ts`, `error.schema.ts`, `common.schema.ts`) with zero `any`.
- [x] ~~P3.2 Independent API suite execution & token handling.~~ Implemented `fixtures/api.fixture.ts` providing `authedRequest` with API key headers.
- [x] ~~P3.3 Full API contract test suite (13/13 passing in ~11.5s via `npm run test:api`).~~
  - [`health.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/api/health.spec.ts): Unauthenticated service health verification.
  - [`categories.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/api/categories.spec.ts): Reference categories contract.
  - [`billers.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/api/billers.spec.ts): Catalog pagination and category filtering.
  - [`bills.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/api/bills.spec.ts): User bill queries and individual ID contract.
  - [`auth.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/api/auth.spec.ts): Negative auth contracts (401 unauthenticated, 401 invalid token, 404 not found).
  - [`files.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/api/files.spec.ts): Multipart binary PDF upload and metadata contract.
  - [`resiliency.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/api/resiliency.spec.ts): Server latency delay contract and 429 rate limit error envelope.
  - [`billing-lifecycle.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/api/billing-lifecycle.spec.ts): 6-step stateful response chaining flow across Discover biller $\rightarrow$ Create bill $\rightarrow$ Fetch payment method $\rightarrow$ Pay bill $\rightarrow$ Verify `paid` status $\rightarrow$ Validate transaction receipt.

---

## Phase 4 — Visual, Accessibility, Component, and Advanced Coverage

### 4.1 Universal Domain-Agnostic Audit Suite (Verified with Honest Evidence)

- [x] ~~P4.1.1 WCAG 2.1 AA Accessibility Specification ([`tests/audit/accessibility.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/audit/accessibility.spec.ts)).~~
  - Full catalog of WCAG 2.1 AA success criteria across all 4 principles (Perceivable, Operable, Understandable, Robust) documented in test comments.
  - Full `@axe-core/playwright` scan (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) with zero rule suppressions or artificial exclusions.
  - Verified accessible programmatic names for interactive form inputs and valid `html[lang]`.
  - Honest diagnostic evidence: surfaced real application defects (contrast failures WCAG 1.4.3, unlabelled toggle WCAG 2.4.4/4.1.2, missing image alt WCAG 1.1.1).
- [x] ~~P4.1.2 Core Web Vitals & Performance Audit ([`tests/audit/web-vitals.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/audit/web-vitals.spec.ts)).~~
  - Browser-native `PerformanceObserver` measuring LCP, CLS, FCP, and TTFB against established performance budgets.
- [x] ~~P4.1.3 SEO & Image Lazy-Loading Audit ([`tests/audit/seo.spec.ts`](file:///c:/Mstar_Repositories/playwright-ai-workbench/tests/audit/seo.spec.ts)).~~
  - Structural SEO metadata validation (`<title>`, `<meta name="description">`, viewport, Open Graph).
  - Strict image `alt` verification (WCAG 1.1.1).
  - Below-the-fold image lazy loading verification (evaluating native `loading="lazy"` and deferred data-attributes / classes).

### 4.2 Outstanding Phase 4 & UI Reference Suite Items (Pending)

- [x] ~~P4.2.1 UI Reference Suite for TestDino Store (`tests/ui/`)~~ — scope reduced by user to a small best-practice reference set. Verified 2026-10-28: 3 specs (`home`, `products` x2) pass on chromium/firefox/webkit (9/9); `npm run check` exit 0. Login omitted (no published demo credentials). Old the-internet specs/page objects removed:
  - Modular components: `HeaderComponent` (search, navigation, cart badge), `ProductCardComponent` (pricing, rating, add to cart).
  - Modular pages: `HomePage` (featured products, banner navigation), `LoginPage` (authentication flow), `CartPage` (cart item verification).
  - End-to-end customer workflows with fixture-based DI and auto-waiting assertions.
- [ ] P4.2.2 Visual Regression Suite (`tests/visual/`):
  - Deterministic multi-viewport snapshots (`Desktop Chrome`, `Tablet`, `Mobile`).
  - Dynamic masking for animated carousel/banner widgets.
  - Dockerized execution (`npm run test:visual:docker`).

---

## Phase 5 — Supervised AI Harness, Specialist Roles, & Scaffolding Architecture (Partially Completed)

- [x] ~~P5.1 Standardized 6-Phase Engineering Lifecycle & Reusable Blueprint Templates (`docs/templates/`).~~
  - `01-EXPLORATION.template.md`: Exhaustive 12-point context-driven & technical reconnaissance checklist (Bach/Bolton SFDPOT & FEW HICCUPPS, Weinberg, Pradeep/Ajay, Hendrickson).
  - `02-SCENARIOS.template.md`: Risk-ranked scenario matrices (P0 Smoke, P1 Regression, P2 Edge) with Goldilocks & boundary heuristics (Kaner, Crispin/Gregory, Hendrickson, Jones).
  - `03-AUTOMATION-DESIGN.template.md`: Component/page encapsulation, scoped locators, and fixture DI wiring (Fowler, Stewart, Marcano/Palmer, Lushnikov, O'Brien).
  - `04-TEST-SPEC.template.md`: Role-first, web-first, flake-immune test implementation blueprint (Dodds, O'Brien, Judis, Hric, Bahmutov).
  - `05-EVIDENCE.template.md`: Raw terminal execution logs, root-cause triage, and RIMGEA bug advocacy (Kaner, Bolton).
  - `06-PR-REVIEW.template.md`: Continuous Delivery 4-in-1 quality gate verification and Test Desiderata review sign-off (Farley, Beck, Page).
  - `DEFECT_LEDGER.template.md`: Standardized RIMGEA defect tracking ledger with `FEW HICCUPPS` oracle classification and `DEF-XXX` IDs.
- [x] ~~P5.2 Single-Workbook Target Architecture (`docs/targets/`).~~
  - Unified living workbook: `docs/targets/<site>.md` containing all 5 phases in one cohesive document.
  - Dedicated living defect ledger: `docs/targets/<site>-defects.md` for objective RIMGEA bug reporting.
  - Initialized for the then-primary target (TestDino, structured with all 12 exploration points, and its defect ledger); both removed 2026-10-29 in favor of Sauce Demo's `docs/targets/saucedemo.md`.
- [x] ~~P5.3 Agent Skills Library.~~
  - Cross-platform AI skills created in `.agents/skills/` and `.claude/skills/`: `explore`, `scenarios`, `design`, `test-spec`, `evidence`, `pr-review`.
- [x] ~~P5.4 Autonomous Exploration Agent Definition & MCP Wiring.~~
  - Agent persona specification authored in `.agents/agents/explorer.md` and `.claude/agents/explorer.md`.
  - Antigravity subagent `explorer` registered with the full 12-point context-driven reconnaissance system prompt.
  - MCP authorization configured in `.mcp.json`, `.agents/mcp_config.json`, and `.codex/config.toml`, now allowing `https://www.saucedemo.com`.
- [x] ~~P5.5 Execution of Phase 1 Reconnaissance on TestDino~~ — scoped to Home and /products only (6 defects logged, now removed with the target). Original items:
  - Run browser exploration probe across all 12 points.
  - Populate Section 1 of the target workbook.
  - Record any observed bugs in the target's defect ledger.

---

## Remaining Phases (Pending Individual Approval)

### Phase 2 — Quality and Configuration Hardening

- [ ] P2.1 Define retry, flaky-test, and quarantine policy.
- [ ] P2.2 Add dependency/container/browser version alignment and update workflow.

### Phase 6 — Team Integrations & MCP Profiles

- [ ] P6.1 Validate optional GitHub issue / CI reporter integration.

### Phase 7 — Evaluations and Durable Feedback Loops

- [ ] P7.1 Benchmark scaffold adaptability when pointed at an arbitrary new domain.

### Phase 8 — Scalable Delivery & Release Readiness

- [ ] P8.1 Final clean-clone verification and scaffolding playbook documentation.
