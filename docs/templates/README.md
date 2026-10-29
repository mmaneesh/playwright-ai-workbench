# Phase Templates — Map, Vocabulary and Handoffs

This file is the single source for how the six phase templates fit together. Templates reference it and never redefine what is defined here. If a template contradicts this file, this file wins and the template is the bug.

## Where things live

| Document                         | Holds                                                                       |
| :------------------------------- | :-------------------------------------------------------------------------- |
| `AGENTS.md`                      | Entry point for any agent: read order and the rules that cannot wait        |
| `CORE_PRINCIPLES.md`             | Code rules: standards, guardrails, structure, naming, approval gates        |
| `docs/templates/` (this folder)  | How we work: the phases, their boundaries, shared vocabulary                |
| `docs/targets/<site>.md`         | The workbook: what we found and decided for one application                 |
| `docs/targets/evidence/`         | Raw run logs and durable defect artifacts (`test-results/` is not evidence) |
| `docs/targets/<site>-defects.md` | The defect ledger for that application                                      |
| `docs/LOG.md`                    | Decisions (`D-nnn`) and lessons from mistakes (`L-nnn`), all targets        |

## Phase map

Each phase owns its content. A later phase references earlier content by ID or section and never restates it.

| #   | Phase             | Question it answers              | Reads                                                                | Writes (workbook)            | Owns                                                                                                        | Must NOT contain                                         |
| :-- | :---------------- | :------------------------------- | :------------------------------------------------------------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| 1   | Explore           | What is the application, really? | Live app, supplied docs (not the feature context)                    | Section 1                    | Facts, observations, oracle findings, testability, defects found                                            | Decisions about what to test                             |
| 2   | Scenarios         | What should we check, and why?   | Section 1                                                            | Section 2                    | Risks, priorities, techniques, scenarios, charters, coverage gaps                                           | Locators, page or component names, fixtures, spec files  |
| 3   | Automation design | How is the test code structured? | Approved Section 2; structural facts in Section 1; the existing repo | Section 3                    | Reuse decisions, scenario-to-test mapping, pages, components, fixtures, data, state setup, execution design | Why a scenario exists; locator choices; assertions; code |
| 4   | Test spec         | How is each check written?       | Sections 1.7, 2 and 3                                                | Section 4 and the code       | Locator choices and exceptions, waits, assertions by reference, known-defect handling, the code             | New scenarios; new structure; run evidence               |
| 5   | Evidence          | What happened when we ran it?    | The code, Sections 2 and 4, the handoff                              | Section 5 and ledger entries | Run record, results by scenario, triage, defects raised, reporting records                                  | Scope opinions; new scenarios; code edits during a run   |
| 6   | Review            | Is it fit to merge?              | The diff, Sections 2–5 by link, check output                         | Section 6                    | Findings, a recommended verdict, and the human decision                                                     | New scenarios; rewriting code                            |

Section N of the workbook belongs to Phase N. Its subsections N.1, N.2, and so on are the template's content sections in order, after the guardrails.

Phase 4 is where page-object and spec code is written. Phase 3 is design only. The code is the specification, so Section 4 records only decisions the code cannot say.

## Modes

- **Full**: a new target or a new feature area. Fill every section.
- **Lite**: one feature or one change. Each template names the few sections to fill. Sign-off and handoff are always required.
- **Partial** (Phase 1 only): explore only the area a change touches. See the Partial exploration section of the Phase 1 template.

## Shared vocabulary

### IDs

`R-nnn` risk, `SC-nnn` functional or API scenario, `VIS-nnn` visual scenario, `AUD-nnn` audit scenario, `CH-nnn` exploratory charter, `DEF-nnn` defect, `D-nnn` decision, `L-nnn` lesson. `External refs` is free text linking to items in a team's own tools (ticket and criterion, test case). IDs are never reused. Each prefix has one owner: risks, scenarios and charters belong to Phase 2, defects to the defect ledger, decisions and lessons to `docs/LOG.md`.

### Priority

| Priority | Tag           | Meaning                                                    | Cadence                 |
| :------- | :------------ | :--------------------------------------------------------- | :---------------------- |
| `P0`     | `@smoke`      | Core revenue, identity or discovery path. Blocks the build | Every commit or PR      |
| `P1`     | `@regression` | Secondary workflows, validation, state changes             | Nightly or release gate |
| `P2`     | `@edge`       | Boundaries, hostile input, persistence, empty states       | Weekly or full suite    |

Derive priority from likelihood and impact (`H`, `M`, `L`). Overriding it needs a one-line reason.

| Impact \ Likelihood | H    | M    | L    |
| :------------------ | :--- | :--- | :--- |
| H                   | `P0` | `P0` | `P1` |
| M                   | `P1` | `P2` | `P2` |
| L                   | `P2` | `P2` | `P2` |

### Test level

`UI`, `API`, `Visual`, `Audit`.

### Oracles

How a problem is recognised. Use these names everywhere: `Familiar problems`, `Explainability`, `World`, `History`, `Image`, `Comparable products`, `Claims`, `User expectations`, `Product consistency`, `Purpose`, `Statutes and standards`.

### Automation decision

`Automate`, `Charter`, `Not covered`.

### Defect severity

`High` blocks a core journey or a legal or accessibility standard for many users. `Medium` degrades a journey or blocks a smaller group. `Low` is cosmetic or minor.

### Triage classification

`Product defect`, `Known defect` (an expected failure tied to an open `DEF-ID`), `Test issue`, `Environment or data issue`, `Flaky`, `Unclear`.

### Defect status

`Open`, `Triaged`, `Remediated`, `Verified`, `Accepted`. Only a clean Phase 5 run moves a defect from `Remediated` to `Verified`.

### Review finding level and verdict

Finding levels: `Blocker` (cannot merge), `Change requested` (fix before merge), `Suggestion` (optional). Verdicts: `Approved`, `Changes requested`. A reviewer recommends a verdict; a human decides.

### Intake dispositions

Used when a phase takes in items from the one before: a scenario, charter or design item ID, `Dropped: reason`, `Handoff to Phase N`, `Owner question`, `Needs live check`.

The feature context cross-check in Phase 2 uses these results: `Confirmed`, `Contradicted`, `Not observed`, `Unspecified behaviour` (seen in the product, covered by no criterion).

## External systems

Feature context (acceptance criteria, technical notes), test cases, defects and review findings may live in a team's own tools. The framework is tool-neutral: integrations come from the team's own MCP servers, and Jira and TestRail are the reference examples.

| Role                       | Owner when a tool is used | Without a tool              |
| :------------------------- | :------------------------ | :-------------------------- |
| Feature context            | The tool                  | The workbook, from Phase 1  |
| Test cases and run results | The tool                  | The scenarios are the cases |
| Defects                    | The tool                  | `<site>-defects.md`         |
| Review findings            | The PR tool               | Section 6 of the workbook   |

- The workbook holds intent, reasoning and `External refs`, and never copies content the tool owns.
- Phase 1 does not read the feature context. Phase 2 cross-checks it against the Phase 1 findings.
- A scenario seeds a test case. Once the case exists in the tool, the tool owns its steps and expected results.
- A defect write-up moves into the tool's ticket when filed. The ledger keeps the `DEF-ID` and the ticket key.
- Writing to a shared tool needs approval each time.

## Handoffs

A handoff passes transient information to the next phase.

- **Contains only**: open questions, assumptions to confirm, and pointers to IDs. It never copies content that lives elsewhere.
- **Written by** the sending phase at its sign-off, as the last item in its section:

```text
<!-- HANDOFF N→M status=open -->
- Items:
<!-- /HANDOFF -->
```

- **Consumed by** the receiving phase, which resolves each item in its own section and **deletes the block once every item is resolved, no later than its own sign-off**. An open block under a phase that is signed off is a stale handoff and a defect in the workbook.

### Returns

A later phase that cannot proceed, or a reviewer who finds a problem, returns it to the phase that owns it. A return is a block of the same form with `status=return`, and the arrow points from the sender back to the owner. It is placed at the end of the owning phase's section.

```text
<!-- HANDOFF 4→3 status=return -->
- Items: what is wrong or unclear, with pointers.
<!-- /HANDOFF -->
```

The owning phase resolves each item, deletes the block, and signs off again (status returns to `Draft`, then `Approved`). Every later phase that depends on the changed content is re-checked, and repeated where needed, before it signs off. A phase cannot be `Approved` while a return block addressed to it remains.

## Sign-off

Every phase ends with: reviewer, date, status (`Draft` or `Approved`), the `D-` and `L-` entries made during the phase (or "none"), and the outbound handoff. The next phase starts only after `Approved`. Phase 6 differs: its status is `Draft` or `Complete`, its verdict is recorded in its Verdict section, and it has no outbound handoff because it ends the chain.

## Expert sources

Templates name techniques, not people. This table records where techniques come from. Every row must map to a template section or be removed. `Verified` means a source was checked on 2026-10-28; `From memory` means it must be confirmed before it is quoted elsewhere.

| Source                                       | Idea                                                 | Used in               | Status                                                                                                                                                                                                      |
| :------------------------------------------- | :--------------------------------------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| James Bach                                   | Heuristic Test Strategy Model                        | Phase 2 context, risk | Verified ([HTSM](https://developsense.com/htsm)); technique family list is from a secondary source                                                                                                          |
| Cem Kaner                                    | Scenario testing, domain testing                     | Phase 2 techniques    | Verified ([write-up](https://www.cs.hmc.edu/~markk/cs121.f07/supp/scenariotest.html))                                                                                                                       |
| Hans Buwalda                                 | Soap-opera tests                                     | Phase 2 techniques    | Verified ([Wikipedia](https://en.wikipedia.org/wiki/Scenario_testing))                                                                                                                                      |
| Brian Marick; Lisa Crispin and Janet Gregory | Agile testing quadrants                              | Phase 2 levels        | Verified ([TechTarget](https://www.techtarget.com/searchsoftwarequality/tip/Agile-testing-quadrants-Guiding-managers-and-teams-in-test-strategies))                                                         |
| Michael Bolton                               | FEW HICCUPPS oracles                                 | Phases 1, 2, 5        | Verified ([handout](https://developsense.com/resource/Oracles.pdf)); copy the exact list from his post before quoting                                                                                       |
| Elisabeth Hendrickson                        | Exploratory charters; zero, one, many heuristics     | Phase 2 charters      | From memory                                                                                                                                                                                                 |
| Myers, Beizer, Czerwonka                     | Boundary values, state and decision models, pairwise | Phase 2 techniques    | From memory                                                                                                                                                                                                 |
| Gerald Weinberg                              | Quality is value to some person                      | Phase 2 risk          | From memory                                                                                                                                                                                                 |
| Jonathan and James Bach                      | Session-based test management                        | Phase 2 charters      | From memory                                                                                                                                                                                                 |
| Phases 1 and 3–6                             | To be mapped when each template is rewritten         | n/a                   | Earlier candidates are unverified: Whittaker, Soundararajan, Balamurugadas (1); Fowler, Stewart, Meszaros (3); Dodds, Bahmutov, Beck (4); Kaner bug advocacy, Bolton test story (5); Farley, Beck, Page (6) |
