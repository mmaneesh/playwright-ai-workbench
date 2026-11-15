# Project Intent

This file records what this project is _for_, in plain language, so future
decisions can be checked against it instead of against whatever the process
happened to grow into. `docs/PLAN.md` is the concrete plan derived from this file;
if the two ever disagree, this file wins and `docs/PLAN.md` is the thing that's wrong.

**Standing rule, not a one-time reminder**: every new piece of work - a file, a
decision, a feature - must trace back to a numbered item below. If it doesn't,
that is drift, and it gets flagged before proceeding, not after. This applies to
work proposed by an agent and to requests made by the user. Catching the drift
is the job, in both directions - see §9.

Written 2026-11-14. Supersedes any process description in `docs/templates/` or
`README.md` that conflicts with it.

---

## 1. What this repository is

An agentic QA repository. Someone brings their own LLM and points it at an
application, an API, or a database they own - not necessarily the ones already
in this repo - and the agent does what a good QA engineer does:

0. **Intake.** Before anything else, ask what's being tested: what it is, which
   surfaces apply (UI / API / DB, one or more), whether DB access actually
   exists, auth model and available accounts, constraints (shared/production
   data, rate limits), and scope for this pass. Answers are recorded, not
   assumed, and shape every stage after.
1. **Explore** the application and note every real observation - flows, issues,
   open questions, anything that comes out of actually looking at it.
2. Those observations are the **single source of truth** for everything after:
   scenarios, test cases, and test automation all derive from them, not from a
   separately-invented plan.
3. **Write scenarios** - what to check and why, risk-prioritized, each tied to a
   real finding.
4. **Write test cases** - concrete steps and expected results for each scenario,
   precise enough that writing the automation is a translation, not a design
   decision.
5. **Write test automation** - Playwright specs built from the test cases.
6. **Open a PR** for a human to review.

A human is in the loop throughout, but only at points where a real decision is
being made - not at fixed checkpoints that exist regardless of whether there's
anything to decide.

This is not a generic Playwright boilerplate and it is not an enterprise QA
audit process with an AI attached to it (that's what it drifted into once
before - see §10). It is specifically: an agent-first pipeline that does
professional-grade QA work, lightly enough that bringing a fresh LLM to it and
getting real value on the first prompt is the actual bar, not an aspiration.

## 2. App / API / DB agnosticism

The pipeline in §1 must work for whatever a user brings, not just the targets
already exercised in this repo (Sauce Demo, the BillPay practice API). This is a
structural requirement, not a hope:

- **The process layer never names a specific target.** `AGENTS.md`,
  `CORE_PRINCIPLES.md`, every agent and skill definition - none of them may
  contain an application name, an account, a URL, a schema, or any other
  per-target fact. Checked today by grep, zero hits confirmed on 2026-11-14;
  `docs/PLAN.md` Phase 2 should make this a mechanical check, not a manual one.
- **Stage 0 (Intake) is where per-target facts enter the pipeline**, and they
  live only in that target's own files (its spec file, its page objects, its
  test data) - never written back into the shared process layer. This is the
  same single-owner-per-fact principle already agreed for everything else,
  applied to "which app this is."
- **A target's declared surfaces (§0) gate which test layers exist for it.** A
  target gets a `tests/db/` presence only if intake confirmed real DB access -
  not by default, and not because the folder exists in this repo already.
- **The heuristics in §5 (SFDIPOT, the oracles, the tours) are universal by
  construction** - they describe how to look at _any_ product, not this one.
  That's why they survive unchanged; nothing about them is Sauce-Demo-shaped.

## 3. What "truly agentic" means here

- **A human checkpoint exists because there's a real decision to make** - low
  confidence, genuine ambiguity, a destructive or shared-state change - not
  because a fixed phase boundary says so. A checkpoint that fires every time,
  whether or not anything is actually uncertain, is not a safety mechanism; it's
  a step that stops getting checked. (Proven once already: all 6 phase sign-offs
  in the old, now-retired Sauce Demo workbook stayed `Draft` from the day they were
  written - the gate was never once honored.)
- **One record per fact.** A scenario is described once, not fanned across a
  Risk Register, a Test Techniques table, a Scenario Catalog, an Automation
  Decision table, and a Scenario-to-Test Mapping that all have to independently
  agree.
- **Guardrails and heuristics travel with the agent that needs them**, inline,
  not as a separate document the agent is told to "go read first" and might not.
- **Isolation (a dedicated agent with restricted tools) is used only where it
  earns its keep** - the explorer agent is real and correct (browser tools only,
  cannot write test code); a verifier/PR-review agent with read-only tools
  belongs here too and does not yet exist.
- **Evals are concrete and pinned to known truth**, not a generic framework.
  Small, specific, falsifiable - see §4 and §10.
- **Every stage has a Definition of Done and a stop condition** - see §4. A
  stage either completes, or stops with a precise, actionable reason why not.
  The failure mode being guarded against is silent, unexplained partial work -
  not an agent that occasionally has to ask a human something (that is bounded
  autonomy working as intended, not a failure).
- **A stage proves it met its Done criteria by reporting a confidence score
  against them, not by asserting "done."** Rubric in
  `docs/templates/README.md`. `Confidence >= 8` and `Unknowns: none` is the
  only combination that counts as done without flagging for review -
  anything else is that stage's stop condition, made visible instead of left
  to prose a reviewer might skim past.

## 4. Definition of Done, per stage

Every stage below also reports a confidence score against its own Done
criteria, using the rubric in `docs/templates/README.md` - omitted per stage
here to avoid repeating it six times. `Confidence >= 8` and `Unknowns: none`
is what "Done" actually means; anything less is that stage's own
stop-and-ask condition made visible.

### Stage 0 - Intake

**Done when**: what's being tested, its surfaces, auth model, constraints, and
this pass's scope are all answered and recorded.
**Stop and ask when**: the user hasn't said enough to proceed - ask the specific
missing question, don't assume a default scope.

### Stage 1 - Explore

**Done when**: all 7 SFDIPOT dimensions touched, all 3 tours run (or marked N/A
with a reason), all 11 oracles evaluated (Pass or a logged finding, none left
blank), and every finding traces to a live observation, not an inference.
**Stop and ask when**: the target can't be reached (auth blocked, env down,
missing credentials) - report the blocker; never present a partial pass as
complete.

### Stage 2 - Scenarios

**Done when**: every risk-bearing finding has a scenario, a charter, or an
explicit "Not covered" with a reason; every scenario carries risk, priority
(Likelihood x Impact -> P0/P1/P2), technique, oracle, and a decision; no entity
is happy-path-only without a stated reason why not.
**Stop and ask when**: a risk can't be prioritized without information only the
user has (business priority, legal weight) - name the specific unknown.

### Stage 3 - Test cases

**Done when**: every "Automate" scenario has concrete steps and expected results
at the user level; every test case traces to exactly one scenario ID; every data
value is concrete, not a placeholder.
**Stop and ask when**: an expected result can't be determined from the live
target or a documented contract - report the gap, never invent the outcome.

### Stage 4 - Test automation

**Done when**: every test case has a matching Playwright spec following
`CORE_PRINCIPLES.md`; `npm run check` passes; the test runs green against the
real target, or fails exactly as expected for a known defect (`test.fail()`);
self-reviewed against every guardrail relevant to the files touched.
**Stop and ask when**: a test can't be made deterministic because of something
real in the target or environment - report the flake pattern; never mask it
with a retry or a sleep.

### Stage 5 - PR review (the verifier agent)

**Done when**: the diff is checked against every guardrail relevant to the
paths it touches; `npm run check` plus the affected specs actually ran with
real output quoted; a recommended verdict is given, citing the specific
guardrail or scenario it's based on.
**Stop and ask when**: a check can't run (missing env var, broken branch) -
report that exactly; never approve on the assumption it would have passed. The
merge decision itself is always the human's, never the agent's.

### One level up - when is a target done?

Since "test everything" is an infinite goal, a target is done **for its
declared scope (Stage 0)** when every P0/P1 scenario is automated and green,
every defect found is logged, and anything explicitly out of scope is named
with a reason - not silently absent.

## 5. What must survive, unchanged in substance

Real quality-engineering tools, not ceremony. The redesign keeps every one of
them - only their _container_ changes, from a 285-line template with 12 numbered
subsections to a compact checklist the explorer carries inline:

- **SFDIPOT** - the 7-dimension coverage model (Structure, Function, Data,
  Interfaces, Platform, Operations, Time).
- **FEW HICCUPPS** - all 11 named oracles (Familiar problems, Explainability,
  World, History, Image, Comparable products, Claims, User expectations,
  Product consistency, Purpose, Statutes and standards), each with its one-line
  test. Every exploration checks against all 11; none get skipped.
- **The 3 exploratory tours** - Business District, Skeptical Customer, Saboteur.
- **Risk-based prioritization** - Likelihood x Impact -> P0/P1/P2, one line per
  scenario, not a separate cross-referenced table.
- **RIMGEA defect rigor** (Replicate, Isolate, Maximize, Generalize, Externalize,
  And state it plainly) - kept in full for real, non-trivial defects. A
  seeded/accepted defect that exists purely to prove the suite can detect a
  defect class gets a one-line table row instead - depth proportionate to
  whether a human actually needs to act on it.
- **Exploratory charters** (`CH-nnn`) - timeboxed, scoped follow-up exploration.
- **36 guardrail rules**, currently spread across 7 template files (~55 lines
  total). Every one survives, attached directly to the agent/skill that needs
  it instead of floating in a document that agent is told to go read.

## 6. What gets cut

Ceremony that added process weight without adding decision quality, proven by
this repo's own history, not asserted:

- The 6-phase Draft -> Approved sign-off gate (0/6 ever honored).
- The `<!-- HANDOFF N->M -->` block mechanism.
- The five-table-per-scenario fan-out, in favor of one entry per scenario in one
  living spec file.
- Mandating the full RIMGEA write-up for every defect regardless of severity.
- Duplicated content living in two files at once (one fact, one owner, per
  `D-002` - which the project already agreed to and didn't follow).

## 7. What must stay exactly as it is today

Not part of this redesign at all - genuinely good, already lean, not duplicated:

- `CORE_PRINCIPLES.md` (code standards, guardrails, commands, naming, folder
  structure) and its mechanical enforcement via `npm run check`.
- The guardrail and docs checker scripts (`scripts/guardrails/*`).
- The CI matrix, Docker setup, page-object/fixture conventions, Zod-typed API
  contracts.
- `docs/LOG.md` (the `D-nnn`/`L-nnn` decision and lesson log) - bounded,
  single-owner-per-fact, genuinely useful memory.
- The thin-skill-points-at-the-real-thing pattern (`D-003`) - the mechanism is
  right; only what it points at changes shape.

## 8. Test breadth to keep

Independent of the process redesign, and per §2 gated by what Stage 0 actually
confirms for a given target - `tests/` keeps its suite structure:

- **UI** - exists, built out (Sauce Demo).
- **API** - exists, built out (BillPay practice API), with per-run data
  isolation.
- **Visual Regression** - exists, built out (Sauce Demo, `docs/PLAN.md` Phase 4,
  2026-11-14): 5 scenarios across 3 viewports, committed Docker-generated
  baselines, verified in CI.
- **Audit** (accessibility, Core Web Vitals, SEO) - exists, built out.
- **Database** - aspirational for the targets in this repo today (neither
  exposes real DB access), but the _pipeline_ must support a DB-accessible
  target when one is brought (§2). Not "to be built" speculatively; built the
  first time Stage 0 confirms a target that has one.

## 9. Guarding against drift

This file exists because the project drifted once already (§10) without anyone
flagging it until the cost was visible. The rule going forward:

- Before starting any new work, check it against a numbered item above. If it
  doesn't trace to one, say so and ask whether to do the work anyway (and update
  this file) or skip it - don't just proceed.
- This applies symmetrically. A request - from the user or from anywhere else -
  that doesn't trace to this file gets the same flag, not silent compliance.
- "We should finish this today" is not, by itself, permission to skip the check
  above. Moving fast and staying grounded are not in tension; drift happens
  quietly, not from a single big leap.

## 10. Still open

Not blocking today's build, but not resolved either - revisit, don't ignore:

- **Planning / decomposition as a tracked mechanism.** Stage 0 now shapes scope
  up front, but there's no explicit "the agent maintains a visible plan and
  re-plans when exploration finds something new" behavior defined yet.
- **Memory across sessions.** The spec file is solid within-run memory; there's
  no cross-session "what's covered, what's left" tracker for a target that gets
  revisited weeks later.
- **Self-correction / healing.** Stage 4's "stop and ask" covers a test that
  can't be made deterministic, but there's no designed loop for "a previously
  green test just failed - diagnose, fix, or escalate" distinct from writing a
  new test the first time.
- **Verification of goal, beyond two narrow evals.** `docs/PLAN.md` Phase 3 covers
  the guardrail-checker eval and the explorer eval; scenario-quality and
  test-case-quality have no eval yet.

## 11. How we got here

Phase 1 (foundations: `CORE_PRINCIPLES.md`, configs, guardrails, directory
structure) was built lean and correct, and stayed that way. The 6-phase workbook
process built after it grew into enterprise QA-audit ceremony that was never
actually followed (proof in §3) and produced a roughly 2.5:1 ratio of
documentation to test code on every real change. This file exists so that
drift doesn't repeat silently a second time.
