# TestDino Demo Store: Defect Ledger

- **Target Application**: TestDino Demo Store
- **Target URL**: `https://storedemo.testdino.com`
- **Environment**: `env-config/testdino.env` (`UI_BASE_URL=https://storedemo.testdino.com`)
- **Created**: October 26, 2026
- **Status**: Active Ledger
- **Defect tool**: none

Record format, severity, levels, oracle names and statuses are defined in `docs/templates/DEFECT_LEDGER.template.md` and `docs/templates/README.md`.

---

## 1. Rules

Logging rules are in section 1 of `docs/templates/DEFECT_LEDGER.template.md`.

---

## 2. Summary Table

| Defect ID | Title                                                                          | Severity | Level | Oracle                                                 | Found by                            | Status  | Ticket key |
| :-------- | :----------------------------------------------------------------------------- | :------- | :---- | :----------------------------------------------------- | :---------------------------------- | :------ | :--------- |
| `DEF-001` | Direct load / F5 on `/product/:slug` renders blank page (relative asset paths) | High     | UI    | Explainability, User expectations, Comparable products | Phase 1                             | Open    | none       |
| `DEF-002` | Failed login (HTTP 401) shows no visible error message                         | Medium   | UI    | Explainability, User expectations                      | Phase 1                             | Open    | none       |
| `DEF-003` | Header nav and icons are non-semantic and not keyboard reachable; no landmarks | Medium   | Audit | Statutes and standards (WCAG 2.1.1, 4.1.2, 1.3.1)      | Phase 1                             | Open    | none       |
| `DEF-004` | Cart quantity silently stops at 9 while `+` stays enabled                      | Low      | UI    | Explainability, Purpose                                | Phase 1                             | Open    | none       |
| `DEF-005` | Stale or generic `document.title` on `/login`, `/signup`, `/cart`, deep links  | Low      | Audit | Statutes and standards, Image                          | Phase 1                             | Open    | none       |
| `DEF-006` | Footer heading typo "COSTUMER POLICY"                                          | Low      | UI    | Image                                                  | Phase 1                             | Open    | none       |
| `DEF-007` | New Arrivals carousel clone slides expose focusable wishlist/cart buttons      | Medium   | Audit | Statutes and standards (WCAG 2.1.1, 4.1.2)             | `tests/audit/accessibility.spec.ts` | Triaged | none       |
| `DEF-008` | No below-the-fold images implement lazy loading (0 of 88 compliant)            | Low      | Audit | Purpose, Statutes and standards (Core Web Vitals)      | `tests/audit/seo.spec.ts`           | Triaged | none       |

---

## 3. Detailed RIMGEA Defect Records

_(Phase 1 findings below, discovered 2026-10-28 via Playwright MCP. Forensic artifacts: console log excerpts quoted inline; traces and screenshots will be stored under `docs/targets/evidence/` in Phase 5 when specs reproduce them. Compact RIMGEA format; expand per `docs/templates/DEFECT_LEDGER.template.md` when promoted to a failing test.)_

### DEF-001 [found incidentally, outside the Home + /products scope] — Direct load / F5 on a product detail URL renders a blank page

- **Replicate**: (1) Open `https://storedemo.testdino.com/product/rode-nt1-a-condenser-mic` directly (or click a product from `/products`, then press F5). (2) Observe only an `<h1>Demo E-commerce Testing Store</h1>` and nothing else; page title is generic.
- **Isolate**: `index.html` references assets relatively (`./static/js/main.*.js`, `manifest.json`). On a two-segment path they resolve to `/product/static/...`, which the SPA fallback answers with HTML. Console: `Unexpected token '<'` and `Manifest: Line: 1, column: 1, Syntax error. @ /product/manifest.json`. Single-segment routes (`/login`, `/cart`) are unaffected. In-app navigation to the same URL works.
- **Maximize**: Every product URL is unshareable and un-bookmarkable; any reload on a PDP loses the page.
- **Generalize**: Affects all `/product/:slug` URLs, including invalid slugs (`/product/does-not-exist` shows the same fragment instead of a not-found page).
- **Externalize**: Oracle Comparable Products (deep links must work), User's Expectations. Stakeholder impact: shoppers, SEO, marketing links. Test impact: specs must reach a PDP by clicking, never `page.goto('/product/...')`.
- **And state**: Severity High. Expected: PDP renders on direct load. Actual: blank page.

### DEF-002 [found incidentally, outside the Home + /products scope] — Invalid login gives no visible feedback

- **Replicate**: On `/login` submit a syntactically valid email and a wrong password. `POST https://storedemo-api.testdino.com/api/login` returns 401; button shows "Signing in..." then reverts.
- **Isolate**: No `role=alert`, toast, or inline text observed during 2 s polling plus 3 s after. Client-side required-field messages do exist ("Email is required", "Password is required"). Re-verify with a trace in Phase 5 in case a short-lived toast was missed.
- **Maximize/Generalize**: Users cannot tell a failed login from a hang. Not checked on signup.
- **Externalize**: Oracle Explainability. Severity Medium. Expected: actionable error message.

### DEF-003 — Header navigation and icons are not semantic or keyboard operable

- **Replicate**: Load `/`, press Tab 8 times; focus remains on `BODY`. Inspect header.
- **Isolate**: No `<header>`, `<nav>`, `<main>`, `<footer>` anywhere. Nav items are `<li>` with click handlers (a11y role `listitem`, not `link`). Cart, wishlist, user and menu icons are `<svg>`/`<div>` with no role, name, or tabindex. Product-card wishlist/cart buttons are icon-only with no accessible name (inner `role=img` names are "heart" and "shopping"). Password field not inside a `<form>` (Chrome DOM advisory).
- **Maximize/Generalize**: Keyboard and screen-reader users cannot reach nav, cart, or login. Same on footer links.
- **Externalize**: Oracle Statutes & Standards (WCAG 2.1.1 Keyboard, 4.1.2 Name/Role/Value, 1.3.1). Severity Medium. Test impact: role-first locators fail for header; fall back to `getByTestId` (project standard is role-first, so record this as a justified exception).

### DEF-004 [found incidentally, outside the Home + /products scope] — Quantity silently capped at 9

- **Replicate**: Add any product, open `/cart`, click `+` 33 times. Quantity stops at 9 and `+` is never disabled; no message.
- **Externalize**: Oracle Explainability / Purpose. Severity Low. Expected: disabled `+` or message at the limit. Also observation (not logged as defect): header cart badge counts distinct lines, not units (badge `1` with quantity 9); confirm intended behavior with stakeholder.

### DEF-005 — Generic or stale document titles

- **Replicate**: Visit `/login`, `/signup`, `/cart`, `/nonexistent`: title is "TestDino Demo Store - Premium Electronics & Gadgets Online" (the static fallback). `/`, `/products`, PDPs, `/about-us`, `/contact-us`, `/wishlist` set specific titles.
- **Externalize**: Oracle Product Consistency / Image; SEO audit. Severity Low.

### DEF-006 — Footer heading typo

- **Replicate**: Footer heading `COSTUMER POLICY` (should be "CUSTOMER POLICY"). Present on all pages. Oracle Image. Severity Low.

### DEF-007: New Arrivals carousel clone slides expose focusable wishlist/cart buttons

- **Severity**: Medium
- **Level**: Audit
- **Oracle**: Statutes and standards (WCAG 2.1.1 Keyboard, 4.1.2 Name/Role/Value)
- **Status**: Triaged
- **Found by**: `tests/audit/accessibility.spec.ts` (CI run of the initial commit, 2026-10-29)
- **Route or endpoint**: `/` (Home), `new-arrivals-section`
- **Element or field**: `.slick-cloned[aria-hidden="true"]` slide clones inside the carousel

#### Stakeholder and user impact (Externalize)

Keyboard and screen-reader users tabbing through the New Arrivals carousel land on duplicate, visually hidden product cards instead of the visible ones. Focus appears to vanish or land on an invisible control, breaking the tab sequence for every keyboard-only shopper.

#### Minimal steps to reproduce (Replicate and Isolate)

1. Go to `https://storedemo.testdino.com/`
2. In the browser console, run: `document.querySelectorAll('.slick-cloned[aria-hidden="true"] button').length` on the New Arrivals section
3. Observe non-zero, tabbable (`tabindex` not `-1`) wishlist/cart buttons inside slides marked `aria-hidden="true"`

#### Generalization (Maximize and Generalize)

The slick-slider library clones slides for its infinite-loop effect and marks the clones `aria-hidden="true"`, but does not also set `tabindex="-1"` on their interactive children. Confirmed live: 34 of 45 cloned slides contain focusable `wishlist-button`/`cart-button` elements. Any carousel on the site built the same way is likely affected.

#### Expected result

Content inside an `aria-hidden="true"` container must not be keyboard-focusable (axe rule `focusable-not-tabbable`, impact `serious`).

#### Actual result

Cloned slide buttons remain in the tab order despite being hidden from assistive technology.

#### Diagnostics

```text
axe-core violation: focusable-not-tabbable (impact: serious)
"Focusable content should have tabindex=\"-1\" or be removed from the DOM"
target: section[data-testid="new-arrivals-section"] > ... > .slick-cloned.slick-slide[data-index="27"] > ... > [data-testid="wishlist-button"]
```

#### Artifacts

- CI run: `.github/workflows/playwright.yml` run `40805623443` (`playwright-report/audit`, `test-results/`)
- Live verification: in-browser console check against `https://storedemo.testdino.com/`, 2026-10-29

#### Test handling

`tests/audit/accessibility.spec.ts` keeps this check active but marks the test `test.fail()` with a `defect` annotation referencing `DEF-007`, so CI reports an _expected_ failure instead of blocking every build. This does trade away detection of any other new critical/serious violation on the same page while DEF-007 stays open — accepted deliberately for now; remove the `test.fail()` once DEF-007 is `Remediated` and re-verify with a clean run before moving it to `Verified`.

### DEF-008: No below-the-fold images implement lazy loading

- **Severity**: Low
- **Level**: Audit
- **Oracle**: Purpose (images outside the initial viewport serve no immediate purpose and should defer), Statutes and standards (Core Web Vitals / LCP guidance)
- **Status**: Triaged
- **Found by**: `tests/audit/seo.spec.ts` (CI run of the initial commit, 2026-10-29; reproduced live 2026-10-29)
- **Route or endpoint**: `/` (Home)
- **Element or field**: all `<img>` elements positioned below the initial viewport fold

#### Stakeholder and user impact (Externalize)

Every below-the-fold image on the home page downloads immediately on page load instead of deferring until scrolled into view, inflating initial payload size and working against Core Web Vitals metrics (LCP, bandwidth) for every visitor, especially on slow connections or mobile data.

#### Minimal steps to reproduce (Replicate and Isolate)

1. Go to `https://storedemo.testdino.com/`
2. In the browser console, run a check for images below `window.innerHeight` and inspect their `loading`, `data-src`, and class attributes
3. Observe zero images below the fold carry `loading="lazy"`, a `data-src`, or any `lazy`/`lazy-load`/`lazyload` class

#### Generalization (Maximize and Generalize)

Confirmed live: 88 of 91 images on the home page sit below the fold, and 0 of the 88 implement any lazy-loading signal checked by the test (native `loading="lazy"`, `data-src`, or a lazy CSS class). This is a site-wide image-loading pattern, not an isolated image.

#### Expected result

Below-the-fold images should defer loading (native `loading="lazy"` is the simplest fix) so initial page load only fetches what's visible.

#### Actual result

All images, including those far below the fold (e.g. footer-area product images), load eagerly with the initial page render.

#### Diagnostics

```text
belowFoldCount: 88, compliantCount: 0, lazyComplianceRatio: 0% (threshold: >= 70%)
sample: { src: ".../Appliances....webp", loading: null }, { src: ".../Gadgets....webp", loading: null }
```

#### Artifacts

- Live verification: in-browser console check against `https://storedemo.testdino.com/`, 2026-10-29

#### Test handling

`tests/audit/seo.spec.ts` keeps this check active but marks the test `test.fail()` with a `defect` annotation referencing `DEF-008`, so CI reports an _expected_ failure instead of blocking every build. Remove the `test.fail()` once DEF-008 is `Remediated` and re-verify with a clean run before moving it to `Verified`.
