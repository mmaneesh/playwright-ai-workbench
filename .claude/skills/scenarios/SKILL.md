---
name: scenarios
description: Stages 2-3 (Scenarios, Test cases). Turns a target's exploration findings into risk-based scenarios with concrete test cases, written into that target's spec file.
---

# /scenarios: Stages 2-3

Reads `specs/<target>.plan.md` (Stage 0-1 findings) and
`docs/templates/README.md` (vocabulary: IDs, priority math, techniques,
oracles, automation-decision scoring). Writes into the same spec file - no
separate Risk Register, Test Techniques, or Scenario Catalog table
(`INTENT.md` §3).

## What never to do

- No Gherkin keywords - plain sentences for intent and expected behavior.
- No mega-scenarios - one intent per scenario, so a failure points at one cause.
- No scenario without a risk and an oracle - if you can't say what failure it
  guards against or how you'd recognise a problem, it doesn't belong.
- No happy-path-only coverage - apply a real technique to every entity that
  matters, or state why not.
- No implementation detail - locators, fixtures, and assertion syntax belong
  to Stage 4.
- No restating Stage 1's findings - reference them by their note in the spec.
- No automating by default - every scenario gets an explicit decision
  (`Automate` / `Charter` / `Not covered`).
- No invented expected results - if one can't be determined from the live
  target or a documented contract, that's Stage 3's stop condition: report the
  gap, don't guess.

## Procedure

1. For every risk-bearing finding in the spec file, write a scenario: risk,
   priority (Likelihood x Impact), technique, oracle, decision.
2. For every scenario marked `Automate`, write its test case inline: concrete
   steps and expected results at the user level, traced to exactly one
   scenario ID.
3. Anything not worth automating gets a charter (`CH-nnn`) or an explicit
   "Not covered" with a reason - nothing silently dropped.

## Done / stop conditions (`INTENT.md` §4)

**Stage 2 done when**: every risk-bearing finding has a scenario, a charter, or
a "Not covered" with a reason; every scenario carries risk, priority,
technique, oracle, decision; no entity is happy-path-only without a stated
reason.
**Stage 2 stop and ask when**: a risk can't be prioritized without information
only the user has - name the specific unknown.

**Stage 3 done when**: every `Automate` scenario has concrete steps and
expected results; every data value is concrete, not a placeholder.
**Stage 3 stop and ask when**: an expected result can't be determined from the
live target or a documented contract - report the gap.

Score confidence for each stage against its Done criteria, using the rubric
in `docs/templates/README.md`, before reporting either stage as done.
Append each stage's confidence block as a dated entry under the spec file's
"## Confidence Log" section (format in `specs/TEMPLATE.md`) - not just in
the chat report. `npm run docs:check` verifies the entry is well-formed.
