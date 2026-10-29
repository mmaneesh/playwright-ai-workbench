# Playwright AI Workbench

An AI-first Playwright + TypeScript test automation framework. It is a complete, working reference implementation — not a template you fill in — covering UI, API, visual, and accessibility/SEO/performance testing, a documented 6-phase quality workflow, and first-class support for AI coding agents (Claude Code, Codex, Antigravity) to do the work under human review.

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
- [The AI-assisted 6-phase workflow](#the-ai-assisted-6-phase-workflow)
- [AI client setup (Claude Code / Codex / Antigravity)](#ai-client-setup-claude-code--codex--antigravity)
- [Skills and agents](#skills-and-agents)
- [Naming conventions](#naming-conventions)
- [Adapting this to your own application](#adapting-this-to-your-own-application)
- [Troubleshooting](#troubleshooting)
- [Recommendations / roadmap](#recommendations--roadmap)

## What this repo can do

- **Run four independent test suites** against a web app and its API: functional UI/E2E, API contract, visual regression, and accessibility/SEO/web-vitals audits — each with its own Playwright config, browser matrix, and reporter.
- **Switch target environments atomically** (`dev`, `stg`, `uat`, `prod`, plus the two demo targets `testdino` and `lambdatest`) with one command, no manual `.env` editing.
- **Validate every API response against a strict Zod schema** with zero `any` types, so a contract break fails loudly and typed.
- **Enforce code-quality rules mechanically**, not just by convention: a custom guardrail checker blocks `waitForTimeout`, XPath selectors, the `any` type, pseudo-Gherkin steps, and raw Playwright imports in UI specs, both as a pre-write hook for AI agents and as a CI gate.
- **Run everywhere identically**: locally, in Docker (for cross-platform visual consistency), or in GitHub Actions CI.
- **Carry a full audit trail of _why_ the test suite looks the way it does** — a 6-phase documented workflow (Explore → Scenarios → Automation Design → Test Spec → Evidence → Review) with reusable templates, a living "workbook" per target application, a defect ledger, and a bounded decision/lesson log.
- **Let an AI coding agent do the work under explicit human approval gates** — Claude Code, Codex, and Antigravity are all pre-configured with project instructions and an isolated Playwright MCP browser server, plus a packaged skill per workflow phase and a scoped `explorer` agent.

## Prerequisites

| Requirement                    | Version                                                     | Why                                                                                                                        |
| :----------------------------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org)  | `>= 22` (repo is pinned to `24` via `.node-version` and CI) | Runtime for Playwright, TypeScript tooling, and all scripts                                                                |
| npm                            | Bundled with Node                                           | Package manager and script runner                                                                                          |
| Git                            | Any recent version                                          | Version control, Husky hooks                                                                                               |
| Internet access                | —                                                           | The demo targets (TestDino store, Gaurav Khurana bill-pay API, JSONPlaceholder-style public APIs) are live public services |
| Docker (optional)              | Any recent version, with a running Linux engine             | Only needed for `npm run test:visual:docker` or container-based CI parity                                                  |
| An AI coding client (optional) | Claude Code / Codex / Antigravity                           | Only needed if you want the AI-assisted workflow; running tests needs no AI or API keys                                    |

## Quick start

```sh
git clone <your-fork-or-this-repo-url>
cd playwright-ai-workbench

# 1. Install dependencies (installs Playwright browsers' npm package, sets up Husky)
npm ci

# 2. Install the actual browser binaries Playwright drives
npx playwright install --with-deps

# 3. Pick a target environment (copies env-config/<name>.env -> .env)
npm run env:config -- testdino

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
├── PLAN.md                    # The originally agreed scope for this framework
├── config/                    # One independent Playwright config per suite
│   ├── playwright.ui.config.ts
│   ├── playwright.api.config.ts
│   ├── playwright.visual.config.ts
│   └── playwright.audit.config.ts
├── docs/
│   ├── LOG.md                 # Bounded, framework-wide decision (D-nnn) and lesson (L-nnn) log
│   ├── PLAN-LEDGER.md          # What's actually been verified vs. just planned
│   ├── templates/             # The 6-phase workflow templates + shared vocabulary (README.md)
│   └── targets/               # One living "workbook" + defect ledger per target application
├── env-config/                 # Plain .env templates per environment (dev/stg/uat/prod/testdino/lambdatest)
├── fixtures/                   # Composable Playwright fixtures (dependency injection)
│   ├── ui.fixture.ts           # Injects page objects and components
│   ├── api.fixture.ts          # Injects an authenticated APIRequestContext
│   └── index.ts                # Merges ui + api fixtures into one `test`
├── helpers/                     # Small shared utilities (e.g. openRoute — navigate + wait for a ready marker)
├── page-objects/
│   ├── pages/                   # One class per page: locators + actions, no assertions
│   └── components/              # Reusable UI pieces (header, cart drawer, …)
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

| Template                                      | Target                                                                    |
| :-------------------------------------------- | :------------------------------------------------------------------------ |
| `env-config/dev.env`                          | TestDino demo store + bill-pay API (default local dev)                    |
| `env-config/testdino.env`                     | TestDino demo store (primary UI/visual/audit target)                      |
| `env-config/lambdatest.env`                   | LambdaTest eCommerce Playground (archived UI target)                      |
| `env-config/stg.env` / `uat.env` / `prod.env` | Placeholder templates — replace the URLs with your own authorized targets |

Switch environments:

```sh
npm run env:config -- testdino   # copies env-config/testdino.env -> .env
npm run env:config -- stg        # or uat / prod / dev / lambdatest
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

Full functional/E2E coverage across **Chromium, Firefox, and WebKit**. Role-first locators (`getByRole`, `getByLabel`), fixture-injected page objects (`@fixtures`), every action/assertion wrapped in `test.step(...)`, and every test tagged with a scenario ID (`SC-00x`) plus a priority (`@smoke`, `@regression`, `@edge`). Currently: 6 tests across `home`, `products`, and `cart` specs.

### API (`tests/api/`, `config/playwright.api.config.ts`)

Pure `APIRequestContext`-based contract tests against the bill-pay demo API: health checks, catalog/category pagination, auth negative cases (401/404), multipart file upload, rate-limit/latency resiliency, and a full 6-step stateful billing lifecycle (discover biller → create bill → fetch payment method → pay → verify status → validate receipt). Every response is validated against a Zod schema in `types/schemas/`. Currently: 13 tests.

### Visual (`tests/visual/`, `config/playwright.visual.config.ts`)

Snapshot regression across **desktop (1280×720), tablet (iPad), and mobile (iPhone 14)** viewports, with `maxDiffPixelRatio: 0.02` / `threshold: 0.05` tolerances and animations disabled for determinism. **Opt-in and excluded from `npm test`** because baseline snapshots need a human-approved first run and are platform/font-rendering sensitive — run it explicitly, and prefer the Docker variant (`npm run test:visual:docker`) for reproducible baselines across machines. Currently: 1 spec (`home`), scaffolded for expansion.

### Audit (`tests/audit/`, `config/playwright.audit.config.ts`)

Three domain-agnostic checks that work on virtually any web page without app-specific locators:

- **Accessibility** — full `@axe-core/playwright` scan (WCAG 2.1 A/AA + 2.1 A/AA rule sets), zero rule suppressions.
- **Web Vitals** — LCP, CLS, FCP, TTFB via the browser's native `PerformanceObserver`, checked against budgets.
- **SEO** — title/meta description/viewport/Open Graph presence, image `alt` coverage, below-the-fold lazy-loading.

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

`.github/workflows/playwright.yml` runs on every push to `main`/`master`, every pull request, and on manual dispatch:

1. Checkout, set up Node 24 (npm cache enabled)
2. `npm ci`
3. `npm run check` (the full quality gate)
4. `npx playwright install --with-deps`
5. `npm test` (UI + API + Audit)
6. Upload `playwright-report/` and `test-results/` as a build artifact (14-day retention), even if the run was cancelled

This is a single sequential job today — no browser-matrix parallelism, no sharding, no browser-binary caching, and the visual suite is intentionally not wired into CI yet (baseline approval is a human step). See [Recommendations](#recommendations--roadmap).

## Docker

```sh
docker compose build
docker compose run --rm tests              # UI + API + Audit
docker compose run --rm tests npm run test:api   # one suite
npm run test:visual:docker                 # the dedicated visual-tests service
```

The image pins `mcr.microsoft.com/playwright:v1.63.0-noble` — keep this tag and the `@playwright/test` devDependency version in lockstep when upgrading. Compose mounts `playwright-report/` and `test-results/` back into the repo so you can inspect them after the container exits. No application service is started — you must point `UI_BASE_URL`/`API_BASE_URL` at something reachable from the container. Do not bake private credentials or certificates into the image; use Compose environment variables or CI secrets instead.

## The AI-assisted 6-phase workflow

This is what makes the framework "AI-first" rather than just "AI-compatible": every change — human- or agent-authored — is expected to move through six phases, each owning a distinct section of a per-target **workbook** (`docs/targets/<site>.md`):

| #   | Phase                 | Question it answers              | Owns                                                                                                  |
| :-- | :-------------------- | :------------------------------- | :---------------------------------------------------------------------------------------------------- |
| 1   | **Explore**           | What is the application, really? | Facts, oracle findings, testability, defects found — reads the live app, never the feature spec first |
| 2   | **Scenarios**         | What should we check, and why?   | Risk-ranked scenarios (`SC-nnn`), priorities (`P0`/`P1`/`P2`), exploratory charters                   |
| 3   | **Automation Design** | How is the test code structured? | Page/component/fixture design, reuse decisions, scenario-to-test mapping                              |
| 4   | **Test Spec**         | How is each check written?       | The actual page objects and specs — the code is the specification                                     |
| 5   | **Evidence**          | What happened when we ran it?    | Clean run records, triage, defects raised                                                             |
| 6   | **Review**            | Is it fit to merge?              | Findings and a recommended verdict — **a human always makes the final call**                          |

Supporting documents, each with exactly one owner so facts never need to be copied between them:

- **`AGENTS.md`** — the single entry point for any agent, any model: read order + the rules that cannot wait.
- **`CORE_PRINCIPLES.md`** — the actual code rules (commands, standards, guardrails, structure, naming, approval gates).
- **`docs/templates/README.md`** — the phase map, shared vocabulary (IDs, priorities, oracles, defect severities), and the handoff/return protocol between phases.
- **`docs/templates/0X-*.template.md`** — one template per phase, each naming exactly what it must and must not contain.
- **`docs/targets/<site>.md`** — the living workbook for one application; **`docs/targets/<site>-defects.md`** — its defect ledger.
- **`docs/LOG.md`** — a deliberately bounded (~30 active entries) log of framework-wide decisions (`D-nnn`) and lessons learned from mistakes (`L-nnn`); entries get promoted into a permanent rule or retired and deleted — this file is never allowed to become an unbounded archive.

**Hard rules that govern this process** (see `AGENTS.md`):

- The decision layer always stays with a human; agents recommend, never auto-merge a verdict.
- Only _agreed_ facts get written down — discussion is not approval.
- Every fact has exactly one owner; later phases reference it by ID, never copy it.
- Evidence runs are clean — no code edits during a Phase 5 run; fixes go back to Phase 4 and the run repeats.
- A handoff between phases is deleted by the phase that receives it once resolved; a stale handoff under a signed-off phase is itself a defect.

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

| Skill               | Phase                 |
| :------------------ | :-------------------- |
| `explore`           | 1 — Explore           |
| `scenarios`         | 2 — Scenarios         |
| `automation-design` | 3 — Automation Design |
| `test-spec`         | 4 — Test Spec         |
| `evidence`          | 5 — Evidence          |
| `pr-review`         | 6 — Review            |

Each skill is deliberately "thin" — it points at its phase template and adds no rules of its own, so rules can never drift between a skill and the template that governs it.

Only one standing agent exists: `explorer` (`.agents/agents/explorer.md`), scoped to Phase 1 because that's the one phase where sandboxed, restricted-permission exploration genuinely matters. Agents are added only where isolation earns its keep, not by default.

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

This framework is intentionally domain-agnostic at the architecture level (configs, guardrails, CI shape, the 6-phase process, the generic audit suite) but **not** magically portable at the test level — swapping `UI_BASE_URL`/`API_BASE_URL` alone does not adapt page objects, locators, or scenarios to a different application. To point this at your own app:

1. Run `npm run env:config -- stg` (or add a new `env-config/<yourenv>.env`) and set real URLs.
2. Go through Phase 1 (Explore) against your real app — do not reuse the TestDino/bill-pay scenarios.
3. Let Phases 2–4 build your own `docs/targets/<yoursite>.md`, page objects, and specs from what Phase 1 actually found.
4. Delete or archive the demo-specific specs, page objects, and schemas once your own suite covers the same ground.
5. If your app sits behind authentication, see [Recommendations](#recommendations--roadmap) — `storageState`-based auth setup is the standard Playwright pattern for this and is on the near-term roadmap here.

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

- Prove the "works for any app" claim by running the full 6-phase process against a second, genuinely different target (e.g. an auth-gated SaaS app), not just a second e-commerce demo.
- Add a flaky-test policy: a visible quarantine tag, a tracked flake-rate metric per test, and a rule for when a quarantined test gets fixed vs. deleted — currently undefined.
- Add free CI sharding (`--shard=1/N`) plus Playwright browser-binary caching once suite size justifies it, and wire the visual and audit suites into the pipeline (today only UI/API/Audit run in CI, and visual doesn't run at all).
- Add a CI job that runs tests in shuffled/repeated order to _prove_ the claimed test independence rather than only asserting it in `CORE_PRINCIPLES.md`.

**Near-term (auth support):**

- Add Playwright's `storageState` pattern for authenticated flows: a setup project that logs in once per run and reuses the saved storage state across tests, instead of logging in inside every test. This is the standard, supported way to make this framework work well against real auth-gated applications, and should be added before the framework is pointed at anything behind a login.

**Medium-term (governance):**

- Reconcile the stale `docs/LOG.md` decision that review findings live in "Bitbucket now, GitHub later" — CI already runs on GitHub Actions.
- Move the guardrail checker from regex-based matching to an AST-based check (e.g. `ts-morph`) as the ruleset grows, to avoid false positives/negatives in string literals and reformatted code.
- Add a mechanical check that every agent's declared tool names actually resolve against the configured MCP servers (a past failure — see `L-001` in `docs/LOG.md` — showed this isn't yet caught automatically).

**Longer-term (maturity):**

- Define a secrets/credential-rotation strategy once real (non-demo) targets are in use.
- Define a test-data lifecycle/cleanup strategy for stateful API flows (the billing-lifecycle test currently has no visible teardown).
- Pair the automated axe-core accessibility scan with at least one scripted keyboard-navigation/focus-order check per critical journey — axe catches a meaningful but partial slice of real WCAG issues.
- Write an explicit visual-baseline governance policy: who approves a baseline change, where approved baselines are stored, and how cross-OS rendering drift is handled.

Load/stress testing, security penetration testing, and third-party reporting dashboards are deliberately **out of scope** for this framework rather than a gap — Playwright is not the right tool for the first two, and the project intentionally avoids adding paid reporting infrastructure until the suite's size actually demands it.
