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

| Defect ID | Title                                                                          | Severity | Level | Oracle                                                 | Found by | Status | Ticket key |
| :-------- | :----------------------------------------------------------------------------- | :------- | :---- | :----------------------------------------------------- | :------- | :----- | :--------- |
| `DEF-001` | Direct load / F5 on `/product/:slug` renders blank page (relative asset paths) | High     | UI    | Explainability, User expectations, Comparable products | Phase 1  | Open   | none       |
| `DEF-002` | Failed login (HTTP 401) shows no visible error message                         | Medium   | UI    | Explainability, User expectations                      | Phase 1  | Open   | none       |
| `DEF-003` | Header nav and icons are non-semantic and not keyboard reachable; no landmarks | Medium   | Audit | Statutes and standards (WCAG 2.1.1, 4.1.2, 1.3.1)      | Phase 1  | Open   | none       |
| `DEF-004` | Cart quantity silently stops at 9 while `+` stays enabled                      | Low      | UI    | Explainability, Purpose                                | Phase 1  | Open   | none       |
| `DEF-005` | Stale or generic `document.title` on `/login`, `/signup`, `/cart`, deep links  | Low      | Audit | Statutes and standards, Image                          | Phase 1  | Open   | none       |
| `DEF-006` | Footer heading typo "COSTUMER POLICY"                                          | Low      | UI    | Image                                                  | Phase 1  | Open   | none       |

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
