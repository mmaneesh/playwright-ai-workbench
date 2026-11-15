# Shared QA Vocabulary

Single source for the terms, IDs, and scoring used across every target's spec
file (`specs/<target>.plan.md`) and defect ledger. Referenced, never restated -
per `INTENT.md` §3, a fact lives here once.

## IDs

`R-nnn` risk, `SC-nnn` functional or API scenario, `VIS-nnn` visual scenario,
`AUD-nnn` audit scenario, `CH-nnn` exploratory charter, `DEF-nnn` defect,
`D-nnn` decision, `L-nnn` lesson. IDs are never reused. Decisions and lessons
belong to `docs/LOG.md`; everything else belongs to the target's own spec file
or defect ledger.

## Priority

| Priority | Tag           | Meaning                                                    | Cadence                 |
| :------- | :------------ | :--------------------------------------------------------- | :---------------------- |
| `P0`     | `@smoke`      | Core revenue, identity or discovery path. Blocks the build | Every commit or PR      |
| `P1`     | `@regression` | Secondary workflows, validation, state changes             | Nightly or release gate |
| `P2`     | `@edge`       | Boundaries, hostile input, persistence, empty states       | Weekly or full suite    |

Derive priority from likelihood and impact (`H`, `M`, `L`). Overriding it needs
a one-line reason.

| Impact \ Likelihood | H    | M    | L    |
| :------------------ | :--- | :--- | :--- |
| H                   | `P0` | `P0` | `P1` |
| M                   | `P1` | `P2` | `P2` |
| L                   | `P2` | `P2` | `P2` |

## Test level

`UI`, `API`, `Visual`, `Audit`, `DB` (only for a target where Stage 0 Intake
confirmed real database access - see `INTENT.md` §2).

## SFDIPOT - product coverage model

Used during exploration to guarantee no blind spot. Seven dimensions:

| Dimension          | What it models                                                                              |
| :----------------- | :------------------------------------------------------------------------------------------ |
| **S** - Structure  | The physical product: DOM/UI hierarchy, components, bundles, assets, or a service's modules |
| **F** - Function   | What the product does: search, filtering, calculations, auth, error rules                   |
| **D** - Data       | What it processes or persists: inputs, storage, cookies, stored records                     |
| **I** - Interfaces | Every conduit to the product: UI controls, APIs, URL routing, CLIs                          |
| **P** - Platform   | What it depends on: browser engine, OS, viewport, external services, DB engine              |
| **O** - Operations | How it's used and abused: personas, reloads, back button, saboteurs                         |
| **T** - Time       | Any product/time relationship: hydration, debounce, races, animation, async jobs            |

## Exploratory tours

1. **Business District** - end-to-end traversal of the core user/API path.
2. **Skeptical Customer** - cross-check calculations, totals, sort order, counts.
3. **Saboteur** - boundary values (`0`, `-1`, very large), hostile strings
   (`%%%`, `<script>`), empty submissions, rapid double-clicks, URL/param
   tampering.

## Oracles (`FEW HICCUPPS`)

Evaluate every exploration against all 11, UI or API alike - these are
general consistency heuristics, not UI-specific checks. Two rows below
(`Image`, `Comparable products`) previously narrowed the real definition
down to a UI-only example; corrected here to what the oracle actually
means, which was agnostic all along. None get skipped.

| Oracle                 | What it evaluates                                                                                                                                                                                                 |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Familiar problems      | Classic traps: floating-point rounding, off-by-one, `NaN`, `undefined`, `[object Object]`                                                                                                                         |
| Explainability         | State changes and errors are understandable - no silent failures or mysterious resets                                                                                                                             |
| World                  | Real-world domain rules hold (no negative quantities, no `$0.00` totals on paid items)                                                                                                                            |
| History                | State stays consistent with prior actions (removing an item restores the prior subtotal)                                                                                                                          |
| Image                  | Consistent with the organization's brand, reputation and professionalism - a broken image/placeholder text on a page and a leaked stack trace in an API error response are the same oracle on different surfaces  |
| Comparable products    | Consistent with comparable products or implementations - a UI convention (logo goes home, Enter submits, Escape closes) or an API convention (correct HTTP status codes, idempotent GETs, a standard error shape) |
| Claims                 | The product does what its own labels, banners, messages, or documented contract claims                                                                                                                            |
| User expectations      | Supports reasonable user goals smoothly (clear empty states, actionable validation)                                                                                                                               |
| Product consistency    | Internally consistent: names, identifiers and prices match everywhere they appear                                                                                                                                 |
| Purpose                | Controls fulfil their intended purpose (a sort sorts, a filter filters)                                                                                                                                           |
| Statutes and standards | WCAG 2.1 AA, security, semantic HTML, and any domain-specific legal/standards requirement                                                                                                                         |

## Test techniques

Pick the technique that fits the entity or behavior being checked:

| Technique             | Use when                                                           |
| :-------------------- | :----------------------------------------------------------------- |
| Zero / One / Many     | Counts and collections (empty, single, typical, overflow)          |
| Boundary values       | Ranges and limits (min, max, just outside)                         |
| Equivalence classes   | Inputs that behave alike (valid, invalid, special)                 |
| State transition      | Behavior depends on history (cart 1->0, logged in/out)             |
| Decision table        | Several conditions combine into outcomes (rules, discounts)        |
| Pairwise combinations | Many independent options (filters, settings)                       |
| Flow / story          | A credible end-to-end journey that crosses features                |
| Claims                | The product states a promise (banner, FAQ, docs) and you verify it |
| Stress                | Rapid repetition, large input, slow or failing dependencies        |

## Automation decision

Rate each scenario `1` (low) to `3` (high) on Risk (how much a failure
matters), Frequency (how often it's used/changed), Stability (how settled the
feature is), Determinism (can it run reliably without luck/timing/shared
data), and Cost (effort to build and maintain).

- **Automate** when risk and determinism are both at least 2 and cost doesn't
  outweigh risk and frequency.
- **Charter** when risk is high but determinism is low, or it needs a human's
  judgement.
- **Not covered** when risk is low and cost is high - record the reason.

## Defect severity

`High` blocks a core journey or a legal/accessibility standard for many users.
`Medium` degrades a journey or blocks a smaller group. `Low` is cosmetic or minor.

## Defect status

`Open`, `Triaged`, `Remediated`, `Verified`, `Accepted`. Only a clean re-run
moves a defect from `Remediated` to `Verified`. `Accepted` covers a defect that
will never be remediated by design (a seeded demo defect used to prove
detection works) - see `docs/templates/DEFECT_LEDGER.template.md` for how much
write-up depth that actually needs.

## Triage classification

`Product defect`, `Known defect` (an expected failure tied to an open `DEF-ID`),
`Test issue`, `Environment or data issue`, `Flaky`, `Unclear`.

## Confidence rubric

Every stage ends by reporting this block before stating it's done
(`INTENT.md` §3, §4):

```
## Confidence
- Confidence: <1-10>
- Unknowns: <specific list, or "none">
- Rationale: <one line per factor that applied>
```

**Confidence** is scored against _that stage's own Definition of Done_
(`INTENT.md` §4) - not a feeling:

| Band   | Score  | Requires                                                                                                                                                                                                                                                                                                     |
| :----- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High   | `8-10` | Every Done-criterion met by direct observation (the live target, real run output, a documented contract) - nothing inferred or assumed. `10` only if a re-run would reproduce the same result; `8-9` allows one defensible judgement call (e.g. a priority rating) that doesn't change the underlying facts. |
| Medium | `5-7`  | Every Done-criterion met, but at least one came from inference rather than direct observation, or one open question exists that a human should see - without blocking the write-up.                                                                                                                          |
| Low    | `2-4`  | At least one Done-criterion was skipped, assumed, or couldn't be checked.                                                                                                                                                                                                                                    |
| Failed | `1`    | The stage's own Stop-and-ask condition actually fired - the stage did not complete.                                                                                                                                                                                                                          |

**Unknowns**: name the specific missing fact - "whether `DEF-002` also affects
the cart page, not checked," never "some uncertainty remains."

**Rationale**: one line per factor that actually applied, each citing which
Done-criterion, which observation, or which assumption drove it - not a
general impression ("looks solid").

**The gate**: `Confidence >= 8` **and** `Unknowns: none` is the only
combination that counts as "Done" without flagging for review. Anything else
is, functionally, that stage's existing Stop-and-ask condition - surfaced
through this rubric instead of left to prose that's easy to skim past.

## External systems

The framework is tool-neutral. A team's own tool (Jira, TestRail, a GitHub
issue) may own feature context, test case storage, or defect tracking; without
one, the target's own spec file and defect ledger are the record. Writing to a
shared external tool needs approval each time.
