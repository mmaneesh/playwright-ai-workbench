# Playwright AI Workbench: Agent Entry Point

An agentic QA repository (`INTENT.md` §1). Bring any application, API, or
database and any LLM: the agent does what a good QA engineer does - intake,
explore, scenario, test case, automate, review - with a human in the loop only
where a real decision is being made.

## Rules that cannot wait

- The decision layer stays with the human. Agents recommend; a human decides
  the merge. (D-017)
- Every fact has one owner. Reference it; do not copy it. (D-002)
- Agents (not skills) exist only where isolation or restricted permissions
  earn their keep: `explorer` and `verifier`. (D-004)
- Skills stay thin and point at the real thing - no rules duplicated into a
  skill that live elsewhere. (D-003)
- `npm run check` is the real gate for every agent, on any platform - a
  pre-edit hook only sees direct file edits. (L-003)
- Record only what has been agreed. Discussion is not a decision. (L-005)
- Plan the whole shape of a change and verify load-bearing assumptions before
  writing multi-file code - never discover them via a failed run. (L-006)
- Evidence runs are clean: never edit code while reporting a run as evidence.
  (D-016)
- Every stage has a Definition of Done and a stop condition
  (`INTENT.md` §4). Complete the goal, or stop with a precise, actionable
  reason why not - never trail off with silent, unexplained partial work.
- The process layer (this file, `CORE_PRINCIPLES.md`, every agent and skill)
  must never name a specific target - checked by `npm run docs:check`
  (`INTENT.md` §2).

## Where things live

- `INTENT.md`: what this project is for and why - the final word if anything
  here conflicts with it.
- `PLAN.md`: the concrete, phased build plan derived from `INTENT.md`.
- `CORE_PRINCIPLES.md`: code standards, guardrails, commands, folder structure.
- `docs/templates/README.md`: shared vocabulary (IDs, priority, SFDIPOT, the
  tours, the 11 oracles, test techniques, defect severity/status).
- `specs/<target>.plan.md`: the one living file per target - Stages 0-3.
- `docs/targets/<target>-defects.md`: that target's defect ledger.
- `docs/LOG.md`: framework-wide decisions (`D-nnn`) and lessons (`L-nnn`).

## Commands

See `CORE_PRINCIPLES.md` section 1. Run `npm run check` before marking any
work complete.

## Tool-specific notes

`CLAUDE.md` and `GEMINI.md` are short stubs. Skills live in `.agents/skills/`;
`.claude/skills/` is a generated copy (`npm run skills:sync`). Agents live in
`.agents/agents/` and `.claude/agents/` - bodies must stay identical; only the
tool-name frontmatter differs per platform.
