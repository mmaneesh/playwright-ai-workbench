# Phase 3: Automation Design — How the Test Code Is Structured

- **Target Application**: `[Target Name]`
- **Scope**: `[Feature / domain / change]`
- **Mode**: `[Full | Lite]`
- **Date**: `[YYYY-MM-DD]`
- **Author / Agent**: `[Name / Model]`
- **Status**: `[Draft | Approved]`

## Boundaries

| Reads                                                                                                                                          | Produces                              | Must NOT contain                                                                                             |
| :--------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------------- |
| Approved Section 2 and its `HANDOFF 2→3` block; structural facts in Section 1 (1.2, 1.7 to 1.9, 1.11); the existing repo; `CORE_PRINCIPLES.md` | Section 3 of `docs/targets/<site>.md` | Why a scenario exists (Phase 2); locator choices, waits, assertions or code (Phase 4); run results (Phase 5) |

**Lite mode** (a single feature or change): fill only §2 (reuse check), §3 (mapping), §4 (only if new pages or components are needed) and §10 (sign-off).

---

## 1. What NEVER To Do

Code rules live in `CORE_PRINCIPLES.md` (sections 2, 3 and 7) and are not repeated here.

> [!CAUTION]
>
> - 🚫 **No new asset without a reuse check.** Look at what the repo already has first (§2).
> - 🚫 **No design for scenarios that are not `Approved` and marked `Automate`.**
> - 🚫 **No code and no locator syntax in this section.** Describe behaviours and responsibilities.
> - 🚫 **No silent deviation from Phase 2.** If a scenario cannot be built as written, return it to Phase 2 as a return block (see "Returns" in `docs/templates/README.md`).
> - 🚫 **No change to core configuration** (`config/`, hooks, guardrails) without approval.

---

## 2. Reuse Check

| Need (from the scenarios) | Existing asset (path) | Decision (`Reuse`, `Extend`, `New`) | Reason |
| :------------------------ | :-------------------- | :---------------------------------- | :----- |

---

## 3. Scenario-to-Test Mapping

One scenario, one test, unless the scenario is data-driven. Titles, tags and annotations follow `CORE_PRINCIPLES.md` section 7.

| Scenario ID | Suite (`ui`, `api`, `visual`, `audit`) | Spec file | Test title | Tags | Annotations (`scenario`, `requirement`, `case`, `defect`) | Notes |
| :---------- | :------------------------------------- | :-------- | :--------- | :--- | :-------------------------------------------------------- | :---- |

---

## 4. Pages and Components

Describe behaviours, not locators. A component is a reusable widget that appears on more than one page; a page is a route or screen. If you cannot state the responsibility in one sentence without "and", split it.

| Name | Kind (`page` / `component`) | Responsibility (one sentence) | Behaviours it exposes | Used by (scenario IDs) | `Reuse` / `Extend` / `New` |
| :--- | :-------------------------- | :---------------------------- | :-------------------- | :--------------------- | :------------------------- |

---

## 5. Fixtures and State Setup

### 5.1 Preconditions

| Scenario ID | Precondition | Mechanism (`UI`, `storage injection`, `API seeding`, `saved session`, `none`) | Isolation notes |
| :---------- | :----------- | :---------------------------------------------------------------------------- | :-------------- |

### 5.2 Fixture changes

| Fixture | Scope (`test` / `worker`) | Provides | Depends on | `New` / `Changed` |
| :------ | :------------------------ | :------- | :--------- | :---------------- |

---

## 6. Test Data

Secrets never go in the repo. Typed constants and factories only.

| Data need | Kind (`constant` / `factory`) | Owner file | Uniqueness and cleanup | Notes |
| :-------- | :---------------------------- | :--------- | :--------------------- | :---- |

---

## 7. Design by Test Type

- **UI** `[UI]`: browsers and projects needed.
- **API** `[API]`: request fixture and authentication; schemas to add (name and endpoint).
- **Visual** `[UI]`: viewports and projects; regions to freeze (from Section 1.11); baseline environment. Creating or updating baselines needs approval.
- **Audit** `[UI]`: pages, budgets, tags.

Any change to a suite config under `config/` is an approval gate.

---

## 8. Execution Design

- **Projects and browsers**:
- **Tags per pipeline stage** (from the Phase 2 cadence):
- **Parallelism and shared data** (collisions on a shared backend, unique data per worker):
- **Retries and flake policy**: follow the project policy once it exists; until then, no retries beyond the suite config.

---

## 9. Design Review Checklist

- [ ] Every `Automate` scenario appears in §3.
- [ ] Every new page or component passes the one-sentence test (§4).
- [ ] Nothing duplicates an existing asset (§2).
- [ ] Preconditions keep every test independent (§5).
- [ ] Testability gaps from Section 1.12 are raised with owners or accepted, with the decision recorded.

---

## 10. Sign-Off and Handoff

- **Reviewed by**: `[Name]`
- **Date**: `[YYYY-MM-DD]`
- **Status**: `[Draft | Approved]` (Phase 4 starts only after `Approved`)
- **Log entries made this phase**: `[D-nnn, L-nnn, or none]`

When every item in the inbound `HANDOFF 2→3` block is resolved above, **delete that block from Section 2.**

### Handoff to Phase 4

Open questions and pointers only. Phase 4 resolves each item and **deletes this block once every item is resolved, no later than its sign-off**.

```text
<!-- HANDOFF 3→4 status=open -->
- Items needing a live check before locators are chosen:
- Open questions for implementation:
<!-- /HANDOFF -->
```
