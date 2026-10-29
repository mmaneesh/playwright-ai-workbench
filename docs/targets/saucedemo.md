# Target Quality Engineering Workbook: Sauce Demo (Swag Labs)

- **Target Application**: Sauce Demo (Swag Labs)
- **Target URL**: `https://www.saucedemo.com`
- **Scope**: Full: login, inventory, cart, checkout (all 3 steps), logout. A second, auth-gated target chosen specifically to prove the framework and the `storageState` auth pattern against a different application than TestDino.
- **Feature context**: none
- **Test cases**: none
- **Defects**: none (the ledger holds the full records)
- **Suite Types**: `UI Functional`
- **Environment Config**: `env-config/saucedemo.env` (`UI_BASE_URL=https://www.saucedemo.com`)
- **Associated Defect Ledger**: [`saucedemo-defects.md`](saucedemo-defects.md)
- **Date**: October 29, 2026
- **Status**: `Phase 6 Draft (all phases 1-6 written 2026-10-29 in one continuous pass, suite verified green on a real run; awaiting human review and sign-off per phase)`

---

## Section 1: 12-Point Context-Driven & Technical Reconnaissance

_(Explored 2026-10-29 with the built-in browser, Desktop 1024x768 plus a 375x812 mobile spot check. One defect logged in `saucedemo-defects.md` as `DEF-001`.)_

### Coverage Map

| Area                                                                   | Last explored | Scope        | Build or version | Notes                                                                                                     |
| :--------------------------------------------------------------------- | :------------ | :----------- | :--------------- | :-------------------------------------------------------------------------------------------------------- |
| Login (`/`)                                                            | 2026-10-29    | Full         | not recorded     | All 6 published demo accounts' credentials verified; only `standard_user` and `locked_out_user` logged in |
| Inventory (`/inventory.html`)                                          | 2026-10-29    | Full         | not recorded     | Sort dropdown present, not exhaustively probed                                                            |
| Cart (`/cart.html`)                                                    | 2026-10-29    | Full         | not recorded     |                                                                                                           |
| Checkout steps 1-3                                                     | 2026-10-29    | Full         | not recorded     | `DEF-001` found here                                                                                      |
| `problem_user`, `visual_user`, `performance_glitch_user`, `error_user` | not explored  | out of scope | n/a              | Known accounts, documented for Phase 2 scenario candidates, not logged into this pass                     |

### 1.1 Mission, Value Proposition & Stakeholder Risk Profile

- **Core Value Proposition**: Public demo e-commerce storefront ("Swag Labs") built by Sauce Labs explicitly as an automation/QA practice target, with intentionally seeded defects behind specific demo accounts.
- **Key User Personas & Stakeholders**: A QA engineer or automation framework using the site as a sandbox. No real shoppers, no real inventory or payment.
- **Top Threats to Product Value**: n/a in the usual sense (not a production app) — but as a testing target, the "threat" is an automation suite that can't actually log in, add items, or complete checkout reliably.

### 1.2 Frontend Architecture, Routing & `SFDIPOT` Structure

- **Framework / Library**: SPA with bundled, hashed assets (`assets/index-*.js`, `assets/index-*.css`). Hosted on GitHub Pages behind a custom domain, using the standard `spa-github-pages` 404-redirect trick (confirmed: the browser tab briefly shows the title "Single Page Apps for GitHub Pages" during a direct deep-link load).
- **DOM Root Mount**: Not inspected directly; rendering is client-side.
- **Routing Strategy**: Client-side routing, but **direct navigation to a sub-route (e.g. `/cart.html`, `/checkout-step-one.html`) issues a real HTTP 404 first**, then auto-redirects via a `?/<path>` query-string rewrite to a 200 response that renders correctly. End-user outcome is unaffected (the page always ends up rendering right), but any test that asserts `response.status()` on `page.goto()` for a sub-route will see `404`, not `200` — confirmed via network log, not guessed. Prefer in-app navigation (click through) for anything after the login page, matching the project's existing `openRoute` convention.
- **Route & Feature Inventory (`Structure` & `Function`)**:
  - Login (`/`): username/password form, publishes all 6 accepted demo usernames and the shared password directly on the page.
  - Inventory (`/inventory.html`): product grid (6 items), per-product "Add to cart"/"Remove" buttons, a sort dropdown (`Name A-Z/Z-A`, `Price low/high` — options seen, not all exercised), header cart icon + badge, hamburger menu (All Items, Dynamic Catalog, About, Logout, Reset App State).
  - Cart (`/cart.html`): line items with qty/description/price, "Remove", "Continue Shopping", "Checkout".
  - Checkout step one (`/checkout-step-one.html`): first name, last name, postal code, "Cancel", "Continue".
  - Checkout step two (`/checkout-step-two.html`): order summary (items, payment info, shipping info, subtotal/tax/total), "Cancel", "Finish".
  - Checkout complete (`/checkout-complete.html`): confirmation message, "Back to Products", "Generate PDF of Order" (not exercised).

### 1.3 State Persistence, Auth Boundaries & Navigation Resilience (`SFDIPOT` Data & Operations)

- **Client Storage Mechanisms**: Not inspected this pass (no `localStorage`/`sessionStorage`/cookie dump taken).
- **Authentication, Session Lifecycle & Role Boundaries**:
  - **Guest vs. Authenticated Access**: The entire app beyond the login form is gated; no guest browsing.
  - **Demo / Test Credentials**: Published directly on the login page, no registration needed: `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`, all sharing password `secret_sauce`. `standard_user` is the clean happy-path account; `locked_out_user` returns a clean, accessible (`role="alert"`) error: "Epic sadface: Sorry, this user has been locked out."; the remaining four are documented by Sauce Labs itself as seeded-defect accounts (not individually verified this pass).
  - **Logout & Session Cleanup**: `logout-sidebar-link` exists in the hamburger menu; not exercised this pass.
- **Test Data Volatility & Seeding Profile**: Catalog is static (6 fixed products, fixed prices). No account state persists between runs in any way that matters for this app's purpose.
- **State Survival & Navigation Probes (`Operations`)**:
  - **Hard Reload (`F5`)**: Not probed this pass.
  - **Browser Back / Forward**: Not probed.
  - **Direct URL Deep-Linking**: See 1.2 — real 404 then client-redirect, not a blank/broken page. The page does eventually render correctly here, so this is a platform fact, not a logged defect.
  - **Multi-Tab / Session Sync**: Not probed.

### 1.4 Hydration, Render Timing & Asynchronous Race Traps (`SFDIPOT` Time)

- **Hydration Behavior**: A raw DOM `.value =` + `dispatchEvent('input')` poke on the checkout form fields did **not** register with the app's controlled inputs (got a false "First Name is required" validation error) — confirms real user-event-driven typing (Playwright's `fill`/`type`) is required, not direct DOM manipulation. This is a tooling note for Phase 4, not a defect.
- **Skeleton Loaders / Spinners**: None observed.
- **Rapid Interaction**: Not probed (no rapid-click/boundary probe run this pass).
- **Overlay & Animation Interceptions**: None observed; no modals or drawers encountered.

### 1.5 Network Calls, Backend APIs & Third-Party Dependencies (`SFDIPOT` Interfaces & Platform)

| User Action                     | Triggered Endpoint                                  | HTTP Method | Auth / Headers | Response Envelope / Status                                                |
| :------------------------------ | :-------------------------------------------------- | :---------- | :------------- | :------------------------------------------------------------------------ |
| Any navigation                  | none (fully client-rendered, no XHR/fetch observed) | n/a         | n/a            | n/a                                                                       |
| Direct deep-link to a sub-route | `https://www.saucedemo.com/<route>.html`            | GET         | n/a            | `404`, then an automatic redirect to `?/<route>.html` which returns `200` |

- **External Domains / Third-Party CDNs Contacted**: Google Fonts (`fonts.gstatic.com`) — console logged "Slow network is detected" fallback-font notices, not errors; no functional impact observed.
- **Offline / Throttled Dependency Risk**: Not probed.

### 1.6 Browser Console Errors & Runtime Telemetry

- **Uncaught JavaScript Exceptions**: None observed.
- **Console Errors / Warnings**: One repeated `[error] Failed to load resource: the server responded with a status of 404` per direct sub-route navigation — this is the GitHub Pages SPA-redirect 404 from 1.2/1.5, not an application bug.
- **404 / Broken Assets**: None beyond the above; all product images and bundled JS/CSS loaded `200`.

### 1.7 Semantic Accessibility, Landmarks & Locator-Relevant Facts

#### 1.7.1 ARIA Landmark Regions

| Landmark Role   | HTML Element | Present on Page? | Observed purpose                                                                                 |
| :-------------- | :----------- | :--------------- | :----------------------------------------------------------------------------------------------- |
| `'main'`        | `<main>`     | Yes (login page) | Wraps the login form                                                                             |
| `'banner'`      | `<header>`   | Not confirmed    | `header-container`/`primary-header` seen as plain `data-test` divs post-login, role not verified |
| `'navigation'`  | `<nav>`      | Not confirmed    | Hamburger menu items are plain links, role not verified                                          |
| `'contentinfo'` | `<footer>`   | Not confirmed    | `footer`/`footer-copy` `data-test` attributes present                                            |

#### 1.7.2 Interactive Control & Heading Facts

- Login, inventory, cart and checkout controls all expose clean accessible names via `placeholder`/visible text (`getByRole('textbox', { name: 'Username' })`, `getByRole('button', { name: 'Login' })`, etc.) — role-first locators work directly, no TestDino-style fallback needed.
- The locked-out login error is a proper `<h3 data-test="error" role="alert">` — accessible by default.

#### 1.7.3 Keyboard-Only Operability Probe

- Tab/type/Enter works for the login form.
- **On checkout step one, pressing `Enter` in any field submits "Cancel" instead of "Continue"** — see `DEF-001`. Both `Cancel` (`<button type="submit">`) and `Continue` (`<input type="submit">`) live inside the same `<form>`, with `Cancel` first in DOM order, so the browser's implicit-submit behavior picks it on `Enter`.

#### 1.7.4 Test Ids

- **Test ids present**: Yes, extensively, via `data-test` (not `data-testid`) on nearly every interactive element and most structural containers, including per-product ids like `add-to-cart-sauce-labs-backpack`. This is the cleanest test-id coverage seen across either target in this project.
- **Duplicates**: None observed.

### 1.8 Shadow DOM, Iframes & Viewport Platform Adaptation

- **Shadow DOM / Iframes**: None observed.
- **Responsive Viewport Breakpoint Behavior**:
  - **Desktop (1024x768)**: Full layout, as explored throughout this pass.
  - **Mobile (375x812)**: Login page reflows cleanly to a single column; not probed past login.
  - **Tablet**: Not probed.

### 1.9 Interactive Elements, Component States & Domain Variables

- **Add to cart / Remove**: Per-product button swaps label and `data-test` id in place (`add-to-cart-<slug>` ↔ `remove-<slug>`); cart badge updates to reflect count.
- **Key Domain Variables**: 6 fixed products; 6 named demo accounts with distinct seeded behaviors (clean, locked-out, and four undocumented-this-pass "broken" accounts) — a ready-made set of negative/edge scenario candidates for Phase 2.

### 1.10 Exploratory Tours & `FEW HICCUPPS` Consistency Oracles

#### 1.10.1 Structured Exploratory Tours Executed

1. **Business District Tour**: Full happy path — login (`standard_user`) → add product to cart → cart → checkout step one → step two → complete. Confirmed end to end.
2. **Skeptical Customer Tour**: Checked the order summary math (`$29.99` item + `$2.40` tax = `$32.39` total) — correct.
3. **Saboteur Tour**: Tested `locked_out_user` (clean rejection), raw-DOM form manipulation (correctly rejected by React's controlled inputs), direct deep-link navigation (404-then-redirect), and keyboard `Enter` submission on checkout (found `DEF-001`).

#### 1.10.2 `FEW HICCUPPS` Consistency Oracle Evaluation

| Oracle                 | Live Observation                                                                                                                                                                |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Familiar problems      | None found — totals/tax math checked out exactly.                                                                                                                               |
| Explainability         | Locked-out login gives a clear, accessible error. Checkout's `Enter`-key behavior is **not** explainable — it silently cancels instead of continuing (`DEF-001`).               |
| World                  | No domain-rule violations observed (no negative prices/quantities).                                                                                                             |
| History                | Cart state and totals stayed consistent through the full checkout flow.                                                                                                         |
| Image                  | No broken images, clipped text or placeholder content observed with `standard_user`.                                                                                            |
| Comparable products    | `Enter` submitting the wrong control breaks the universal "Enter submits the primary action" convention — `DEF-001`.                                                            |
| Claims                 | Login page's "Accepted usernames" claim matched actual behavior for the two accounts tested.                                                                                    |
| User expectations      | Direct deep-links still end up rendering correctly despite the 404-redirect detour, so the end-user experience meets expectations even though the network trace looks alarming. |
| Product consistency    | Price shown on the inventory card matched the price shown in cart and in the checkout summary.                                                                                  |
| Purpose                | Sort dropdown's purpose (reordering products) was not exercised this pass.                                                                                                      |
| Statutes and standards | Login error uses `role="alert"` correctly; landmark roles on post-login pages not fully confirmed (1.7.1).                                                                      |

### 1.11 Dynamic, Animated & Visual Sensitivity Widgets

- No carousels, auto-playing widgets, sticky headers, or live counters observed anywhere in this pass.

### 1.12 Baseline Core Web Vitals & Testability Scorecard

- **LCP / CLS**: Not measured this pass (no Lighthouse/Web Vitals run against this target yet).
- **Image Lazy Loading & Alt Audit**: Not checked this pass.
- **Intrinsic Testability Scorecard (1-5)**:
  - _Observability_: 5/5 — extensive, consistent `data-test` coverage; clean console; no hidden state.
  - _Controllability_: 4/5 — "Reset App State" link exists for deterministic resets; deep-linking works despite the 404 detour.
  - _Algorithmic Simplicity & Stability_: 5/5 — fixed catalog, fixed accounts, no randomness observed.
  - _Semantic Accessibility_: 4/5 — role-first locators work cleanly for every control touched; landmark roles on inner pages unconfirmed.
  - _Key Testability Recommendations_: None needed — this is a noticeably easier automation target than TestDino, by design.

---

## Sign-Off and Handoff

- **Reviewed by**: Claude (agent-led exploration, human-directed)
- **Date**: 2026-10-29
- **Status**: Draft
- **Log entries made this phase**: none

### Handoff to Phase 2

Resolved in Section 2.2 (every Phase 1 item given a disposition: `CH-001`, `CH-002`, `SC-006`, or dropped with a reason); block deleted per `docs/templates/README.md`.

## Section 2: Scenarios — What to Check and Why

- **Template**: `docs/templates/02-SCENARIOS.template.md`
- **Scope**: Login, inventory, cart, and the full checkout flow, as covered in Section 1
- **Mode**: Full
- **Feature context**: none
- **Test cases**: none
- **Defects**: none
- **Date**: 2026-10-29
- **Status**: Draft (awaiting review)

### 2.1 Context Frame

| Quality criterion                   | Importance | Why                                                                                         |
| :---------------------------------- | :--------- | :------------------------------------------------------------------------------------------ |
| Functionality                       | High       | Login → cart → checkout is the entire app; nothing else exists (1.1, 1.2)                   |
| Reliability and error handling      | High       | `locked_out_user` must fail cleanly; checkout must not silently lose data (`DEF-001`)       |
| Usability                           | Medium     | `Enter`-key checkout defect directly harms usability (`DEF-001`, 1.7.3)                     |
| Accessibility                       | Medium     | Role-first locators work cleanly (1.7.2); landmark roles on inner pages unconfirmed (1.7.1) |
| Security                            | Out        | Public demo app, shared published credentials, no real data                                 |
| Performance                         | Out        | Not measured this pass (1.12); revisit if this target is kept long-term                     |
| Compatibility (browsers, viewports) | Medium     | Mobile login reflow confirmed clean (1.8); inner pages not checked on mobile                |
| Localization                        | Out        | English only                                                                                |
| Testability and maintainability     | High       | Scorecard 4-5/5 across the board (1.12); the easiest target in this repo to automate        |

- **Constraints**: shared public demo app — no destructive/mutating actions beyond what the app itself resets via "Reset App State"; `problem_user`/`visual_user`/`performance_glitch_user`/`error_user` are deliberately out of scope this pass (2.2); no API exists for this target, so API/visual/audit suites are not in scope this pass either.
- **Out of scope**: the four seeded-defect accounts beyond `standard_user`/`locked_out_user`; visual regression; accessibility/SEO/web-vitals audit; sort-dropdown options beyond a single happy-path check.

### 2.2 Phase 1 Intake

| Phase 1 source        | Item                                                                   | Disposition                                                                                                      |
| :-------------------- | :--------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| 1.1 Coverage Map      | `problem_user`, `visual_user`, `performance_glitch_user`, `error_user` | `CH-001` (explore first; these are intentionally seeded with unknown-shape bugs)                                 |
| 1.2, `DEF-001`        | Checkout `Enter`-key submits Cancel                                    | `SC-006`                                                                                                         |
| 1.2, 1.5              | 404-then-redirect on direct deep-links                                 | Dropped: not a defect (end-user outcome is correct); recorded as a Phase 4 locator/navigation constraint instead |
| 1.3 Demo credentials  | `standard_user` happy path, `locked_out_user` negative case            | `SC-001`, `SC-002`                                                                                               |
| 1.7.1                 | Landmark roles unconfirmed on inner pages                              | `CH-002`                                                                                                         |
| 1.9                   | Add/remove cart button swap, badge count                               | `SC-003`, `SC-004`                                                                                               |
| 1.10.1                | Full checkout happy path confirmed end-to-end                          | `SC-005`                                                                                                         |
| 1.10.2 Purpose oracle | Sort dropdown not exercised                                            | `SC-007`                                                                                                         |

> Every Phase 1 row above has a disposition; the `HANDOFF 1→2` block in Section 1 is deleted per `docs/templates/README.md`.

### 2.3 Risk Register

| Risk ID | Failure mode (what goes wrong, for whom)                                         | Likelihood | Impact | Priority | Covered by         |
| :------ | :------------------------------------------------------------------------------- | :--------- | :----- | :------- | :----------------- |
| `R-001` | A user cannot log in, or a locked-out user gets no clear explanation             | M          | H      | `P0`     | `SC-001`, `SC-002` |
| `R-002` | Adding or removing a product shows the wrong cart count                          | M          | H      | `P0`     | `SC-003`, `SC-004` |
| `R-003` | Checkout cannot be completed at all                                              | L          | H      | `P0`     | `SC-005`           |
| `R-004` | A keyboard user's checkout is silently cancelled instead of advanced (`DEF-001`) | H          | M      | `P1`     | `SC-006`           |
| `R-005` | Sort control does not actually reorder the product list                          | L          | M      | `P2`     | `SC-007`           |

### 2.4 Test Techniques and Data Variation

| Entity / behavior        | Technique                        | Derived cases                                                           | Scenario           |
| :----------------------- | :------------------------------- | :---------------------------------------------------------------------- | :----------------- |
| Login credentials        | Equivalence classes              | valid (`standard_user`), rejected-but-valid-looking (`locked_out_user`) | `SC-001`, `SC-002` |
| Cart contents            | State transition                 | 0 → 1 item, 1 → 0 item                                                  | `SC-003`, `SC-004` |
| Checkout submission      | Flow / story                     | full journey login → cart → checkout → confirmation                     | `SC-005`           |
| Checkout form submission | Comparable products (convention) | mouse-click Continue vs. keyboard Enter                                 | `SC-006`           |
| Product list ordering    | Claims                           | sort control's stated order vs. actual rendered order                   | `SC-007`           |

### 2.5 Scenario Catalog

#### 2.5.1 Functional (UI and end-to-end)

| ID       | Intent                                                                                      | Risk    | Technique           | Oracle              | Priority | Preconditions and data                                  | Decision                | External refs |
| :------- | :------------------------------------------------------------------------------------------ | :------ | :------------------ | :------------------ | :------- | :------------------------------------------------------ | :---------------------- | :------------ |
| `SC-001` | Logging in with valid credentials reaches the inventory page                                | `R-001` | Equivalence classes | User expectations   | `P0`     | Guest, `standard_user`/`secret_sauce`                   | Automate                | none          |
| `SC-002` | Logging in as a locked-out user shows a clear, accessible error and stays on the login page | `R-001` | Equivalence classes | Explainability      | `P1`     | Guest, `locked_out_user`/`secret_sauce`                 | Automate                | none          |
| `SC-003` | Adding a product to the cart updates the header badge and the cart page                     | `R-002` | State transition    | History             | `P0`     | Logged in as `standard_user`, empty cart                | Automate                | none          |
| `SC-004` | Removing the only item from the cart clears the badge and shows an empty cart               | `R-002` | State transition    | History             | `P1`     | Logged in, one item in cart                             | Automate                | none          |
| `SC-005` | A full checkout (info → overview → finish) completes and shows the confirmation page        | `R-003` | Flow / story        | Claims              | `P0`     | Logged in, one item in cart                             | Automate                | none          |
| `SC-006` | Pressing Enter on checkout step one does not silently cancel the order (`DEF-001`)          | `R-004` | Comparable products | Comparable products | `P1`     | Logged in, on checkout step one with valid field values | Automate (known-defect) | `DEF-001`     |
| `SC-007` | Sorting by "Price (low to high)" actually reorders the product list ascending by price      | `R-005` | Claims              | Purpose             | `P2`     | Logged in, on the inventory page                        | Automate                | none          |

#### 2.5.2 API contract

Out of scope — this target has no API surface to contract-test (1.5).

#### 2.5.3 Visual

Out of scope this pass (2.1 Out of scope).

#### 2.5.4 Audit and non-functional

Out of scope this pass (2.1 Out of scope).

### 2.6 Exploratory Charters

| ID       | Explore (area)                                                                  | With (resources, techniques, data)                        | To discover (information wanted)                                    | Timebox | Risk                            | What to record                                                                       |
| :------- | :------------------------------------------------------------------------------ | :-------------------------------------------------------- | :------------------------------------------------------------------ | :------ | :------------------------------ | :----------------------------------------------------------------------------------- |
| `CH-001` | `problem_user`, `visual_user`, `performance_glitch_user`, `error_user` accounts | Login as each, repeat the Business District tour (1.10.1) | What each account's seeded defect actually is                       | 30 min  | `R-001`-adjacent, not yet rated | New `DEF-ID`s per defect found, or confirmation of no defect                         |
| `CH-002` | Landmark roles on inventory/cart/checkout pages                                 | Accessibility tree inspection                             | Whether `header`/`nav`/`footer`/`main` roles are present post-login | 15 min  | `R-001`-adjacent, not yet rated | Updated 1.7.1 facts; new `AUD` scenarios if this target's audit scope is ever opened |

### 2.7 Automation Decision

| Scenario | Risk | Frequency | Stability | Determinism | Cost | Decision | Note                                                     |
| :------- | :--- | :-------- | :-------- | :---------- | :--- | :------- | :------------------------------------------------------- |
| `SC-001` | 3    | 3         | 3         | 3           | 1    | Automate | Core happy path                                          |
| `SC-002` | 2    | 2         | 3         | 3           | 1    | Automate | Cheap, high-value negative case                          |
| `SC-003` | 3    | 3         | 3         | 3           | 1    | Automate | Core happy path                                          |
| `SC-004` | 2    | 2         | 3         | 3           | 1    | Automate |                                                          |
| `SC-005` | 3    | 2         | 3         | 3           | 2    | Automate | Full flow, slightly higher build cost                    |
| `SC-006` | 2    | 1         | 3         | 3           | 1    | Automate | Known-defect test per `CORE_PRINCIPLES.md` section 7     |
| `SC-007` | 1    | 1         | 3         | 3           | 1    | Automate | Cheap, low risk, still worth a smoke of the sort control |

### 2.8 Known Defects and Coverage Gaps

**Known defects**:

| `DEF-ID`  | Scenario | Policy                     |
| :-------- | :------- | :------------------------- |
| `DEF-001` | `SC-006` | Expect failure until fixed |

**Not covered**:

| Item                                                                   | Reason                                                                     | Revisit when                                                                                |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `problem_user`, `visual_user`, `performance_glitch_user`, `error_user` | Seeded-defect accounts not yet explored (`CH-001`)                         | After `CH-001` runs                                                                         |
| API, visual, audit suites                                              | No API exists; visual/audit intentionally out of scope for this pass (2.1) | If this target is kept as a long-term second suite rather than a one-time portability proof |
| Sort options beyond "Price (low to high)"                              | Low risk, redundant with `SC-007`'s technique                              | If a sort-specific defect is ever reported                                                  |

---

## Section 3: Automation Design

- **Template**: `docs/templates/03-AUTOMATION-DESIGN.template.md`
- **Date**: 2026-10-29
- **Status**: Draft (awaiting review)

### 3.1 Reuse Decisions

Everything reused as-is from the existing framework, nothing TestDino-specific carried over:

- `fixtures/ui.fixture.ts` pattern (dependency-injected page objects) — same shape, new page objects.
- `helpers/route.helper.ts`'s `openRoute` (navigate, then wait for a ready marker) — directly applicable; doubly important here since direct sub-route navigation hits a real 404-then-redirect (1.2), so a ready-marker wait is required, not optional.
- `config/playwright.ui.config.ts`'s existing `chromium`/`firefox`/`webkit` projects — reused unchanged; this target needs no new config, only `env-config/saucedemo.env` (already created) and `npm run env:config -- saucedemo` to point at it.
- The `storageState` auth pattern (`AUTH_EMAIL`/`AUTH_PASSWORD` → `setup` project → `chromium-authenticated` project) — this is the first target where it can be fully exercised with real, working credentials (`standard_user`/`secret_sauce`), since Sauce Labs publishes them for exactly this purpose.

### 3.2 Scenario-to-Test Mapping

| Scenario | Spec file                                           | Test title                                                             |
| :------- | :-------------------------------------------------- | :--------------------------------------------------------------------- |
| `SC-001` | `tests/ui/saucedemo/login.spec.ts`                  | `SC-001 valid credentials reach the inventory page`                    |
| `SC-002` | `tests/ui/saucedemo/login.spec.ts`                  | `SC-002 a locked-out user sees a clear, accessible error`              |
| `SC-003` | `tests/ui/saucedemo/cart.spec.ts`                   | `SC-003 adding a product updates the badge and the cart page`          |
| `SC-004` | `tests/ui/saucedemo/cart.spec.ts`                   | `SC-004 removing the only item clears the badge and empties the cart`  |
| `SC-005` | `tests/ui/saucedemo/checkout.authenticated.spec.ts` | `SC-005 a full checkout completes and reaches the confirmation page`   |
| `SC-006` | `tests/ui/saucedemo/checkout.authenticated.spec.ts` | `SC-006 pressing Enter on checkout step one does not cancel the order` |
| `SC-007` | `tests/ui/saucedemo/inventory.spec.ts`              | `SC-007 sorting by price (low to high) reorders the product list`      |

`SC-005`/`SC-006` live in an `*.authenticated.spec.ts` file and run only in the `chromium-authenticated` project (real `storageState`, logged in once via `tests/ui/auth.setup.ts`), since they need a logged-in session beyond what a single test's own login step would cover cleanly for a multi-step flow. `SC-001`-`SC-004` and `SC-007` log in within the test itself (cheap, and `SC-001`/`SC-002` specifically need to test the login step), so they stay in the regular anonymous projects.

### 3.3 Pages, Components, Fixtures

New page objects (`page-objects/pages/`), one per app screen, same convention as the existing TestDino ones (locators + actions, no assertions):

- `saucedemo-login.page.ts` — username/password/login button, error alert locator.
- `saucedemo-inventory.page.ts` — product list, per-product add/remove buttons (parameterized by product slug), sort dropdown, cart badge/link.
- `saucedemo-cart.page.ts` — cart items, remove button, checkout button.
- `saucedemo-checkout.page.ts` — all three checkout steps' fields and buttons (one page object covering the linear flow, since the three steps share one continuous form-driven journey with no branching).

No new components or fixtures beyond adding these page objects to `fixtures/ui.fixture.ts`, following the existing pattern exactly.

### 3.4 Data and State Setup

- Credentials come from the published demo values, read as named constants in a new `test-data/saucedemo-accounts.data.ts` (`as const`, no raw literals scattered across specs), not the repo's `AUTH_EMAIL`/`AUTH_PASSWORD` env vars — those stay reserved for a real application's private test credentials per the README's `storageState` section; Sauce Labs' credentials are public by design and safe to commit.
- No seeding or teardown needed — the app has no persistent backend state (1.3); each test starts from a fresh browser context per the project's existing independence guardrail.

---

## Section 4: Test Spec

- **Template**: `docs/templates/04-TEST-SPEC.template.md`
- **Date**: 2026-10-29
- **Status**: Draft (awaiting review)

The code is the specification (`CORE_PRINCIPLES.md`). Locator choices and exceptions not already obvious from the code:

- All locators are role-first (`getByRole`) or `data-test`-based via `getByTestId`, per 1.7.4 — this target needed zero fallback-to-`data-test` exceptions the way TestDino's header did, since every interactive element exposes a clean accessible name or a consistent `data-test` id.
- `SC-006`'s known-defect test follows the `CORE_PRINCIPLES.md` section 7 "Known defects" rule: `test.fail()` plus a `defect` annotation citing `DEF-001`.
- Sub-route navigation after login always goes through in-app clicks (e.g. clicking "Checkout" rather than `page.goto('/checkout-step-one.html')`), per the 1.2 finding that direct navigation hits a real 404 before the client-side redirect resolves.

---

## Section 5: Evidence

- **Template**: `docs/templates/05-EVIDENCE.template.md`
- **Date**: 2026-10-29
- **Status**: Draft (awaiting review)

### 5.1 Run Record

Two runs, both via `npx playwright test --config=config/playwright.ui.config.ts tests/ui/saucedemo`, `UI_BASE_URL` set to `https://www.saucedemo.com` (`npm run env:config -- saucedemo`). No code was edited between the second run's result and this write-up, per `D-016`.

**Run 1** (initial): 14 of 18 failed. Root cause: every page object used `page.getByTestId(...)`, which targets Playwright's default `data-testid` attribute — this site uses `data-test` (confirmed live), so every id-based locator silently matched nothing. This was caught and fixed before any defect was (mis)attributed to the site; see 5.2.

**Run 2** (after the locator fix, below): **18 of 18 passed** (`SC-006` passes as an expected failure via `test.fail()`, per its known-defect handling). Includes a real, successful login with the published `standard_user` credentials and a verified `storageState` save (`saucedemo-setup` project) — the first time this repo's `storageState` auth pattern has been proven end-to-end with working credentials, rather than only verified mechanically against a form with no valid account (as with TestDino).

```text
18 passed (32.2s)
  [saucedemo-setup] authenticate as standard_user and save storage state ✓
  [saucedemo-chromium-authenticated] SC-005 a full checkout completes and reaches the confirmation page ✓
  [saucedemo-chromium-authenticated] SC-006 pressing Enter on checkout step one does not cancel the order ✘ (expected - DEF-001)
```

### 5.2 Triage

| Scenario / test                                                 | Result                                             | Triage classification | Notes                                                                                                                                                                      |
| :-------------------------------------------------------------- | :------------------------------------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SC-001`, `SC-003`, `SC-004`, `SC-007`, `auth.setup.ts` (Run 1) | Failed                                             | Test issue            | `getByTestId()` targets `data-testid`, not this site's `data-test`; fixed by switching to explicit `page.locator('[data-test="..."]')` in all four Sauce Demo page objects |
| `SC-002` (Run 1)                                                | Passed                                             | n/a                   | Uses `getByRole('alert')`, unaffected by the attribute mismatch — this is why it was the one test that passed in Run 1, which is what first narrowed the diagnosis         |
| All 7 scenarios (Run 2)                                         | Passed (`SC-006` as expected known-defect failure) | n/a                   | Clean run, no further triage needed                                                                                                                                        |

### 5.3 Defects Raised This Phase

None new. `DEF-001` (found in Phase 1, scenario-ized in Phase 2) is confirmed reproducible by `SC-006`'s automated test, still `Open` pending a product-side fix — automation now catches it on every run instead of relying on manual rediscovery.

---

## Section 6: Review

- **Template**: `docs/templates/06-PR-REVIEW.template.md`
- **Date**: 2026-10-29
- **Status**: Draft

### 6.1 Findings

- **Suggestion**: `SC-006` trades away detection of any other checkout-step-one regression while `DEF-001` stays open (the same accepted tradeoff already documented for TestDino's `DEF-007`/`DEF-008`). Acceptable for now; revisit if this target gains more checkout-step-one scenarios.
- **Suggestion**: This pass intentionally scoped out `problem_user`, `visual_user`, `performance_glitch_user`, `error_user` (`CH-001`), and landmark-role confirmation on inner pages (`CH-002`). Both are cheap follow-ups, not blockers.
- No blockers, no changes-requested findings. The locator root-cause (5.2) was caught and fixed within this same pass, before being mistaken for a site defect — exactly the kind of mistake this workbook process exists to catch before it reaches a human reviewer.

### 6.2 Verdict

**Recommended verdict: Approved**, pending the human sign-off each phase still requires (this workbook was written across Phases 1-5 in one continuous AI-led pass per `D-017`/`AGENTS.md` - the decision layer stays with a human).

This target also directly answers the open "does this framework work for a second, genuinely different app" question from the project's own README roadmap: yes, with one real bug found and fixed in the process (the `data-test` vs `data-testid` locator mismatch) and one real product defect found, isolated, and brought under automated coverage (`DEF-001`).
