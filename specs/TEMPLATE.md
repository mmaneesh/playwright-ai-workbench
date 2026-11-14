# <Target>: Test Plan

Copy this file to `specs/<target>.plan.md` for a new target. One file per
target - this is the single source of truth for Stages 0 through 3
(`INTENT.md` §1, §4). Delete this comment block once filled.

Vocabulary (IDs, priority math, SFDIPOT, the tours, the 11 oracles, test
techniques, automation-decision scoring, defect severity/status) lives once in
`docs/templates/README.md` - reference it, never restate it here.

---

## Stage 0 - Intake

- **What is this**: <one line>
- **Surfaces**: UI / API / DB - state which apply
- **Database access**: yes, `<how>` / no
- **Auth model**: <none / accounts / tokens - name what's available>
- **Constraints**: <shared or production data, rate limits, environment type>
- **Scope for this pass**: <everything / one feature or flow, and why>

## Context

- **Core value proposition**:
- **Key personas / stakeholders**:
- **Top risks to product value**:

## Scenarios

One entry per scenario. Each carries risk, priority, technique and oracle
inline - no separate Risk Register or Scenario Catalog table (`INTENT.md` §3).

### SC-001 - <intent, plain language>

- Risk: `R-001` (<failure mode, for whom>) · Priority: `P0` (Impact x Likelihood)
- Technique: <from the catalog> · Oracle: <from the 11>
- Preconditions: <auth state, seed data, isolation needs>
- Test case:
  1. <concrete user-level step> -> expect: <concrete observable outcome>
  2. <next step> -> expect: <outcome>
- Decision: `Automate` | `Charter` | `Not covered` (<reason if not Automate>)
- Spec: `tests/<layer>/<target>/<file>.spec.ts` (filled once Stage 4 is done)
- If a known defect applies: DEFECT (`DEF-001`, `<status>`): <one-line summary>

## Exploratory charters (open)

- `CH-001`: <area> - <timebox> - to discover: <what>

## Not covered

| Item | Reason | Revisit when |
| :--- | :----- | :----------- |
