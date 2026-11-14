---
name: test-spec
description: Stage 4 (Test automation). Writes the page objects/fixtures and Playwright specs from a target's test cases, following CORE_PRINCIPLES.md. Covers what used to be separate Automation Design and Evidence phases.
---

# /test-spec: Stage 4

Reads the test cases in `specs/<target>.plan.md` and `CORE_PRINCIPLES.md`
(code standards, guardrails, folder structure, naming - not repeated here).
Writes page objects/fixtures/specs under `tests/`, and fills in each
scenario's `Spec:` line in the plan file.

## What never to do

- No new page object, fixture, or helper without a reuse check first - look at
  what the repo already has (`page-objects/`, `fixtures/`).
- No locator or API contract written from memory - check the live target or
  the documented contract.
- No loosening a test to make it pass - a failing test that exposes a real
  defect is a success. Never relax an assertion, exclude a rule, or skip a
  test to turn it green.
- No new scenarios or structure here - that's Stage 2/3; return to `/scenarios`
  if the test case doesn't match what the target actually does.
- No fabricated or truncated evidence - when reporting a run, quote the real
  command, exit code, counts and durations.
- No editing code while reporting a clean run as evidence - a run is clean or
  it isn't; fix first, then re-run.
- No change to shared config (`config/`, hooks, guardrail scripts) without
  calling it out explicitly - it affects every target, not just this one.

## Procedure

1. Write the page object / fixture / spec per `CORE_PRINCIPLES.md`.
2. Run `npm run check`.
3. Run the new spec against the real target. It passes green, or fails exactly
   as expected for a known defect (`test.fail()`, with the `DEF-ID` cited).
4. Self-review against every guardrail above before reporting.

## Done / stop conditions (`INTENT.md` §4, Stage 4)

**Done when**: every test case has a matching spec; `npm run check` passes;
the test runs green or fails exactly as expected; self-reviewed against every
relevant guardrail.

**Stop and ask when**: a test can't be made deterministic because of something
real in the target or environment - report the flake pattern; never mask it
with a retry or a sleep.
