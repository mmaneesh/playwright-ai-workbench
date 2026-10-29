# Playwright AI Workbench: Agent Entry Point

An AI-first Playwright and TypeScript test framework. Any agent, with any model, works the same way: follow the phases, stay inside each phase's boundaries, and let a human make the decisions.

## Read before acting

1. `CORE_PRINCIPLES.md`: code standards, guardrails, commands, test structure, approval gates.
2. `docs/templates/README.md`: the six phases, shared vocabulary, handoffs and returns.
3. The template for your current phase in `docs/templates/`.
4. `docs/LOG.md`: the rows for your phase and `All`.
5. The target workbook, `docs/targets/<site>.md`.

## Rules that cannot wait

- The decision layer stays with the human. Agents recommend. (D-017)
- Record only what has been agreed. Discussion is not approval. (L-005)
- Hooks only see direct file edits. `npm run check` is the gate for every agent. (L-003)
- Every fact has one owner. Reference it; do not copy it. (D-002)
- Evidence runs are clean: never edit code during a run. (D-016)
- Handoffs are deleted by the phase that receives them. (D-006)

## Commands

See `CORE_PRINCIPLES.md` section 1. Run `npm run check` before marking any work complete.

## Tool-specific notes

`CLAUDE.md` and `GEMINI.md` are short stubs. Skills live in `.agents/skills/`; `.claude/skills/` is a generated copy (`npm run skills:sync`).
