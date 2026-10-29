# Phase 6: Review — Is It Fit to Merge?

- **PR Title**: `[Feature / Fix Title]`
- **Branch**: `[branch-name]`
- **Review tool**: `[none | <tool>]`
- **Author / Agent**: `[Name / Model]`
- **Reviewer**: `[Name / Model]` (not the author)
- **Date**: `[YYYY-MM-DD]`
- **Mode**: `[Full | Lite]`
- **Status**: `[Draft | Complete]`

## Boundaries

| Reads                                                                        | Produces                                                                  | Must NOT contain                                                          |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------ |
| The diff; Sections 2 to 5 by link; the check output; the `HANDOFF 5→6` block | Section 6 of `docs/targets/<site>.md`: the verdict and a link to findings | New scenarios (Phase 2); rewritten code (findings go to the owning phase) |

**The review looks only at what automated checks cannot see.** If `npm run check` can catch it, the reviewer does not re-check it.

**The decision stays with the human.** The reviewer reports findings and a recommended verdict; a human decides.

**Lite mode** (a small change): the entry gate, coverage, honesty, weakening, secrets and hygiene.

---

## 1. What NEVER To Do

> [!CAUTION]
>
> - 🚫 **No approval with a failing `npm run check`.**
> - 🚫 **No approval with an exposed secret.**
> - 🚫 **No fixing code in place.** Route each finding to the phase that owns it.
> - 🚫 **No baseline update approved without human inspection of the diff.**
> - 🚫 **No final verdict by an agent.** An agent recommends; a human decides.

---

## 2. Entry Gate

The review does not start until all three are true.

| Check                       | Required    | Actual |
| :-------------------------- | :---------- | :----- |
| `npm run check`             | Exit code 0 |        |
| Phase 5 status              | `Approved`  |        |
| `HANDOFF 5→6` block present | Yes         |        |

---

## 3. Focus Areas

Review in this order. Each area lists what to look for and when to flag.

| Area                    | What to look for                                                                                                            | Flag when                                                                                                               |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Coverage**            | Every `Automate` scenario from Phase 2 has a test, and unmapped tests are explained                                         | A scenario has no test, or a test has no scenario                                                                       |
| **Honesty**             | A passing test really checks what its scenario says, and was seen to fail on a broken condition                             | A test passes trivially, asserts something the scenario does not, or checks current behaviour where correct is expected |
| **Weakening**           | Skips, expected failures, loosened assertions, excluded rules, raised timeouts                                              | Any of these without a defect ID or an approval record                                                                  |
| **Determinism**         | Waits, shared state, order dependence, data collisions on shared backends                                                   | A test depends on timing, another test, or leftover data                                                                |
| **Locators**            | Choices match the live facts; exceptions have recorded reasons                                                              | A guessed locator, an unrecorded exception, a locator that works only by position                                       |
| **Complexity**          | The simplest thing that works                                                                                               | Speculative abstractions, extra layers, options or helpers nothing uses                                                 |
| **Intent**              | Titles, steps and names state the scenario's intent, so a failure at 2 AM reads clearly without opening the code            | Names describe mechanics instead of intent, or a failure message does not say what broke                                |
| **Ease of maintenance** | Reuse, single responsibility, diff size, and what breaks when the UI changes                                                | Duplicated logic, an object with two jobs, locators scattered, a diff too large to review                               |
| **Evidence**            | Run record complete, failures triaged correctly, raw output saved                                                           | A missing run record, a failure classified without evidence, code edited during a run                                   |
| **Defects**             | Real defects logged with durable artifacts; known defects handled by policy                                                 | A failure explained away, or a defect with no ledger entry                                                              |
| **Secrets**             | Keys, tokens, passwords, cookies or personal data in code, config, test data, logs, traces, screenshots and saved artifacts | Any secret exposed. Public demo keys must be labelled as such                                                           |
| **Hygiene**             | Baselines, debug leftovers, stale handoffs, decisions and lessons logged                                                    | A baseline updated without approval, leftover debug code, a stale handoff, a decision not logged                        |

### Risks to expect when an agent wrote the code

- Tests that pass trivially.
- Locators that look plausible but were never checked live.
- A test shaped around an observed bug so that it passes.
- Assertions weakened to get a green run.
- Scope beyond the approved scenarios.

---

## 4. Findings

If a review tool is named, findings live there and this section holds only the link. Levels are defined in `docs/templates/README.md`.

| ID  | Area | Level (`Blocker`, `Change requested`, `Suggestion`) | Finding | Route to phase | Status |
| :-- | :--- | :-------------------------------------------------- | :------ | :------------- | :----- |

Route each finding to the phase that owns the problem: a scenario gap to Phase 2, a structure problem to Phase 3, a code problem to Phase 4, a bad run to Phase 5. Each routed finding is also written as a return block at the end of that phase's section (see "Returns" in `docs/templates/README.md`).

---

## 5. Verdict

- **Recommended verdict**: `[Approved | Changes requested]`. `Approved` only with no `Blocker` and no open `Change requested`.
- **Reasoning**:
- **Final decision (human)**: `[Approved | Changes requested]`, by `[Name]`, on `[YYYY-MM-DD]`.

---

## 6. Close-Out

- **Log entries made**: `[D-nnn, L-nnn, or none]`
- Delete the inbound `HANDOFF 5→6` block from Section 5.
- Promote any lesson that has repeated into `CORE_PRINCIPLES.md` or a template, then remove it from `docs/LOG.md`.
