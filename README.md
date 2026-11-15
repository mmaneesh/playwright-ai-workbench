# Playwright AI Workbench

An agentic QA framework (`docs/INTENT.md`): bring any application, API, or database and any LLM, and the agent does what a good QA engineer does — intake, explore, scenario, test case, automate, review — with a human in the loop only where a real decision is being made. It is a complete, working reference implementation covering UI, API, visual, and accessibility/SEO/performance testing, with first-class support for AI coding agents (Claude Code, Codex, Antigravity) to do the work.

It currently runs against two public demo targets (a sample e-commerce storefront and a bill-pay API) so anyone can clone it and get a fully green run with zero configuration.

## Table of contents

- [What this repo can do](#what-this-repo-can-do)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Environment configuration](#environment-configuration)
- [Every command, explained](#every-command-explained)
- [The four test suites](#the-four-test-suites)
- [Code quality and guardrails](#code-quality-and-guardrails)
- [Git hooks](#git-hooks)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
- [Docker](#docker)
- [The agentic pipeline](#the-agentic-pipeline)
- [AI client setup (Claude Code / Codex / Antigravity)](#ai-client-setup-claude-code--codex--antigravity)
- [Skills and agents](#skills-and-agents)
- [Naming conventions](#naming-conventions)
- [Adapting this to your own application](#adapting-this-to-your-own-application)
- [Authentication (storageState)](#authentication-storagestate)
- [Troubleshooting](#troubleshooting)
- [Recommendations / roadmap](#recommendations--roadmap)

## What this repo can do

- **Run four independent test suites** against a web app and its API: functional UI/E2E, API contract, visual regression, and accessibility/SEO/web-vitals audits — each with its own Playwright config, browser matrix, and reporter.
- **Switch target environments atomically** (`dev`, `stg`, `uat`, `prod`) with one command, no manual `.env` editing.
- **Validate every API response against a strict Zod schema** with zero `any` types, so a contract break fails loudly and typed.
- **Enforce code-quality rules mechanically**, not just by convention: a custom guardrail checker blocks `waitForTimeout`, XPath selectors, the `any` type, pseudo-Gherkin steps, and raw Playwright imports in UI specs, both as a pre-write hook for AI agents and as a CI gate.
- **Run everywhere identically**: locally, in Docker (for cross-platform visual consistency), or in GitHub Actions CI.
- **Carry a full audit trail of _why_ the test suite looks the way it does** — a single living spec file per target (`specs/<target>.plan.md`: intake, findings, risk-ranked scenarios, test cases), a defect ledger, and a bounded decision/lesson log — one fact, one owner, no five-table fan-out to keep in sync by hand.
- **Let an AI coding agent do the work, with a human checkpoint only where a real decision is being made** — Claude Code, Codex, and Antigravity are all pre-configured with project instructions and an isolated Playwright MCP browser server, plus a packaged skill per pipeline stage, an `explorer` agent (browser tools only, cannot write test code), and a `verifier` agent (read-only, cannot fix code or give the final merge decision).

## Prerequisites

| Requirement                    | Version                                                     | Why                                                                                     |
| :----------------------------- | :---------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org)  | `>= 22` (repo is pinned to `24` via `.node-version` and CI) | Runtime for Playwright, TypeScript tooling, and all scripts                             |
| npm                            | Bundled with Node                                           | Package manager and script runner                                                       |
| Git                            | Any recent version                                          | Version control, Husky hooks                                                            |
| Internet access                | —                                                           | The demo targets (Sauce Demo, Gaurav Khurana bill-pay API) are live public services     |
| Docker (optional)              | Any recent version, with a running Linux engine             | Only needed for `npm run test:visual:docker` or container-based CI parity               |
| An AI coding client (optional) | Claude Code / Codex / Antigravity                           | Only needed if you want the AI-assisted workflow; running tests needs no AI or API keys |

## Quick start

```sh
git clone <your-fork-or-this-repo-url>
cd playwright-ai-workbench

# 1. Install dependencies (installs Playwright browsers' npm package, sets up Husky)
npm ci

# 2. Install the actual browser binaries Playwright drives
npx playwright install --with-deps

# 3. Pick a target environment (copies env-config/<name>.env -> .env)
npm run env:config -- saucedemo

# 4. Run the full quality gate (lint, format check, typecheck, guardrails, docs check)
npm run check

# 5. Run the suites
npm run test:ui      # UI/E2E — Chromium, Firefox, WebKit
npm run test:api     # API contract tests
npm run test:audit   # Accessibility, SEO, Web Vitals
npm run test:visual  # Visual regression (opt-in, needs approved baselines)
```

If you only run `npm run test`, it executes UI → API → Audit in sequence (visual is intentionally excluded — see [The four test suites](#the-four-test-suites)).

To see the HTML report for the last UI run:

```sh
npm run report
# or for another suite:
npx playwright show-report playwright-report/api
npx playwright show-report playwright-report/visual
npx playwright show-report playwright-report/audit
```

## Project structure

```
playwright-ai-workbench/
├── AGENTS.md                  # Entry point for any AI agent: read order + rules that cannot wait
├── CLAUDE.md / GEMINI.md      # Thin client-specific stubs that point at AGENTS.md
├── CORE_PRINCIPLES.md         # The actual code rules: commands, standards, guardrails, naming, approvals
├── docs/INTENT.md                  # What this project is for and why - the final word if anything conflicts
├── docs/PLAN.md                    # The concrete, phased build plan derived from docs/INTENT.md
├── specs/                     # One living plan.md per target: intake, findings, scenarios, test cases
├── config/                    # One independent Playwright config per suite
│   ├── playwright.ui.config.ts
│   ├── playwright.api.config.ts
│   ├── playwright.visual.config.ts
│   └── playwright.audit.config.ts
├── docs/
│   ├── LOG.md                 # Bounded, framework-wide decision (D-nnn) and lesson (L-nnn) log
│   ├── PLAN-LEDGER.md          # What's actually been verified vs. just planned
│   ├── templates/             # Shared vocabulary (IDs, priority, SFDIPOT, oracles) + defect record format
│   └── targets/               # REGISTRY.md (every target) + <target>-defects.md (that target's ledger)
├── env-config/                 # Plain .env templates per environment (dev/stg/uat/prod)
├── fixtures/                   # Composable Playwright fixtures (dependency injection)
│   ├── ui.fixture.ts           # Injects page objects and components
│   ├── api.fixture.ts          # Injects an authenticated APIRequestContext
│   └── index.ts                # Merges ui + api fixtures into one `test`
├── helpers/                     # Small shared utilities (e.g. openRoute — navigate + wait for a ready marker)
├── page-objects/
│   └── pages/                   # One class per page: locators + actions, no assertions
│       (a components/ folder for reusable UI pieces shared across pages appears
│       the moment one is needed - none currently is for Sauce Demo)
├── scripts/
│   ├── guardrails/
│   │   ├── check-rules.ts       # Mechanical anti-pattern checker (also runs as a pre-write AI hook)
│   │   └── check-docs.ts        # Mechanical documentation-consistency checker
│   └── skills/sync-skills.ts    # Syncs .agents/skills/ -> .claude/skills/
├── test-data/                   # Synthetic data factories / typed constants (populated as needed)
├── tests/
│   ├── ui/                      # UI/E2E specs
│   ├── api/                     # API contract specs
│   ├── visual/                  # Visual regression specs
│   └── audit/                   # Accessibility / SEO / Web Vitals specs
├── types/schemas/               # Zod schemas (one per API resource) + inferred TS types
├── .agents/                     # Source of truth for skills (SKILL.md) and the explorer agent
├── .claude/, .codex/             # Generated/derived client configs — do not hand-edit .claude/skills/
├── .github/workflows/playwright.yml   # CI pipeline
├── Dockerfile, docker-compose.yml     # Containerized, platform-consistent execution
└── .mcp.json                    # Claude Code's Playwright MCP browser server config
```

## Environment configuration

Each Playwright config reads `UI_BASE_URL` / `API_BASE_URL` straight from `process.env` (loaded via `dotenv/config`). There is no custom environment resolver — just plain `.env` files you select from.

| Template                                      | Target                                                                                                                               |
| :-------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `env-config/dev.env`                          | Sauce Demo + bill-pay API (default local dev)                                                                                        |
| `env-config/stg.env` / `uat.env` / `prod.env` | Same Sauce Demo + bill-pay API values as `dev.env` today — overwrite with your own per-environment URLs once you bring a real target |

Switch environments:

```sh
npm run env:config -- dev   # or stg / uat / prod
```

Override a single URL for one run without touching `.env` (shell/CI variables always win over `.env`):

```sh
# macOS/Linux
UI_BASE_URL=https://your-test-app.example npm run test:ui

# PowerShell
$env:UI_BASE_URL = 'https://your-test-app.example'
npm run test:ui
Remove-Item Env:UI_BASE_URL
```

**Rules:**

- Never commit real credentials into a template — the committed `env-config/*.env` files only ever contain public demo values. Use the ignored root `.env` or CI secrets for anything private.
- `.env` and `.env.*` are gitignored (except `.env.example`, if you add one).
- TLS verification stays enabled; do not disable it to work around a private certificate — fix the trust chain instead.
- Selecting `prod` does **not** authorize mutating test runs against it. Get explicit approval before running anything that writes data to a production target.

## Every command, explained

| Command                       | What it does                                                                                                                           |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                      | Clean install from `package-lock.json`; also triggers Husky's `prepare` hook                                                           |
| `npm run env:config -- <env>` | Copies `env-config/<env>.env` → `.env`                                                                                                 |
| `npm run lint`                | ESLint over the whole repo, zero warnings allowed                                                                                      |
| `npm run lint:fix`            | ESLint with autofix applied                                                                                                            |
| `npm run format`              | Prettier, writes formatting fixes                                                                                                      |
| `npm run format:check`        | Prettier, check-only (used by `check` and CI)                                                                                          |
| `npm run typecheck`           | `tsc --noEmit` — strict TypeScript, no emitted files                                                                                   |
| `npm run guardrails:check`    | Runs the custom anti-pattern scanner (`scripts/guardrails/check-rules.ts`) over staged/modified files                                  |
| `npm run docs:check`          | Runs the documentation-consistency checker (`scripts/guardrails/check-docs.ts`) — file refs, section refs, handoff chain, log rules    |
| `npm run skills:sync`         | Regenerates `.claude/skills/` from `.agents/skills/` (the source of truth)                                                             |
| `npm run check`               | The full gate: `lint && format:check && typecheck && guardrails:check && docs:check` — **run this before considering any change done** |
| `npm run test:ui`             | UI/E2E suite — Chromium, Firefox, WebKit                                                                                               |
| `npm run test:api`            | API contract suite                                                                                                                     |
| `npm run test:visual`         | Visual regression suite (desktop/tablet/mobile viewports)                                                                              |
| `npm run test:visual:docker`  | Same, inside the `visual-tests` Docker service for consistent rendering                                                                |
| `npm run test:audit`          | Accessibility (axe-core), Web Vitals, and SEO audits                                                                                   |
| `npm test`                    | `test:ui && test:api && test:audit` (visual is excluded by design — see below)                                                         |
| `npm run test:ci`             | Same as `npm test`, but forces `CI=true` consistently across Windows/macOS/Linux via `cross-env`                                       |
| `npm run report`              | Opens the last UI run's HTML report                                                                                                    |
| `npm run precommit`           | `lint-staged && typecheck && guardrails:check && docs:check` — what the Husky pre-commit hook actually runs                            |

## The four test suites

Each suite has its own Playwright config under `config/`, its own `test-results/<suite>/` and `playwright-report/<suite>/` output, and its own browser/project matrix — they never share state and can be run independently.

### UI (`tests/ui/`, `config/playwright.ui.config.ts`)

Full functional/E2E coverage across **Chromium, Firefox, and WebKit**, against [Sauce Demo](https://www.saucedemo.com) (`tests/ui/saucedemo/`). Role-first locators (`getByRole`) where the target exposes clean accessible names, `data-test`-attribute locators as a documented exception where it doesn't (confirmed live against the site), fixture-injected page objects (`@fixtures`), every action/assertion wrapped in `test.step(...)`, and every test tagged with a scenario ID (`SC-00x`) plus a priority (`@smoke`, `@regression`, `@edge`). `login.spec.ts` tests the login flow itself (fresh login per test, by design); everything else that needs a signed-in session uses `*.authenticated.spec.ts` + real `storageState` (see [Authentication](#authentication-storagestate)) instead of repeating login in every file. Currently: 7 scenarios, 22 tests across 7 projects (3 anonymous browsers + `setup` + 3 authenticated browsers).

### API (`tests/api/`, `config/playwright.api.config.ts`)

Pure `APIRequestContext`-based contract tests against the bill-pay demo API: health checks, catalog/category pagination, auth negative cases (401/404), multipart file upload, rate-limit/latency resiliency, and a full 6-step stateful billing lifecycle (discover biller → create bill → fetch payment method → pay → verify status → validate receipt). Every response is validated against a Zod schema in `types/schemas/`. Currently: 13 tests.

### Visual (`tests/visual/`, `config/playwright.visual.config.ts`)

Snapshot regression, configured for **desktop (1280×720), tablet (iPad), and mobile (iPhone 14)** viewports, with `maxDiffPixelRatio: 0.02` / `threshold: 0.05` tolerances and animations disabled for determinism. **Opt-in and excluded from `npm test`** because baseline snapshots need a human-approved first run and are platform/font-rendering sensitive — run it explicitly, and prefer the Docker variant (`npm run test:visual:docker`) for reproducible baselines across machines. Currently: 5 scenarios (login, inventory, cart, checkout x2) across all 3 viewports, 15 screenshots total, baselines generated and verified via Docker (pinned to `linux/amd64` to match CI), and a dedicated `visual` leg in the CI matrix.

### Audit (`tests/audit/`, `config/playwright.audit.config.ts`)

Domain-agnostic checks that work on virtually any web page without app-specific locators — deliberately conservative about what counts as a universal requirement, not just what happened to be true of one target:

- **Accessibility** — full `@axe-core/playwright` scan (WCAG 2.1 A/AA + 2.1 A/AA rule sets), zero rule suppressions.
- **Web Vitals** — LCP, CLS, FCP, TTFB via the browser's native `PerformanceObserver`, checked against budgets.
- **SEO** — title/meta description/viewport, image `alt` coverage, below-the-fold lazy-loading (vacuously true when a page has no below-fold images, e.g. a login form). Open Graph metadata is intentionally **not** asserted: it's good practice for a shareable public page, not a universal requirement — a page can legitimately opt out via `<meta name="robots" content="noindex">`.

Currently: 7 tests. Note axe-core catches a meaningful but partial slice of real-world accessibility issues — it is not a substitute for a manual keyboard-navigation pass on critical journeys.

## Code quality and guardrails

Beyond standard linting/formatting/type-checking, two **mechanical** checkers enforce rules that would otherwise only live in a document someone forgets to read:

- **`scripts/guardrails/check-rules.ts`** blocks, with a file:line pointer: `page.waitForTimeout()` (hard sleeps), XPath/`xpath=` locators, the TypeScript `any` type, `GIVEN/WHEN/THEN` pseudo-Gherkin inside `test.step`, and raw `@playwright/test` imports in `tests/ui/*.spec.ts` (must go through `@fixtures` instead). It runs:
  - as a **Claude Code `PreToolUse` hook** (`.claude/settings.json`) on every `Write`/`Edit`/`MultiEdit` — but this only sees direct file-edit tool calls, **not** shell-based writes (`sed`, heredocs, etc.) from any agent;
  - as part of `npm run check`, which is the gate that actually covers every path, AI or human.
- **`scripts/guardrails/check-docs.ts`** keeps the documentation honest: verifies every file/section cross-reference resolves, every MCP server name referenced by an agent actually exists in `.mcp.json`, the phase-template handoff chain is well-formed, and `docs/LOG.md` obeys its own rules (status values, the ~30-entry cap).

Both run as part of `npm run check` and in CI — neither is advisory.

## Git hooks

Husky installs a `pre-commit` hook on `npm install`/`npm ci` (via the `prepare` script). It runs `npm run precommit` → `lint-staged` (ESLint + Prettier on staged files) → `typecheck` → `guardrails:check` → `docs:check`. It does **not** run browser tests and does **not** silently rewrite your staged files — fix any reported failure with the explicit commands above, then re-stage.

## CI/CD (GitHub Actions)

`.github/workflows/playwright.yml` runs on every push to `main`/`master`, every pull request, and on manual dispatch, as three jobs:

1. **`check`** — checkout, Node 24, `npm ci`, `npm run check` (the full quality gate). Nothing else runs until this passes.
2. **`test`** — an 8-way matrix (`ui-chromium`, `ui-firefox`, `ui-webkit`, `api`, `audit`, `ui-chromium-authenticated`, `ui-firefox-authenticated`, `ui-webkit-authenticated`) running in parallel, each installing only the browser binary it actually needs (the `api` leg installs none at all) via a `~/.cache/ms-playwright` cache keyed on `package-lock.json`. Each leg uploads its own `playwright-evidence-<name>` artifact (14-day retention), even if cancelled. `fail-fast: false`, so one suite failing doesn't hide results from the others.
3. **`independence-check`** — runs the UI suite with `--repeat-each=2 --workers=4 --retries=0`, mechanically proving the "every test runs alone and in any order" claim in `CORE_PRINCIPLES.md` rather than just asserting it.

The visual suite is intentionally still not wired into CI (baseline approval is a human step — see [Recommendations](#recommendations--roadmap)).

## Docker

```sh
docker compose build
docker compose run --rm tests              # UI + API + Audit
docker compose run --rm tests npm run test:api   # one suite
npm run test:visual:docker                 # the dedicated visual-tests service
```

The image pins `mcr.microsoft.com/playwright:v1.63.0-noble` — keep this tag and the `@playwright/test` devDependency version in lockstep when upgrading. Compose mounts `playwright-report/` and `test-results/` back into the repo so you can inspect them after the container exits. No application service is started — you must point `UI_BASE_URL`/`API_BASE_URL` at something reachable from the container. Do not bake private credentials or certificates into the image; use Compose environment variables or CI secrets instead.

## The agentic pipeline

This is what makes the framework "AI-first" rather than just "AI-compatible": every target moves through six stages, with one living spec file per target (`specs/<target>.plan.md`) as the single source of truth — not six separately-tracked workbook sections (`docs/INTENT.md` §1, §4):

| #   | Stage               | Question it answers                               | Done when                                                                                |
| :-- | :------------------ | :------------------------------------------------ | :--------------------------------------------------------------------------------------- |
| 0   | **Intake**          | What's being tested, and what's in scope?         | Surfaces, auth, constraints and scope are answered and recorded                          |
| 1   | **Explore**         | What is the application, really?                  | All 7 SFDIPOT dimensions, all 3 tours, all 11 oracles checked against a live observation |
| 2   | **Scenarios**       | What should we check, and why?                    | Every risk-bearing finding has a scenario, a charter, or a reasoned "Not covered"        |
| 3   | **Test cases**      | What are the concrete steps and expected results? | Every automated scenario has user-level steps and concrete data, not placeholders        |
| 4   | **Test automation** | How is each check written?                        | Every test case has a matching spec, green or an expected known-defect failure           |
| 5   | **PR review**       | Is it fit to merge?                               | Findings and a recommended verdict — **a human always makes the final call**             |

Every stage also reports a confidence score against its own Done criteria
(rubric in `docs/templates/README.md`) — `Confidence >= 8` and
`Unknowns: none` is what "Done" actually means; anything less is that
stage's own stop-and-ask condition, made visible instead of left to prose.

Supporting documents, each with exactly one owner so facts never need to be copied between them:

- **`docs/INTENT.md`** — what this project is for and why; wins if anything else conflicts with it.
- **`AGENTS.md`** — the single entry point for any agent, any model: the rules that cannot wait.
- **`CORE_PRINCIPLES.md`** — the actual code rules (commands, standards, guardrails, structure, naming, approval gates).
- **`docs/templates/README.md`** — the shared vocabulary: IDs, priority math, SFDIPOT, the 3 tours, the 11 oracles, test techniques, automation-decision scoring, the confidence rubric.
- **`specs/<target>.plan.md`** — the living plan for one target (Stages 0-3); **`docs/targets/<target>-defects.md`** — its defect ledger.
- **`docs/targets/REGISTRY.md`** — every target this repo has been pointed at, and the keyword list that keeps the process layer agnostic (`npm run docs:check` enforces it).
- **`docs/LOG.md`** — a deliberately bounded (~30 active entries) log of framework-wide decisions (`D-nnn`) and lessons learned from mistakes (`L-nnn`); entries get promoted into a permanent rule or retired and deleted — this file is never allowed to become an unbounded archive.
- **`docs/PLAN-LEDGER.md`** — progress against `docs/PLAN.md`, one checkbox per item, kept current in the same commit as the work.

**Hard rules that govern this process** (see `AGENTS.md`, `docs/INTENT.md` §3):

- The decision layer always stays with a human; agents recommend, never give the final merge decision.
- Only _agreed_ facts get written down — discussion is not approval.
- Every fact has exactly one owner; a later stage references it, never copies it.
- A stage either completes or stops with a precise, actionable reason why not — never silent, unexplained partial work.
- The process layer itself (this file, `CORE_PRINCIPLES.md`, every agent/skill) must never name a specific target — checked by `npm run docs:check`.

## AI client setup (Claude Code / Codex / Antigravity)

AI is entirely optional for running tests — none of the suites need a provider API key. If you want the agent-driven workflow:

| Client      | Project instructions      | MCP config                |
| :---------- | :------------------------ | :------------------------ |
| Claude Code | `CLAUDE.md` → `AGENTS.md` | `.mcp.json`               |
| Codex       | `AGENTS.md`               | `.codex/config.toml`      |
| Antigravity | `GEMINI.md` / `AGENTS.md` | `.agents/mcp_config.json` |

Each MCP template launches the same pinned, **isolated, headless** `@playwright/mcp@0.0.83` browser server, scoped to the two public demo origins via `--allowed-origins`. Open the project in your client, approve workspace trust, and check the server connected (Claude Code: `/mcp`; Antigravity: its MCP Servers view). Origin filtering is a convenience, not a security boundary — keep normal tool-permission prompts on, and treat anything the browser reads as untrusted content. Before pointing any client at a different target, update the allowed origins deliberately and confirm you're authorized to test it.

## Skills and agents

`.agents/skills/` is the source of truth; `.claude/skills/` is a generated, verified copy (`npm run skills:sync`, cross-checked by `docs:check`) — **never hand-edit the generated copy**.

| Skill          | Stage(s)                          | Dispatches to                         |
| :------------- | :-------------------------------- | :------------------------------------ |
| `explore`      | 0-1 — Intake, Explore             | the `explorer` agent                  |
| `scenarios`    | 2-3 — Scenarios, Test cases       | (runs directly, no isolation benefit) |
| `test-spec`    | 4 — Test automation               | (runs directly)                       |
| `pr-review`    | 5 — PR review                     | the `verifier` agent                  |
| `claims-audit` | Maintenance, not a pipeline stage | (runs directly)                       |

Each skill is deliberately "thin" — it points at the real thing (an agent, or `CORE_PRINCIPLES.md` + the target's spec file) and adds no rules of its own, so rules can never drift.

Two standing agents exist, both scoped to where isolation genuinely earns its keep (`D-004`, `docs/INTENT.md` §3): `explorer` (`.agents/agents/explorer.md` — browser tools only, cannot write test code) and `verifier` (`.agents/agents/verifier.md` — read-only, cannot fix code or give the final merge decision). Agents are added only where restricted permissions matter, not by default — every other stage runs in whichever agent is already working.

### Running `claims-audit`

This one isn't invoked as part of the normal pipeline — run it ad hoc,
whenever you want a reality-check pass: `/claims-audit` in Claude Code (or
the equivalent in Codex/Gemini), or just ask your AI client to follow
`.agents/skills/claims-audit/SKILL.md`. Pick one target per run (it names
five: `AGENTS.md`, `CORE_PRINCIPLES.md`, `docs/INTENT.md`, `README.md`, or
`docs/LOG.md`'s own "Rules for this file" section) and rotate through them
over time rather than running the same one repeatedly. It only reports
findings with evidence — it never fixes anything unilaterally (`D-017`); you
decide what to act on.

## Naming conventions

| Element     | Convention                     | Example                        |
| :---------- | :----------------------------- | :----------------------------- |
| Directories | `kebab-case`                   | `page-objects/`, `test-data/`  |
| Pages       | `kebab-case` + `.page.ts`      | `login.page.ts`                |
| Components  | `kebab-case` + `.component.ts` | `header.component.ts`          |
| Specs       | `kebab-case` + `.spec.ts`      | `checkout.spec.ts`             |
| Fixtures    | `kebab-case` + `.fixture.ts`   | `ui.fixture.ts`                |
| Schemas     | `kebab-case` + `.schema.ts`    | `payment.schema.ts`            |
| Classes     | `PascalCase`                   | `LoginPage`, `HeaderComponent` |
| Locators    | `camelCase` + element suffix   | `emailInput`, `submitButton`   |
| Constants   | `UPPER_SNAKE`                  | `DEFAULT_TIMEOUT`              |

Full rules, including test-structure conventions (one scenario per test, `test.describe` grouping, locator precedence order) live in `CORE_PRINCIPLES.md`.

## Adapting this to your own application

This framework is intentionally agnostic at the architecture level (configs, guardrails, CI shape, the agentic pipeline, the generic audit suite — `docs/INTENT.md` §2) but **not** magically portable at the test level — swapping `UI_BASE_URL`/`API_BASE_URL` alone does not adapt page objects, locators, or scenarios to a different application. To point this at your own app:

1. Run `npm run env:config -- stg` (or add a new `env-config/<yourenv>.env`) and set real URLs.
2. Add your target to `docs/targets/REGISTRY.md` and its origin to `.mcp.json`'s `--allowed-origins` (and the `.agents`/`.codex` equivalents).
3. Start the `/explore` skill: it begins with Stage 0 Intake (what's being tested, surfaces, auth, scope), then explores your real app — do not reuse the Sauce Demo/bill-pay scenarios.
4. `/scenarios` and `/test-spec` build your own `specs/<yourtarget>.plan.md`, page objects, and specs from what Stage 1 actually found.
5. Delete or archive the demo-specific specs, page objects, and schemas once your own suite covers the same ground.
6. If your app sits behind authentication, see [Authentication (storageState)](#authentication-storagestate) below.

## Authentication (storageState)

Sauce Demo is entirely auth-gated — nothing works without logging in first — so the UI suite logs in **once** and reuses that session everywhere else, instead of every test repeating the login flow and its credentials.

- **`tests/ui/saucedemo/auth.setup.ts`** — runs once per suite execution: logs in as `standard_user` via `page-objects/pages/saucedemo-login.page.ts` (credentials from `test-data/saucedemo-accounts.data.ts` — published by Sauce Labs for exactly this purpose, safe to commit), waits for the redirect to `/inventory.html`, and saves the session to `playwright/.auth/user.json` (gitignored, never committed). This runs unconditionally; there is nothing to gate, since the credentials are public.
- **`chromium-authenticated` / `firefox-authenticated` / `webkit-authenticated`** — each depends on `setup` and injects the saved session via `storageState` (one login covers all three browser engines, since `storageState` is just serialized cookies/origin storage). Any spec that needs to already be logged in goes in a file named `*.authenticated.spec.ts`; it runs only in these projects, never in the anonymous `chromium`/`firefox`/`webkit` ones.
- **`tests/ui/saucedemo/login.spec.ts`** is the one file that deliberately does **not** use this pattern — its whole job is testing the login flow itself (`SC-001` valid login, `SC-002` locked-out account), so it logs in fresh inside each test by design, not as an oversight.

To point this framework at your own auth-gated application: write its real login flow into a new `*.setup.ts` file (following `auth.setup.ts`'s shape), read its real credentials from environment variables instead of a committed constants file, and add `*.authenticated.spec.ts` files for anything that needs a signed-in session. If login fails (wrong credentials, account locked), the setup test fails loudly with a clear error rather than silently producing an empty session.

## Troubleshooting

| Symptom                                                            | Likely cause                                                               | Fix                                                                                                                                      |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`/`npm run check` fails with a config-not-found error | A config file got mangled (e.g. renamed to `.txt` by an email/zip scanner) | Confirm `eslint.config.mjs` and `.husky/pre-commit` exist as real files, not `.txt`                                                      |
| Browser tests fail immediately with a launch error                 | Playwright browser binaries not installed                                  | `npx playwright install --with-deps`                                                                                                     |
| Tests hit the wrong URL                                            | No `.env` selected, or a shell variable is overriding it                   | `npm run env:config -- <env>`; check `echo $UI_BASE_URL` / `$env:UI_BASE_URL` isn't set                                                  |
| Visual tests fail on first run                                     | No baseline snapshots exist yet                                            | Run once locally/in Docker with `--update-snapshots`, get human approval, commit the baselines (see `CORE_PRINCIPLES.md` approval gates) |
| Husky hook doesn't run on commit                                   | Dependencies installed with `--ignore-scripts`                             | Run `npm install` (or `npm ci` without `--ignore-scripts`) at least once to let `prepare` register the hook                              |
| Docker visual tests render slightly differently than local         | Host OS font/GPU rendering differences                                     | Prefer `npm run test:visual:docker` for anything used as a shared baseline                                                               |

## Recommendations / roadmap

The sections above describe what exists today. The items below are my own assessment of what should change next to take this from a well-structured personal framework to one that holds up under sustained, multi-application, team-scale use — not changes that have been made yet.

**Near-term (structural):**

- Add a flaky-test quarantine mechanism for a test that's unreliable through no one's fault yet, distinct from a confirmed product defect (which already has a rule — see `CORE_PRINCIPLES.md` section 7 "Known defects" and "Eventual consistency"): a visible tag, a tracked flake-rate metric, and a fix-vs-delete rule.
- Wire the visual suite into CI once a baseline-approval story exists (the `test` matrix currently covers UI/API/audit, including authenticated checkout/cart flows, but not visual).

**Medium-term (governance):**

- Move the guardrail checker from regex-based matching to an AST-based check (e.g. `ts-morph`) as the ruleset grows, to avoid false positives/negatives in string literals and reformatted code.
- Align dependency, container and browser versions with an explicit update workflow, rather than ad hoc bumps.
- Verify the agnostic pipeline (`docs/INTENT.md` §2) against a target this repo hasn't tried yet — ideally one with real database access, to retire §8's "Database: aspirational" line with a real example instead of a promise.

**Longer-term (maturity):**

- Define a secrets/credential-rotation strategy once real (non-demo) targets are in use.
- Define a test-data lifecycle/cleanup strategy for stateful API flows (the billing-lifecycle test currently has no visible teardown).
- Pair the automated axe-core accessibility scan with at least one scripted keyboard-navigation/focus-order check per critical journey — axe catches a meaningful but partial slice of real WCAG issues.
- Write an explicit visual-baseline governance policy: who approves a baseline change, where approved baselines are stored, and how cross-OS rendering drift is handled.
- Validate an optional GitHub issue / CI reporter integration, and do a final clean-clone verification pass once the pipeline above has a second real target to prove it against.

Load/stress testing, security penetration testing, and third-party reporting dashboards are deliberately **out of scope** for this framework rather than a gap — Playwright is not the right tool for the first two, and the project intentionally avoids adding paid reporting infrastructure until the suite's size actually demands it.
