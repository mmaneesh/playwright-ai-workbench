# Phase 4: Test Spec — How Each Check Is Written

- **Target Application**: `[Target Name]`
- **Scope**: `[Feature / domain / change]`
- **Mode**: `[Full | Lite]`
- **Date**: `[YYYY-MM-DD]`
- **Author / Agent**: `[Name / Model]`
- **Status**: `[Draft | Approved]`

## Boundaries

| Reads                                                                                                                   | Produces                                                                                                                              | Must NOT contain                                                                       |
| :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| Sections 2 and 3; locator-relevant facts in Section 1.7; the `HANDOFF 3→4` block; `CORE_PRINCIPLES.md`; reference specs | The page-object and spec code in the repo, and Section 4 of `docs/targets/<site>.md` (decisions only, never a prose copy of the code) | New scenarios (Phase 2); new structure (Phase 3: send it back); run evidence (Phase 5) |

The code is the specification. Section 4 records only what the code cannot say.

**Reference specs** (copy their pattern, do not copy prose from this file): UI `tests/ui/products.spec.ts`, visual `tests/visual/home.spec.ts`, audit `tests/audit/accessibility.spec.ts`, API `tests/api/billing-lifecycle.spec.ts`.

**Lite mode** (a single feature or change): fill §2 (live check), §3 (locator exceptions), §8 (checklist) and §9 (sign-off).

---

## 1. What NEVER To Do

Code rules live in `CORE_PRINCIPLES.md` (sections 2, 3 and 7) and are enforced by `npm run check`. They are not repeated here.

> [!CAUTION]
>
> - 🚫 **No locator or API contract written from memory.** Check the live application or the documented contract first (§2).
> - 🚫 **No loosening a test to make it pass.** A failing test that exposes a real defect is a success. Never relax an assertion, exclude a rule, or skip a test to turn it green.
> - 🚫 **No new scenarios or structure here.** Return them to Phase 2 or Phase 3 as a return block (see "Returns" in `docs/templates/README.md`).

---

## 2. Live Check Log

Everything the `HANDOFF 3→4` block marked "needs a live check", plus anything else confirmed before writing code.

| Item | How checked (browser snapshot, API call) | Finding | Date |
| :--- | :--------------------------------------- | :------ | :--- |

---

## 3. Locator Decisions and Exceptions

Record only exceptions to the default order and anything non-obvious. Facts come from Section 1.7.

| Element | Locator used (tier) | Source (Section 1.7 ref) | Reason, if below role-first | Scoping notes (duplicates, clones) |
| :------ | :------------------ | :----------------------- | :-------------------------- | :--------------------------------- |

---

## 4. Synchronisation Decisions

What signal means "ready" for each tricky interaction. Hard sleeps are forbidden, so this records the replacement.

| Interaction | Ready signal | Why (hover reveal, animation, debounce, async load) |
| :---------- | :----------- | :-------------------------------------------------- |

---

## 5. Assertions and Oracles

By reference, not a copy of the code.

| Scenario ID | What is asserted (one line) | Oracle |
| :---------- | :-------------------------- | :----- |

---

## 6. Known Defects

| Scenario ID | `DEF-ID` | How the test is marked | Expected until |
| :---------- | :------- | :--------------------- | :------------- |

---

## 7. Rules by Test Type

- **UI** `[UI]`: step wording describes the action in plain language. Imports come from `@fixtures`.
- **API** `[API]`: validate responses against the schema in `types/schemas/`; assert the status and the error envelope; authenticate through the fixture.
- **Visual** `[UI]`: animations disabled, dynamic regions masked (from Section 1.11), one project per viewport. Creating or updating a baseline needs approval.
- **Audit** `[UI]`: no rule suppression or exclusions. A failing rule that reflects a real defect is logged as a defect.

### Deviations from the design

| Item | Phase 3 said | Done instead | Reason | Log entry |
| :--- | :----------- | :----------- | :----- | :-------- |

---

## 8. Completion Checklist

- [ ] `npm run check` passes.
- [ ] Every `Automate` scenario has a test, and titles, tags and annotations follow `CORE_PRINCIPLES.md` section 7.
- [ ] Locator exceptions, synchronisation decisions and deviations are recorded above.
- [ ] A first local run was used to debug. The clean evidence run belongs to Phase 5.

---

## 9. Sign-Off and Handoff

- **Reviewed by**: `[Name]`
- **Date**: `[YYYY-MM-DD]`
- **Status**: `[Draft | Approved]` (Phase 5 starts only after `Approved`)
- **Log entries made this phase**: `[D-nnn, L-nnn, or none]`

When every item in the inbound `HANDOFF 3→4` block is resolved above, **delete that block from Section 3.**

### Handoff to Phase 5

Open questions and pointers only. Phase 5 resolves each item and **deletes this block once every item is resolved, no later than its sign-off**.

```text
<!-- HANDOFF 4→5 status=open -->
- Areas that need a deliberate evidence run (flake risk, shared data):
- Open questions for execution:
<!-- /HANDOFF -->
```
