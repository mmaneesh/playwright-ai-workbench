# Agreed implementation plan

Build a personal, production-grade, AI-native Playwright + TypeScript test automation workbench: an original, deliberate architecture free from legacy baggage or god-object antipatterns.

This plan is derived from `docs/INTENT.md`; if they disagree, `docs/INTENT.md` wins. Phase 1 below shipped and is correct as built - nothing in it is affected by Phases 2+. Phases 2+ exist because the process built on top of Phase 1 (the 6-phase workbook) drifted from the intent `docs/INTENT.md` restates (see its §7). Each phase below still needs explicit review and approval before implementation, per the Boundaries section - writing this plan is not that approval.

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
- Environment management: an atomic switcher, `npm run env:config -- <env>`, copying from `env-config/<env>.env` to `.env`. Zod-backed environment validation to fail fast on missing keys.
- Single-stack guardrails: pure TypeScript mechanical rule checker (`scripts/guardrails/check-rules.ts`) to block forbidden patterns (`waitForTimeout`, XPath, `any`, untyped JSON, pseudo-Gherkin) without requiring a secondary Python runtime.
- Docker baseline: `Dockerfile` and `docker-compose.yml` configured for containerized execution and platform-agnostic visual snapshot consistency (`npm run test:visual:docker`).
- Quality tooling: TypeScript strict mode, path aliases, ESLint with `eslint-plugin-playwright`, Prettier, Husky, and lint-staged.

## Phase 2 — Lean agentic workflow (replaces the 6-phase workbook process)

Per `docs/INTENT.md` §3-5: every guardrail, oracle, tour, risk-priority rule and RIMGEA
defect standard survives. What changes is the container - one fact recorded once,
inline with the agent that needs it, instead of fanned across five tables and a
sign-off gate that `docs/INTENT.md` §2 shows was never once honored.

**Created:**

- `specs/<target>.plan.md` (e.g. `specs/saucedemo.plan.md`) - one living file per
  target, replacing Sections 1-2 of that target's `docs/targets/<site>.md`.
  Scenarios carry risk/priority/technique/oracle inline, one entry each.
- A short shared reference (replaces most of `docs/templates/README.md`): the ID
  scheme, priority math, the 11 oracle definitions, defect severity/status. Still
  one owner, still referenced not restated - just not wrapped in phase-gate rules.
- The explorer agent (`.claude/agents/explorer.md`, `.agents/agents/explorer.md`)
  gets the SFDIPOT table, the 3 tours, and the 11 oracles written directly into
  its own instructions, plus Phase 1's 7 guardrails, inline - not "go read this
  285-line file first."
- A **verifier** agent (named in `D-004`, never built): read-only tools, isolated
  from the authoring agent, carries Phase 6's 5 guardrails inline. Reviews a
  diff and recommends a verdict; never fixes code itself and never gives the
  final merge decision - that stays with the human (`docs/INTENT.md` §4 Stage 5).
- An **Intake** step (Stage 0, `docs/INTENT.md` §1/§4): not a separate agent - no
  isolation benefit per `D-004`'s own reasoning - but an explicit first step of
  the workflow skill that asks what's being tested, its surfaces, auth, and
  scope, and writes the answers into that target's spec file before Explore
  starts.
- A mechanical agnosticism check (`docs/INTENT.md` §2): extends
  `scripts/guardrails/check-docs.ts` (or a sibling script) to fail if any
  per-target name (an app, account, URL, or schema) appears in the process
  layer (`AGENTS.md`, `CORE_PRINCIPLES.md`, any agent or skill file) - replacing
  today's one-off grep with something `npm run check` enforces every time.
- Each remaining skill (`scenarios`, `test-spec`, `pr-review`) stays a named,
  invokable entry point but gets its own phase's guardrails written inline and
  points at the new spec-file format, not the retired templates.

**Retired** (substance preserved per `docs/INTENT.md` §3, moved per above; no net loss):

- `docs/templates/`'s six numbered phase templates (deleted 2026-11-14 - their
  substance moved into the `explorer`/`verifier` agents and the
  `scenarios`/`test-spec`/`pr-review` skills), and most of
  `docs/templates/README.md` (now just the shared vocabulary).
- The Draft -> Approved sign-off gate and the `<!-- HANDOFF N->M -->` mechanism.
- The Risk Register / Test Techniques / Automation Decision / Scenario-to-Test
  Mapping tables, replaced by one inline entry per scenario.
- `docs/PLAN-LEDGER.md`'s phase-by-phase "Verified" checklists and its
  "Remaining Phases" roadmap (duplicate of `README.md`'s roadmap section - one
  owner wins, see below). Its Target Applications Registry (~20 lines) survives,
  folded into a short standalone file or `README.md`.

**Modified:**

- `docs/targets/<site>-defects.md` keeps the summary table for every defect, but
  the full RIMGEA write-up is reserved for real, non-trivial defects (like
  `DEF-001`); accepted/seeded defects (like `DEF-002`/`DEF-003`) stay as one row.
- `README.md` keeps the one canonical copy of the workflow description and the
  roadmap; the duplicate copies elsewhere are deleted, not maintained in two places.
- `AGENTS.md` rewritten short (per the sketch already shown and agreed): MUST/WON'T
  list, point to the workflow skill, no "read these 5 documents first."

**Unaffected** (per `docs/INTENT.md` §5): `CORE_PRINCIPLES.md`, `npm run check` and its
scripts, the CI matrix, Docker, page-object/fixture conventions, Zod schemas,
`docs/LOG.md`, the thin-skill-points-at-the-real-thing pattern itself.

## Phase 3 — Evals

Per `docs/INTENT.md` §2: small, concrete, pinned to known truth, not a framework.

- **Guardrail checker eval**: a fixed set of known-bad snippets (`waitForTimeout`,
  XPath, `any`, pseudo-Gherkin) that must be rejected, and known-good snippets that
  must pass. Protects `check-rules.ts` from being silently weakened.
- **Explorer eval**: run against Sauce Demo (known seeded defects) and assert the
  output actually names `problem_user`'s broken image, `error_user`'s exception,
  and `DEF-001`. Protects the exploration checklist from quietly going shallow.
- Further evals (scenario quality, test-writing) added only when a specific gap
  shows up, not pre-built speculatively.

## Phase 4 — Visual regression suite

Per `docs/INTENT.md` §8: `tests/visual/` has config but zero specs today - a real gap,
not a deliberate scope decision. Scope (which pages, which viewports, how many
baseline variants) gets agreed before any spec is written, so it doesn't overshoot
into a dozen snapshot variants nobody reviews.

## Phase 5 — Database testing (scoping only)

Per `docs/INTENT.md` §8: aspirational. Today's targets expose no direct database
access. This phase is "decide whether a concrete target with real DB access
exists, or document a through-the-API/UI data-integrity testing strategy" - not
"build a `tests/db/` folder" until that's answered.

## Boundaries

Keep all work local. Do not initialize/change Git, create/switch branches, configure tracking/remotes, stage, commit, or push without explicit permission.

Each phase above requires its own review and approval before implementation - agreeing to this plan is not approval to start Phase 2, and completing Phase 2 is not approval to start Phase 3.

Record verified progress and remaining verification in docs/PLAN-LEDGER.md. Strike completed items only after verification. Do not start another phase automatically.
