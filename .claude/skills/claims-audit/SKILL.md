---
name: claims-audit
description: Framework maintenance, not a pipeline stage. Picks one root doc (AGENTS.md, CORE_PRINCIPLES.md, docs/INTENT.md, README.md, or docs/LOG.md's own rules), checks every checkable claim in it against actual repo state, and reports drift. Never fixes silently.
---

# /claims-audit: does every documented claim still hold?

Every mechanical check in this repo (`check-docs.ts`, ESLint, `check-rules.ts`)
verifies something it was explicitly built to verify. None of them check
whether a document's own prose still matches reality. This skill is that
check - done by reading and running things, not by re-reading the doc.

## What a "checkable claim" is

A sentence that reduces to a yes/no you can verify with a real command, not
an opinion. Four shapes to look for, each with a precedent already found and
fixed in this repo:

- **A documented convention nobody uses.** `CORE_PRINCIPLES.md` documented a
  `.enum.ts` naming convention; zero enum files existed (fixed:
  `types/sort-option.enum.ts`).
- **A path, alias, or reference never actually exercised.** The `@types/*`
  tsconfig alias was never usable (TypeScript reserves that prefix) and zero
  files had ever imported through it - broken since it was written, caught
  only once something finally tried to use it.
- **A "this works" claim that's gone stale.** `docs/INTENT.md` and `README.md`
  both said the visual suite had "zero specs, a real gap" after 15 specs had
  already shipped and passed in CI.
- **A stated rule with no mechanical teeth.** `docs/LOG.md`'s own "Rules for
  this file" section states a 30-entry cap that nothing checks; oracle names
  in scenario entries drifted from the canonical 11 in
  `docs/templates/README.md` with nothing to catch it.

## What never to do

- Never conclude a claim is true because the doc explains it clearly - read
  the actual file, run the actual command, don't trust prose about prose.
- Never fix anything without reporting it first. Per `D-017`, a scheduled or
  automated run proposes; a human decides what gets merged.
- Never flag a documented, _reasoned_ aspiration as drift. `CORE_PRINCIPLES.md`
  §8 (DB testing without direct access) explains exactly why no DB target
  exists yet - that's a decision, not a lie. Drift is a claim nobody meant to
  break, not a scoped-out capability with its own stated reason.
- Never audit the whole repo in one pass. Pick one root doc per run - a
  bounded, reviewable finding set beats an unreviewable wall of them.

## Procedure

1. `npm run check` first - if it doesn't pass, that's noise under everything
   else; report it and stop.
2. Pick one target for this run: `AGENTS.md`, `CORE_PRINCIPLES.md`,
   `docs/INTENT.md`, `README.md`, or `docs/LOG.md`'s own "Rules for this file"
   section. Rotate targets run to run rather than re-auditing the same one.
3. Read it in full. List every sentence that is a checkable claim (see
   above), not an opinion or a stated rationale.
4. For each claim, verify it directly: `grep` for actual usage, `find` for a
   file's existence, run the command it describes, or execute the test it
   claims passes. Quote the real output - never assume.
5. Classify each: holds / stale / dead (declared but unused) / unenforced
   (claimed as a rule, nothing mechanically checks it).
6. Report every non-holding claim with its evidence (the command run, its
   output) before proposing any fix.

## Done / stop conditions

**Done when**: every checkable claim in the chosen doc has been verified
directly and classified; findings are reported with evidence, not fixed
unilaterally.

**Stop and ask when**: a claim's "correct" state is a judgment call (keep an
unused-but-intentional convention for later vs. remove it now) - name the
specific choice, don't decide it alone.

## Report

List findings by claim, with the command/output that proves each one, then
stop. A human decides which get fixed now, which get logged as a decision or
lesson in `docs/LOG.md`, and which are accepted as-is.
