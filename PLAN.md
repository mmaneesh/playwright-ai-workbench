# Agreed implementation plan

Build a personal, production-grade, AI-native Playwright + TypeScript test automation workbench. Synthesize the strengths of Earendel and Ivan Davidov's `agentic-playwright` into an original, deliberate architecture free from legacy baggage or god-object antipatterns.

## Phase 1 — foundations

- Authoritative blueprint: `CORE_PRINCIPLES.md` covering Commands, Code Standards, Guardrails, Folder Structure, Naming Conventions, and Workflow & Approvals.
- AI platform agnostic orchestrators: high-signal, zero-noise, tabular orchestrators (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`) containing dense quick-reference rules and zero task checklists or prose filler to avoid context rot.
- Suite configurations: 4 independent, decoupled config files:
  - `config/playwright.ui.config.ts` (UI & E2E)
  - `config/playwright.api.config.ts` (API contracts, pure request context)
  - `config/playwright.visual.config.ts` (multi-viewport, snapshot paths, threshold tolerances)
  - `config/playwright.audit.config.ts` (Axe-core accessibility, Web Vitals, SEO audits)
- Directory structure & naming:
  - `page-objects/pages/` and `page-objects/components/` (kebab-case folders and files)
  - `fixtures/` (composable dependency injection, central `index.ts`)
  - `tests/` (`ui/`, `api/`, `visual/`, `audit/`)
  - `test-data/` (`factories/` and `static/`)
  - `types/` (`schemas/` and `enums/`)
  - `helpers/`
- Environment management: Earendel-style atomic switcher `npm run env:config -- <env>` copying from `env-config/<env>.env` to `.env`. Zod-backed environment validation to fail fast on missing keys.
- Single-stack guardrails: pure TypeScript mechanical rule checker (`scripts/guardrails/check-rules.ts`) to block forbidden patterns (`waitForTimeout`, XPath, `any`, untyped JSON, pseudo-Gherkin) without requiring a secondary Python runtime.
- Docker baseline: `Dockerfile` and `docker-compose.yml` configured for containerized execution and platform-agnostic visual snapshot consistency (`npm run test:visual:docker`).
- Quality tooling: TypeScript strict mode, path aliases, ESLint with `eslint-plugin-playwright`, Prettier, Husky, and lint-staged.

## Boundaries

Keep all work local. Do not initialize/change Git, create/switch branches, configure tracking/remotes, stage, commit, or push without explicit permission.

Future phases (specialist agents, skills library, data factories, API schemas, full test suites, CI matrix sharding) require subsequent review and approval before implementation.

Record verified progress and remaining verification in docs/PLAN-LEDGER.md. Strike completed items only after verification. Do not start another phase automatically.
