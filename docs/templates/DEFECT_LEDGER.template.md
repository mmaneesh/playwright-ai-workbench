# Defect Ledger

- **Target Application**: `[Target Name]`
- **Target URL / Host**: `[URL]`
- **Defect tool**: `[none | <tool>]`
- **Last Updated**: `[YYYY-MM-DD]`

With `Defect tool: none`, this ledger holds the full record of each defect. With a tool named, the full record lives in the tool's ticket, moved there when filed, and this ledger keeps only the summary row: ID, title, severity, ticket key and status. Filing a ticket needs approval.

Severity, test levels, oracle names, defect statuses and the `DEF-nnn` ID scheme are defined in `docs/templates/README.md`. They are not repeated here.

---

## 1. What NEVER To Do

> [!CAUTION]
>
> - 🚫 **No un-isolated or vague bugs.** Apply **RIMGEA** (**R**eplicate, **I**solate, **M**aximize, **G**eneralize, **E**xternalize, **A**nd state it clearly and dispassionately). A developer must be able to reproduce it in under 60 seconds.
> - 🚫 **No defect without an oracle and a stakeholder impact.** Say why the behaviour is wrong and who it hurts.
> - 🚫 **No defect without durable artifacts.** `test-results/` is overwritten every run and is not tracked. Attach artifacts to the ticket, or copy them to `docs/targets/evidence/`.
> - 🚫 **No `Verified` status without a clean run.** Only a Phase 5 run that passes honestly moves a defect from `Remediated` to `Verified`.

---

## 2. Summary Table

| Defect ID | Title | Severity | Level | Oracle | Found by (`Phase 1` or scenario ID) | Status | Ticket key |
| :-------- | :---- | :------- | :---- | :----- | :---------------------------------- | :----- | :--------- |

---

## 3. Detailed Records

Used when `Defect tool` is `none`.

### [DEF-nnn]: [Descriptive title]

- **Severity**: `High` | `Medium` | `Low`
- **Level**: `UI` | `API` | `Visual` | `Audit`
- **Oracle**: (name from the README vocabulary)
- **Status**: `Open` | `Triaged` | `Remediated` | `Verified` | `Accepted`
- **Found by**: `Phase 1` | `[scenario ID]`
- **Route or endpoint**:
- **Element or field**:

#### Stakeholder and user impact (Externalize)

[How this affects real users, assistive technology users, trust, or revenue.]

#### Minimal steps to reproduce (Replicate and Isolate)

1. Go to `[URL]`
2. Do `[minimal isolating action]`
3. Observe the behaviour

#### Generalization (Maximize and Generalize)

[One item or all of them? What makes it worse?]

#### Expected result

[Dispassionate statement of the expected behaviour and its source.]

#### Actual result

[Dispassionate statement of what happens.]

#### Diagnostics

```text
[Console error, scan violation, response body or validation error]
```

#### Artifacts

Stored durably (ticket attachment or `docs/targets/evidence/`):

- Screenshot:
- Trace:
- Command to view the trace: `npx playwright show-trace <path>`
