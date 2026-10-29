# Phase 1: Comprehensive Context-Driven & Technical Exploration Blueprint

- **Target Application**: `[Target Name]`
- **Target URL / Base URL**: `[URL]`
- **Type**: `Web UI` | `REST API` | `Hybrid`
- **Scope**: `Full` | `Partial: [area or change]`
- **Feature context**: `[none | <tool> + key or link]`. Not read in this phase.
- **Date**: `[YYYY-MM-DD]`
- **Explorer Agent / Engineer**: `[Agent Name / Model]`
- **Core Frameworks Applied**: `SFDIPOT` (Product Elements Model), `FEW HICCUPPS` (Consistency Oracles), Structured Exploratory Tours, and Intrinsic Testability Analysis.

## Boundaries

| Reads                                                                   | Produces                              | Must NOT contain                                                                     |
| :---------------------------------------------------------------------- | :------------------------------------ | :----------------------------------------------------------------------------------- |
| The live application and supplied documents, except the feature context | Section 1 of `docs/targets/<site>.md` | Decisions about what to test, priorities, scenarios, test code, or structural design |

Partial scope is this phase's Lite mode. Sign-off and the handoff are always required.

---

## Phase 1 Guardrails: What NEVER To Do

> [!CAUTION]
>
> - 🚫 **NEVER confuse mechanical DOM scraping with exploratory testing**: Exploration is a simultaneous process of learning, product modeling, touring, active probing, and oracle evaluation.
> - 🚫 **NEVER guess DOM elements, routing, or API contracts**: Always inspect the live application using browser inspection tools or extraction probes.
> - 🚫 **NEVER write test scripts during exploration**: This phase is strictly for technical reconnaissance, heuristic probing, architectural mapping, and defect discovery.
> - 🚫 **NEVER rely on fragile CSS selector chains or XPath**: Capture semantic roles (`getByRole`), labels (`getByLabel`), and text alternatives (`getByText`) first, and record test ids only as a documented fallback.
> - 🚫 **NEVER ignore dynamic or animated elements**: Carousels, toasts, and sticky headers must be documented early so they don't cause flaky visual snapshot failures later.
> - 🚫 **NEVER hide bugs caught during exploration**: If a page throws console errors, has broken images, math inconsistencies, or unlabelled controls on load, log them immediately in `docs/targets/<site>-defects.md`. If a defect tool is named, file there only after approval, and keep the `DEF-ID` and ticket key in the ledger.
> - 🚫 **NEVER read the feature context during this phase**: Acceptance criteria and technical notes are cross-checked against these findings at the start of Phase 2. Reading them first anchors the explorer and hides what the product really does.

---

## Partial Exploration

Use `Scope: Partial` when only part of the application is changing. Explore that part, not the whole site.

1. **State the scope.** Name the area or change, and the `SFDIPOT` points and oracles you are applying to it.
2. **Record what was not explored.** List the areas left out, so a reader never mistakes silence for coverage.
3. **Check the neighbours.** Find areas that share components or state with the change (for example a header, a cart, shared storage) and do a quick check of each.
4. **Stamp coverage.** Update the coverage map below with the date and, where known, the build or version.

Each section heading below carries two tags:

- **Applies to**: `[UI]`, `[API]` or `[Both]`. Skip sections that do not match the `Type` field.
- **Partial**: `always` means cover it for the changed area; `if relevant` means cover it only when the change touches it, and otherwise note it as not explored.

### Coverage map

Keep this table at the top of Section 1 of the workbook. Areas not re-verified since the date shown are trusted accordingly.

| Area | Last explored | Scope (`Full` / `Partial: change`) | Build or version | Notes |
| :--- | :------------ | :--------------------------------- | :--------------- | :---- |

---

## `SFDIPOT` Product Coverage Reference Model

Use the 7 `SFDIPOT` product dimensions across this exploration to guarantee no technical or functional blind spots remain:

| Dimension          | What It Models                                                                                | Covered In Section(s) |
| :----------------- | :-------------------------------------------------------------------------------------------- | :-------------------- |
| **S — Structure**  | Everything that comprises the physical product: DOM hierarchy, components, bundles, assets.   | 1.2, 1.7, 1.8         |
| **F — Function**   | Everything the product does: search, filtering, calculations, authentication, error rules.    | 1.2, 1.9, 1.10        |
| **D — Data**       | Everything the product processes or persists: inputs, `localStorage`, cookies, stored items.  | 1.3, 1.5, 1.9         |
| **I — Interfaces** | Every conduit by which the product is accessed: UI controls, REST/GraphQL APIs, URL routing.  | 1.2, 1.5, 1.7         |
| **P — Platform**   | Everything on which the product depends: browser engine, viewport breakpoints, external CDNs. | 1.5, 1.8, 1.12        |
| **O — Operations** | How the product will be used (and abused): user personas, reloads, Back button, saboteurs.    | 1.1, 1.3, 1.10        |
| **T — Time**       | Any relationship between product and time: hydration, debounce, race conditions, animations.  | 1.4, 1.11, 1.12       |

---

## 1.1 Mission, Value Proposition & Stakeholder Risk Profile `[Both]` `Partial: if relevant`

- **Core Value Proposition**: (What is the primary promise of this application to its users?)
- **Key User Personas & Stakeholders**: (Who uses it, and who depends on it?)
- **Top Threats to Product Value**: (What failures would destroy user trust or revenue?)

---

## 1.2 Frontend Architecture, Routing & `SFDIPOT` Structure `[UI]` `Partial: if relevant`

- **Framework / Library**: (e.g., React SPA, Next.js, Vue, Angular, server-rendered pages)
- **DOM Root Mount**: (e.g., `<div id="root">`, `<div id="app">`)
- **Routing Strategy**: (e.g., client-side history, hash routing `/#/`, full page reloads)
- **Route & Feature Inventory (`Structure` & `Function`)**: (List each route or screen with its main function.)

---

## 1.3 State Persistence, Auth Boundaries & Navigation Resilience (`SFDIPOT` Data & Operations) `[Both]` `Partial: if relevant`

- **Client Storage Mechanisms** `[UI]`:
  - `localStorage` keys & payload structure:
  - `sessionStorage` keys:
  - `document.cookie` / HTTP-only cookies:
  - `IndexedDB` databases:
- **Authentication, Session Lifecycle & Role Boundaries**:
  - **Guest vs. Authenticated Access**: Which routes or actions are accessible to guests vs. strictly gated behind login?
  - **Demo / Test Credentials**: Are static test accounts provided, or is dynamic registration required?
  - **Logout & Session Cleanup**: Does logging out cleanly purge auth tokens and sensitive state, or does state leak into the next session?
- **Test Data Volatility & Seeding Profile**:
  - Is backend data static and deterministic, or shared and mutable across sessions?
  - Can tests rely on fixed names or IDs, or should tests dynamically target the first available item?
- **State Survival & Navigation Probes (`Operations`)** `[UI]`:
  - **Hard Reload (`F5`)**: Does cart, session or filter state persist across full page reloads?
  - **Browser Back / Forward Buttons**: Do history transitions restore previous view states cleanly without stale UI?
  - **Direct URL Deep-Linking & Tampering**: What happens when navigating directly to an invalid ID, invalid query params, or a gated page with empty state?
  - **Multi-Tab / Session Sync**: If state is changed in one tab or storage is mutated, does a reload reflect the updated state?

---

## 1.4 Hydration, Render Timing & Asynchronous Race Traps (`SFDIPOT` Time) `[UI]` `Partial: if relevant`

- **Hydration Behavior**: (Delay between initial HTML paint and JS event listener attachment)
- **Skeleton Loaders & Spinners**: (Placeholders that shift layout or block clicks before content resolves)
- **Search Input Debounce**: (Delay in ms before autocomplete or filter fires)
- **State Synchronization**: (Optimistic UI update vs. awaiting network confirmation)
- **Rapid Interaction / Double-Click Probe**: (Does rapid clicking on an action, quantity `+`/`-`, or "Submit" cause duplicate state mutations, `NaN` totals, or race errors?)
- **Overlay & Animation Interceptions**: (Do modal backdrops, slide-out drawers, or toast notifications intercept pointer events during transitions?)

---

## 1.5 Network Calls, Backend APIs & Third-Party Dependencies (`SFDIPOT` Interfaces & Platform) `[Both]` `Partial: always`

### 1.5.1 First-Party API Contracts

| User Action / Operation | Triggered Endpoint | HTTP Method | Auth / Headers | Response Envelope / Status |
| :---------------------- | :----------------- | :---------- | :------------- | :------------------------- |

### 1.5.2 Third-Party Scripts & External Dependencies `[UI]`

- **External Domains / CDNs Contacted**: (e.g., font hosts, image CDNs, analytics trackers, payment SDKs)
- **Offline / Throttled Dependency Risk**: (Would a slow or blocked third-party asset hang `networkidle` or break page rendering?)

### 1.5.3 API-Specific Probes `[API]`

- **Authentication scheme**: (API key, bearer token, cookie; how it is obtained and where it is sent)
- **Pagination and filtering**: (Parameters, defaults, limits, behaviour at the boundaries)
- **Rate limits and latency**: (Limits, headers, the error returned when exceeded)
- **Error envelope**: (Shape of error responses, status codes used for validation, auth and not-found failures)
- **Idempotency and state**: (Which calls change state, whether repeating them is safe)
- **Versioning and schema availability**: (Version in URL or header; OpenAPI or other schema, and whether it matches observed responses)

---

## 1.6 Browser Console Errors & Runtime Telemetry `[UI]` `Partial: always`

- **Uncaught JavaScript Exceptions (`pageerror`)**: (List any unhandled runtime exceptions)
- **Console Errors & Warnings (`console.error` / `console.warn`)**: (Hydration mismatches, duplicate keys, CORS errors, deprecation warnings)
- **404 / Broken Network Assets**: (Missing images, broken fonts, failed API calls)

---

## 1.7 Semantic Accessibility, Landmarks & Locator-Relevant Facts `[UI]` `Partial: always`

This section records facts only. Choosing locators belongs to Phase 4.

### 1.7.1 ARIA Landmark Regions

| Landmark Role (`getByRole`) | HTML Element           | Present on Page? | Observed purpose |
| :-------------------------- | :--------------------- | :--------------- | :--------------- |
| `'banner'`                  | `<header>`             | Yes / No         |                  |
| `'navigation'`              | `<nav>`                | Yes / No         |                  |
| `'main'`                    | `<main>`               | Yes / No         |                  |
| `'dialog'` / `'region'`     | `<dialog>` / `<aside>` | Yes / No         |                  |
| `'contentinfo'`             | `<footer>`             | Yes / No         |                  |

### 1.7.2 Interactive Control & Heading Facts

| Element Purpose    | Semantic Role (`getByRole`) | Accessible Name | Label Pairing (`<label for>`) | Heading Level               |
| :----------------- | :-------------------------- | :-------------- | :---------------------------- | :-------------------------- |
| Brand / Home       |                             |                 |                               |                             |
| Primary search     |                             |                 |                               |                             |
| Section headings   |                             |                 |                               |                             |
| Primary page title | `'heading'`                 |                 | N/A                           | `<h1>` (should be singular) |

### 1.7.3 Keyboard-Only Operability Probe

- Can all primary interactive controls be reached via `Tab` / `Shift+Tab` with a visible focus ring?
- Does `Enter` / `Space` activate buttons and links?
- Does `Escape` close open modals, dropdowns, or slide-out drawers?
- Is focus trapped properly inside open modals and drawers?

### 1.7.4 Test Ids

- **Test ids present** (`data-testid` or similar): Yes / No, and on which areas.
- **Duplicates** (repeated or cloned elements that share an id):

---

## 1.8 Shadow DOM, Iframes & Viewport Platform Adaptation (`SFDIPOT` Platform) `[UI]` `Partial: if relevant`

- **Shadow DOM Components**: (Are custom Web Components used? Does Playwright pierce them natively?)
- **Embedded Iframes**: (Payment gateways, CAPTCHAs, chat widgets, and the frame strategy they need)
- **Responsive Viewport Breakpoint Behavior (`Platform`)**:
  - **Desktop (`1280x720`)**: Full navigation, multi-column layout.
  - **Tablet (`768x1024`)**: Layout reflow, sidebar behaviour.
  - **Mobile (`390x844`)**: Does navigation collapse into a menu toggle? Do sticky headers or chat widgets obscure primary actions?

---

## 1.9 Interactive Elements, Component States & Domain Variables `[UI]` `Partial: always`

| Interactive Control | Default State | Active / Expanded State | Disabled / Boundary State | Hover Trigger Required? |
| :------------------ | :------------ | :---------------------- | :------------------------ | :---------------------- |
|                     |               |                         |                           |                         |

- **Key Domain Variables Identified (Things That Vary)**: (States, variants, limits and special cases the product handles, for example empty, single and many items, or valid and invalid inputs.)

---

## 1.10 Exploratory Tours & `FEW HICCUPPS` Consistency Oracles `[Both]` `Partial: always`

### 1.10.1 Structured Exploratory Tours Executed

1. **Business District Tour**: End-to-end traversal of the core user path in the area explored.
2. **Skeptical Customer Tour**: Cross-checking calculations, totals, sort order accuracy and filter counts.
3. **Saboteur / Bad Neighborhood Tour**: Probing boundary values (`0`, `-1`, very large), hostile strings (`%%%`, `<script>`), empty form submissions, rapid double-clicks, and URL tampering.

### 1.10.2 `FEW HICCUPPS` Consistency Oracle Evaluation

Evaluate the live application against each oracle. Oracle names are defined in `docs/templates/README.md`.

| Oracle                 | What It Evaluates                                                                                                      | Live Observation / Pass or Defect Reference |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ |
| Familiar problems      | Classic traps: floating-point rounding, off-by-one counts, `NaN`, `undefined`, `[object Object]`.                      |                                             |
| Explainability         | State changes and errors are understandable (no silent failures or mysterious resets).                                 |                                             |
| World                  | Real-world domain rules hold true (no negative quantities, negative shipping, or `$0.00` totals on paid items).        |                                             |
| History                | State transitions stay consistent with prior actions in the session (removing an item restores the previous subtotal). |                                             |
| Image                  | Visual credibility: no broken images, clipped text, overlapping elements, placeholder or debug text.                   |                                             |
| Comparable products    | Follows universal web conventions (logo goes home, `Enter` submits, `Escape` closes, badges update).                   |                                             |
| Claims                 | The UI does what its own labels, banners and messages claim.                                                           |                                             |
| User expectations      | Supports reasonable user goals smoothly (clear empty states, actionable validation messages).                          |                                             |
| Product consistency    | Internal consistency across views: names, identifiers and prices match everywhere they appear.                         |                                             |
| Purpose                | Controls fulfil their intended purpose (a sort sorts, a filter filters).                                               |                                             |
| Statutes and standards | Compliance with WCAG 2.1 AA (contrast, `<label>`, `alt` text, `html[lang]`), security and semantic HTML.               |                                             |

---

## 1.11 Dynamic, Animated & Visual Sensitivity Widgets `[UI]` `Partial: always`

- **Auto-playing Carousels / Sliders**:
  - Widget type and the region to mask:
  - Auto-play interval:
- **Sticky Navigation / Floating Banners**:
  - Header shrinks or sticks on scroll: Yes / No
- **Live Counters / Timers / Dynamic Badges**: (Countdown timers, dynamic stock alerts, or random items that need masking in visual snapshots.)

---

## 1.12 Baseline Core Web Vitals & Testability Scorecard `[Both]` `Partial: always for testability, if relevant for vitals`

- **Largest Contentful Paint (LCP) Candidate** `[UI]`: (Hero image or primary heading)
- **Cumulative Layout Shift (CLS) Hazards** `[UI]`: (Images missing explicit `width`/`height`, late-injected banners)
- **Image Lazy Loading & Alt Audit** `[UI]`:
  - Native `loading="lazy"` or `data-src` present: Yes / No
  - Images missing `alt` attribute: (Count and where)
- **Intrinsic Testability Scorecard (1–5)**:
  - _Observability (API, console, DOM state clarity)_: `[1-5]/5`
  - _Controllability (deterministic state reset, direct URLs)_: `[1-5]/5`
  - _Algorithmic Simplicity & Stability (predictable rules)_: `[1-5]/5`
  - _Semantic Accessibility (role-first locator readiness)_: `[1-5]/5` `[UI]`
  - _Key Testability Recommendations for Engineering_: (List actionable improvements)

---

## Sign-Off and Handoff

- **Reviewed by**: `[Name]`
- **Date**: `[YYYY-MM-DD]`
- **Status**: `[Draft | Approved]` (Phase 2 starts only after `Approved`)
- **Log entries made this phase**: `[D-nnn, L-nnn, or none]`

### Handoff to Phase 2

Pointers and open questions only. Phase 2 resolves each item in its own section and **deletes this block once every item is resolved, no later than its sign-off**.

```text
<!-- HANDOFF 1→2 status=open -->
- Pointers to fragile or suspicious areas (section references):
- Open questions for Phase 2:
<!-- /HANDOFF -->
```
