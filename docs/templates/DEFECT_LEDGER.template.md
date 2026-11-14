# Defect Record Format

Used in `docs/targets/<site>-defects.md`. Severity, status and oracle names
come from `docs/templates/README.md` - not repeated here.

## Summary table (every defect gets a row)

| Defect ID | Title | Severity | Level | Oracle | Found by (`Stage 1` or scenario ID) | Status | Ticket key |
| :-------- | :---- | :------- | :---- | :----- | :---------------------------------- | :----- | :--------- |

## Full write-up - only for a real, non-trivial defect

A defect that needs a developer to actually act on it (not an `Accepted`
seeded/demo defect kept to prove detection works - that's a table row and
nothing more) gets this, applying **RIMGEA**: **R**eplicate, **I**solate,
**M**aximize, **G**eneralize, **E**xternalize, **A**nd state it plainly.

### [DEF-nnn]: [Descriptive title]

- **Severity** / **Level** / **Oracle** / **Status** / **Found by**: from the
  table above.
- **Route or endpoint**:
- **Element or field**:

**Stakeholder impact** - how this affects real users, assistive technology
users, trust, or revenue.

**Minimal steps to reproduce** - numbered, isolating, reproducible by a
developer in under 60 seconds.

**Generalization** - one instance, or does it affect more? What makes it worse?

**Expected result** - dispassionate statement, with its source.

**Actual result** - dispassionate statement of what happens.

**Diagnostics** - console error, scan violation, response body, or validation
error, verbatim.

**Artifacts** - durable (ticket attachment or `docs/targets/evidence/`, never
`test-results/`, which is overwritten every run): screenshot, trace, and the
exact command to reproduce or view the trace.

## What never to do

- No un-isolated or vague bugs - see RIMGEA above.
- No defect without an oracle and a stakeholder impact.
- No defect without durable artifacts for anything above `Low` severity.
- No `Verified` status without a clean re-run.
