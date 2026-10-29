# Phase 2: Scenarios — What to Check and Why

- **Target Application**: `[Target Name]`
- **Scope**: `[Feature / domain / change under test]`
- **Mode**: `[Full | Lite]`
- **Feature context**: `[none | <tool> + key or link]`
- **Test cases**: `[none | <tool>]`
- **Defects**: `[none | <tool>]`

A named tool owns that content (see "External systems" in `docs/templates/README.md`). This section keeps intent, reasoning and `External refs`. With `none`, the scenarios here are the test cases.

- **Date**: `[YYYY-MM-DD]`
- **Author / Agent**: `[Name / Model]`
- **Status**: `[Draft | Approved]`

## Boundaries

| Reads                                                                                                          | Produces                              | Must NOT contain                                                                                                                                                        |
| :------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section 1 of the workbook, including any `HANDOFF 1→2` block; feature context, read-only, when a tool is named | Section 2 of `docs/targets/<site>.md` | Locators, selectors, page or component names, fixtures, spec file names, assertion syntax (Phases 3–4). Raw observations or defect write-ups (Phases 1, 5): cite by ID. |

**Lite mode** (a single feature or change): fill only §4 (risks), §6 (scenarios) and §10 (sign-off). Use Full mode for a new target or a new feature area.

---

## 1. What NEVER To Do

> [!CAUTION]
>
> - 🚫 **No Gherkin keywords.** Write the user's intent and the expected behavior in plain sentences.
> - 🚫 **No mega-scenarios.** One intent per scenario, so a failure points at one cause.
> - 🚫 **No scenario without a risk and an oracle.** If you cannot say what failure it guards against or how you would recognise a problem, it does not belong here.
> - 🚫 **No happy-path-only coverage.** Apply the techniques in §5 to every data entity that matters.
> - 🚫 **No implementation detail.** How it is located, structured or asserted belongs to Phases 3 and 4.
> - 🚫 **No restating Phase 1.** Reference facts and defects by section or `DEF-ID`.
> - 🚫 **No automating by default.** Every scenario gets an explicit decision (§8).

---

## 2. Context Frame

Which qualities matter for this target, and what constrains testing. Rate each criterion `High`, `Medium`, `Low` or `Out`, with a reason.

| Quality criterion                   | Importance | Why (cite Phase 1 section) |
| :---------------------------------- | :--------- | :------------------------- |
| Functionality                       |            |                            |
| Reliability and error handling      |            |                            |
| Usability                           |            |                            |
| Accessibility                       |            |                            |
| Security                            |            |                            |
| Performance                         |            |                            |
| Compatibility (browsers, viewports) |            |                            |
| Localization                        |            |                            |
| Testability and maintainability     |            |                            |

- **Constraints** (shared data, rate limits, credentials, environments, run time):
- **Out of scope** (and why):

---

## 3. Intake and Feature Context Cross-Check

### 3.1 Feature context cross-check

Skip when `Feature context` is `none`. Compare each acceptance criterion or technical note with the Phase 1 findings. Cite the criterion by key; do not copy its text.

| Criterion or note (key) | Phase 1 reference | Result (`Confirmed`, `Contradicted`, `Not observed`, `Unspecified behaviour`) | Disposition |
| :---------------------- | :---------------- | :---------------------------------------------------------------------------- | :---------- |

### 3.2 Phase 1 intake

Every hotspot, open question and defect from Phase 1 gets a disposition. Nothing is silently dropped.

| Phase 1 source (section or `DEF-ID`) | Item | Disposition (`SC-nnn`, `CH-nnn`, or `Dropped: reason`) |
| :----------------------------------- | :--- | :----------------------------------------------------- |

> When every row has a disposition, **delete the `HANDOFF 1→2` block from Section 1.**

---

## 4. Risk Register

Risk = how likely a failure is x how much it matters to someone. Derive priority from the two ratings.

| Risk ID | Failure mode (what goes wrong, for whom) | Likelihood (H/M/L) | Impact (H/M/L) | Priority | Covered by |
| :------ | :--------------------------------------- | :----------------- | :------------- | :------- | :--------- |
| `R-001` |                                          |                    |                | `P0`     | `SC-001`   |

Priority tiers, tags, cadence and the likelihood-by-impact matrix are defined in `docs/templates/README.md` ("Priority"). Do not restate them here.

---

## 5. Test Techniques and Data Variation

For each data entity or behavior that matters, choose the technique that fits and list the cases it produces.

| Technique             | Use when                                                           |
| :-------------------- | :----------------------------------------------------------------- |
| Zero / One / Many     | Counts and collections (empty, single, typical, overflow)          |
| Boundary values       | Ranges and limits (min, max, just outside)                         |
| Equivalence classes   | Inputs that behave alike (valid, invalid, special)                 |
| State transition      | Behavior depends on history (cart 1→0, logged in/out)              |
| Decision table        | Several conditions combine into outcomes (rules, discounts)        |
| Pairwise combinations | Many independent options (filters, settings)                       |
| Flow / story          | A credible end-to-end journey that crosses features                |
| Claims                | The product states a promise (banner, FAQ, docs) and you verify it |
| Stress                | Rapid repetition, large input, slow or failing dependencies        |

| Entity / behavior | Technique | Derived cases | Scenario |
| :---------------- | :-------- | :------------ | :------- |

---

## 6. Scenario Catalog

Each scenario has one intent, one risk, one technique and one oracle.

- **Level, Oracle and Decision values** are defined in `docs/templates/README.md`.
- **Preconditions and data**: what must be true (auth state, seed data, isolation needs). State needs, not mechanics.
- **External refs**: free text linking the scenario to the team's tools, for example a ticket and criterion (`PROJ-123 AC2`), a test case (`C12345`), `to create`, or empty.

### 6.1 Functional (UI and end-to-end)

| ID       | Intent (plain language) | Risk    | Technique | Oracle | Priority | Preconditions and data | Decision | External refs |
| :------- | :---------------------- | :------ | :-------- | :----- | :------- | :--------------------- | :------- | :------------ |
| `SC-001` |                         | `R-001` |           |        |          |                        |          |               |

### 6.2 API contract

Cover: successful contract per endpoint, authentication failures, validation failures, pagination and filter boundaries, state-changing chains, idempotency, rate limits and latency.

| ID  | Intent | Risk | Technique | Oracle | Priority | Preconditions and data | Decision | External refs |
| :-- | :----- | :--- | :-------- | :----- | :------- | :--------------------- | :------- | :------------ |

### 6.3 Visual

Dynamic regions come from Phase 1; list the region, not its selector.

| ID        | Page or component | Viewports | Dynamic regions to freeze or mask | Risk | Priority | Decision |
| :-------- | :---------------- | :-------- | :-------------------------------- | :--- | :------- | :------- |
| `VIS-001` |                   |           |                                   |      |          |          |

### 6.4 Audit and non-functional

Draw from the criteria rated `High` or `Medium` in §2: accessibility, performance budgets, SEO, security basics, resilience (slow or failing network), compatibility.

| ID        | Target page or route | Audit type | Standard or budget | Risk | Priority | Decision |
| :-------- | :------------------- | :--------- | :----------------- | :--- | :------- | :------- |
| `AUD-001` |                      |            |                    |      |          |          |

---

## 7. Exploratory Charters

For risks that are not worth automating, or that need a human's judgement. A charter guides a timeboxed session; it is not a script.

| ID       | Explore (area) | With (resources, techniques, data) | To discover (information wanted) | Timebox | Risk | What to record |
| :------- | :------------- | :--------------------------------- | :------------------------------- | :------ | :--- | :------------- |
| `CH-001` |                |                                    |                                  |         |      |                |

---

## 8. Automation Decision

Rate each scenario `1` (low) to `3` (high) on:

- **Risk**: how much a failure matters.
- **Frequency**: how often the behavior is used or changed.
- **Stability**: how settled the feature is.
- **Determinism**: whether it can run reliably without waiting on luck, time or shared data.
- **Cost**: effort to build and maintain (higher means more costly).

Decide:

- **Automate** when risk and determinism are both at least 2 and cost does not outweigh risk and frequency.
- **Charter** when risk is high but determinism is low, or the judgement needs a human.
- **Not covered** when risk is low and cost is high. Record it in §9.

| Scenario | Risk | Frequency | Stability | Determinism | Cost | Decision | Note |
| :------- | :--- | :-------- | :-------- | :---------- | :--- | :------- | :--- |

---

## 9. Known Defects and Coverage Gaps

**Known defects**: how a scenario behaves while a Phase 1 or Phase 5 defect is open.

| `DEF-ID` | Scenario | Policy (`Expect failure until fixed` / `Exclude` / `Assert current behavior`) |
| :------- | :------- | :---------------------------------------------------------------------------- |

**Not covered**: what is deliberately not tested.

| Item | Reason | Revisit when |
| :--- | :----- | :----------- |

---

## 10. Sign-Off and Handoff

- **Reviewed by**: `[Name]`
- **Date**: `[YYYY-MM-DD]`
- **Status**: `[Draft | Approved]` (Phase 3 starts only after `Approved`)

### Handoff to Phase 3

A handoff holds only transient items: open questions, assumptions to confirm, and pointers to IDs. It never copies content that lives elsewhere in this document. Phase 3 resolves each item in its own section and **deletes this block once every item is resolved, no later than its sign-off**.

```text
<!-- HANDOFF 2→3 status=open -->
- Approved scenario IDs:
- Open questions for design (for example auth state needs, shared-data constraints):
- Assumptions Phase 3 must confirm:
<!-- /HANDOFF -->
```
