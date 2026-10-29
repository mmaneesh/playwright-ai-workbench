# Phase 5: Evidence — What Happened When We Ran It

- **Target Application**: `[Target Name]`
- **Scope**: `[Feature / domain / change]`
- **Mode**: `[Full | Lite]`
- **Date**: `[YYYY-MM-DD]`
- **Author / Agent**: `[Name / Model]`
- **Status**: `[Draft | Approved]`

## Boundaries

| Reads                                                                                     | Produces                                                                | Must NOT contain                                                                                        |
| :---------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| The code; Sections 2 and 4 of the workbook; the `HANDOFF 4→5` block; `CORE_PRINCIPLES.md` | Section 5 of `docs/targets/<site>.md`, and entries in the defect ledger | New scenarios (Phase 2); scope opinions; code edits made to turn a run green (fixes go back to Phase 4) |

The defect record format is owned by `docs/templates/DEFECT_LEDGER.template.md`. This phase raises defects and references them by ID.

**Lite mode** (a single feature or change): fill §2 (run record), §4 (results by scenario), §5 (triage) and §9 (sign-off).

---

## 1. What NEVER To Do

Code rules live in `CORE_PRINCIPLES.md`.

> [!CAUTION]
>
> - 🚫 **No fabricated or truncated evidence.** Record the real command, exit code, counts and durations. Quote every failure verbatim.
> - 🚫 **No loosening, skipping or quarantining to turn a run green.** A failing test that exposes a real defect is a success. Skipping or quarantining needs explicit approval.
> - 🚫 **No editing code during an evidence run.** A run is clean or it is not evidence. Fixes go back to Phase 4, then the run is repeated.
> - 🚫 **No vague bugs.** Apply the ledger template, which owns the record format.
> - 🚫 **No baseline updates and no writes to external tools without approval.**

---

## 2. Run Record

- **Environment and base URL**:
- **Projects and browsers**:
- **Build or commit**:
- **Retries setting**:
- **Date and time**:
- **Run by**:

---

## 3. Execution Summary

| Suite | Command Executed | Total | Passed | Failed | Flaky or Retried | Duration | Exit Code |
| :---- | :--------------- | :---- | :----- | :----- | :--------------- | :------- | :-------- |

Save the full raw output under `docs/targets/evidence/<site>-<date>-<suite>.txt` and reference it here. Paste the summary lines and every failure verbatim below.

```text
# Summary lines and every failure, exactly as printed
```

---

## 4. Results by Scenario

Every scenario marked `Automate` in Section 2 appears once. Tests with no scenario ID are listed as unmapped.

| Scenario ID | Test (spec file) | Result (`Pass`, `Fail`, `Expected failure`, `Not run`) | Triage | Defect | External refs |
| :---------- | :--------------- | :----------------------------------------------------- | :----- | :----- | :------------ |

---

## 5. Triage

Classify every failure before logging anything. Classifications are defined in `docs/templates/README.md`.

| Failing test | Classification | Evidence | Oracle | `DEF-ID` or fix owner |
| :----------- | :------------- | :------- | :----- | :-------------------- |

- Reproduce each failure in isolation first.
- Do not call a failure `Flaky` without repeated-run evidence.
- `Test issue` is returned to Phase 4 as a return block (see "Returns" in `docs/templates/README.md`). `Product defect` goes to the ledger.

---

## 6. Defects Raised This Run

`DEF-` IDs only. The record lives in the ledger.

---

## 7. Reporting to the Team's Tools

Skip when `Test cases` and `Defects` are `none`. Results and defects are written to a shared tool only after approval. Record the run link or ticket keys here.

| Item | Tool | Link or key | Approved by |
| :--- | :--- | :---------- | :---------- |

---

## 8. Visual Baseline Changes

Proposed only. Each change needs the diff evidence and an approval record before it is applied.

| Snapshot | Reason | Diff evidence | Approved by |
| :------- | :----- | :------------ | :---------- |

---

## 9. Sign-Off and Handoff

- **Reviewed by**: `[Name]`
- **Date**: `[YYYY-MM-DD]`
- **Status**: `[Draft | Approved]` (Phase 6 starts only after `Approved`)
- **Log entries made this phase**: `[D-nnn, L-nnn, or none]`

When every item in the inbound `HANDOFF 4→5` block is resolved above, **delete that block from Section 4.**

### Handoff to Phase 6

Open questions and pointers only. Phase 6 resolves each item and **deletes this block once every item is resolved, no later than its sign-off**.

```text
<!-- HANDOFF 5→6 status=open -->
- Failures still open and their DEF-IDs:
- Areas the reviewer should look at closely:
<!-- /HANDOFF -->
```
