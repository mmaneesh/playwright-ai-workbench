# Target Quality Engineering Workbook: TestDino Demo Store

- **Target Application**: TestDino Demo Store
- **Target URL**: `https://storedemo.testdino.com`
- **Scope**: Partial: Home (`/`), All Products (`/products`) and the cart drawer
- **Feature context**: none
- **Test cases**: none
- **Defects**: none (the ledger holds the full records)
- **Suite Types**: `UI Functional` | `Visual Regression` | `Universal Audit`
- **Environment Config**: `env-config/testdino.env` (`UI_BASE_URL=https://storedemo.testdino.com`)
- **Associated Defect Ledger**: [`docs/targets/testdino-defects.md`](testdino-defects.md)
- **Date**: October 26, 2026
- **Status**: `Phase 2 Draft (Scenarios written 2026-10-28; awaiting review)`

---

## Section 1: 12-Point Context-Driven & Technical Reconnaissance

_(SCOPE: Home (`/`) and All Products (`/products`) only, per user scope change. Rows tagged `out of scope` were observed incidentally before the change and are NOT verified or complete. Explored 2026-10-28 with Playwright MCP, Desktop 1280x720 plus a 390x844 spot check. Defects logged in `testdino-defects.md` as DEF-001..006.)_

### Coverage Map

| Area                                                                  | Last explored | Scope                          | Build or version | Notes                                                                            |
| :-------------------------------------------------------------------- | :------------ | :----------------------------- | :--------------- | :------------------------------------------------------------------------------- |
| Home (`/`)                                                            | 2026-10-28    | Partial: Home and All Products | not recorded     | Desktop 1280x720 plus a 390x844 spot check                                       |
| All Products (`/products`)                                            | 2026-10-28    | Partial: Home and All Products | not recorded     | Same session                                                                     |
| Cart drawer                                                           | 2026-10-28    | Partial: Home and All Products | not recorded     | Reached from the header cart icon                                                |
| Product detail, cart page, login, signup, checkout, wishlist, contact | 2026-10-28    | Incidental only                | not recorded     | Observed before the scope change; not verified. Rows tagged `out of scope` below |

### 1.1 Mission, Value Proposition & Stakeholder Risk Profile

- **Core Value Proposition**: Demo electronics store (cameras, audio, appliances, gadgets, PCs) built as a practice target for QA and automation. No real transactions.
- **Key User Personas & Stakeholders**: Guest shopper (browse, search, cart), registered user (sign up / sign in, checkout gate), QA engineer using the site as a sandbox.
- **Top Threats to Product Value**: Cart math or persistence errors, login failing silently (DEF-002), unshareable product URLs (DEF-001), non-keyboard-operable header (DEF-003).

### 1.2 Frontend Architecture, Routing & `SFDIPOT` Structure

- **Framework / Library**: React SPA (CRA build, `static/js/main.*.js`), Tailwind CSS, Ant Design icons (`anticon`), react-slick carousels, a toast library. FAQ claims Redux, Node/Express, MongoDB.
- **DOM Root Mount**: `<div id="root">` (plus `<noscript>`).
- **Routing Strategy**: Client-side HTML5 history. Asset paths are relative, which breaks two-segment URLs on direct load (DEF-001).
- **Route & Feature Inventory (`Structure` & `Function`)**:
  - Homepage (`/`): hero + "Shop Now", 4 category tiles, "Feature Product" and "New Arrivals" carousels, offers banners, "Category Product" carousel, newsletter, FAQ (8 items), footer.
  - Catalog / Product Listing: `/products` ("All Products", 14 items, search, grid/list switcher, Filters panel with Category and Price Range, Reset Filters).
  - Product Detail Page: `/product/:slug` (e.g. `/product/rode-nt1-a-condenser-mic`); quantity, ADD TO CART, BUY NOW, tabs Description / Additional information / Reviews, "You may also like". Reachable only via in-app navigation (DEF-001).
  - Cart View: `/cart` full page, plus off-canvas drawer (`data-testid=cart-drawer`, opened by header cart icon, buttons Checkout / View Cart).
  - Checkout & Authentication: `/login`, `/signup`; `/checkout` redirects guests to `/login`. Other routes: `/about-us`, `/contact-us`, `/wishlist`. `/about`, `/contact`, unknown paths show "Page not found".

### 1.3 Client-Side State Persistence, Auth Boundaries & Navigation Resilience (`SFDIPOT` Data & Operations)

- **Client Storage Mechanisms (`localStorage`, `sessionStorage`, `cookies`, `IndexedDB`)**: Fresh session: all empty. After add to cart: `localStorage.cartItems` = JSON array `[{id:"product1", slug, img, header, price:"$240", reviewCount:"(350)", quantity:1, ...}]`; also `reviews`, `reviews_<slug>` = `[]`. No sessionStorage, no cookies observed. IndexedDB not inspected.
- **Authentication, Session Lifecycle & Role Boundaries**:
  - **Guest vs. Authenticated Access**: Browse, search, cart, wishlist route open to guests. Checkout button (drawer and `/cart`) redirects guests to `/login`.
  - **Demo / Test Credentials**: NOT published anywhere (login page, signup page, FAQ, footer checked). Registration is available at `/signup` (first name, last name, email, password min 6 chars). Phase 4 tests should register a unique user through the UI or API. Nothing was guessed or brute forced; one deliberately bogus login was sent to observe error behavior.
  - **Logout & Session Cleanup**: out of scope. Not explored (no authenticated session created; no account registered on the shared backend).
- **Test Data Volatility & Seeding Profile**: Catalog is static and deterministic (14 unique products, shown repeated in carousels). Cart is client-only in localStorage, isolated per browser context. User accounts live on a shared backend (`storedemo-api.testdino.com`); use unique emails.
- **State Survival & Navigation Probes (`Operations`)**:
  - **Hard Reload (`F5`)**: Cart (qty 9, total $2,160) survives on `/cart`. F5 on a PDP yields a blank page (DEF-001).
  - **Browser Back / Forward Buttons**: out of scope.
  - **Direct URL Deep-Linking & Tampering**: `/product/does-not-exist` shows the same blank fragment as valid slugs; `/checkout` as guest goes to `/login`; unknown path gives "Page not found" page.
  - **Multi-Tab / Session Sync**: out of scope. Not probed (state is plain localStorage, so a reload reflects it).

### 1.4 Hydration, Render Timing & Asynchronous Race Traps (`SFDIPOT` Time)

- **Hydration Behavior**: Client-rendered; content appears after JS bundle load. Wait on a landmark `data-testid` or heading, not `networkidle` alone.
- **Skeleton Loaders & Spinners**: None seen. Login button text changes to "Signing in..." while the request is pending.
- **Search Input Debounce**: `/products` search filters live (no Enter needed, URL unchanged); "mouse" yielded "Showing 1 products" within 800 ms. Exact debounce not measured. Count text is not pluralized ("1 products").
- **Cart & State Synchronization**: Synchronous, local. Toast "Added to the cart" appears on add; "Item removed from cart" on delete.
- **Rapid Interaction / Double-Click Probe**: 33 rapid `+` clicks produced a clean total ($2,160 for 9 x $240); cap at 9 is silent (DEF-004).
- **Overlay & Animation Interceptions**: Cart drawer is always in the DOM and slides in (`transition-transform`); wait for visibility of drawer items before clicking. Card action buttons are hover-revealed (`opacity-0 group-hover:opacity-100`), so `hover()` the card first (or the click may need the hover state).

### 1.5 Network Calls, Backend APIs & Third-Party Dependencies (`SFDIPOT` Interfaces & Platform)

| User Action                      | Triggered Endpoint                             | HTTP Method | Auth / Headers               | Response Envelope / Status                 |
| :------------------------------- | :--------------------------------------------- | :---------- | :--------------------------- | :----------------------------------------- |
| Browse, search, cart, PDP        | none (data bundled client-side)                | n/a         | n/a                          | No XHR/fetch observed                      |
| Login submit                     | `https://storedemo-api.testdino.com/api/login` | POST        | JSON `{email, password}`     | 401 on bad credentials (body not captured) |
| Session check on login page load | `https://storedemo-api.testdino.com/api/me`    | GET         | cookie/token (not inspected) | 401 for guest                              |

- **External Domains / Third-Party CDNs Contacted**: `storedemo-api.testdino.com` (API). Images are same-origin (`/products/*.png`). No third-party analytics seen. Signup/checkout endpoints not exercised.

### 1.6 Browser Console Errors & Runtime Telemetry

- **Uncaught JavaScript Exceptions (`pageerror`)**: `Unexpected token '<'` on direct load of `/product/:slug` (DEF-001).
- **Console Errors & Warnings (`console.error` / `console.warn`)**: `Manifest: Syntax error @ /product/manifest.json` (DEF-001). Chrome DOM advisory: "Password field is not contained in a form" on `/login` and `/signup`. 401 resource error for `/api/login` and `/api/me` (expected for guests).
- **404 / Broken Network Assets**: None on `/`, `/products`. 91 `<img>` on home, all with `alt`.

### 1.7 Semantic Accessibility, Landmarks & Role-First Locator Strategy

**Key finding: the app has almost no ARIA landmarks or interactive semantics, but it ships comprehensive `data-testid` attributes. Role-first locators work only for page content (headings, form fields via label, "Shop Now"/"Subscribe" buttons). For header, cards, and cart controls, use `getByTestId` (justified exception; consider configuring `testIdAttribute` default `data-testid`, which is Playwright's default) plus `.describe()`.**

#### 1.7.1 ARIA Landmark Regions (For Phase 3 Component Root Scoping)

| Landmark Role (`getByRole`) | HTML Element           | Present on Page? | Purpose / Component Root Mapping                                                                                          |
| :-------------------------- | :--------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `'banner'`                  | `<header>`             | No (0)           | Scope header by testids: `header-logo`, `header-menu-*`, `header-cart-icon`, `header-user-icon`, `header-wishlist-button` |
| `'navigation'`              | `<nav>`                | No (0)           | Nav is `<ul><li data-testid="header-menu-home">`; role is `listitem`                                                      |
| `'main'`                    | `<main>`               | No (0)           | Use `data-testid="home-page"` (home), `all-products-title` etc.                                                           |
| `'dialog'` / `'region'`     | `<dialog>` / `<aside>` | No               | `data-testid="cart-drawer"` (plain div, no role, always in DOM)                                                           |
| `'contentinfo'`             | `<footer>`             | No (0)           | Footer links via `footer-*` testids                                                                                       |

`html[lang="en"]` present. Exactly one `<h1>` per page.

#### 1.7.2 Interactive Control & Heading Locator Mapping

| Element Purpose                                  | Semantic Role (`getByRole`)                             | Accessible Name                                                                                         | Label Pairing (`<label for>`)                                                          | Heading Level / `data-testid`                                                                                                                                                                                                                                                                                                     |
| :----------------------------------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand logo / Home                                | `img` (not a link)                                      | `'logo'`                                                                                                | N/A                                                                                    | `header-logo`; click goes Home                                                                                                                                                                                                                                                                                                    |
| Nav: Home / About Us / Contact Us / All Products | `listitem` (not link)                                   | text of item                                                                                            | N/A                                                                                    | `header-menu-home`, `header-menu-about-us` (`/about-us`), `header-menu-contact-us` (`/contact-us`), `header-menu-all-products` (`/products`)                                                                                                                                                                                      |
| Header cart trigger                              | none (svg)                                              | none                                                                                                    | N/A                                                                                    | `header-cart-icon`; badge `header-cart-count` (only rendered when cart non-empty; counts lines, not units)                                                                                                                                                                                                                        |
| Header user/login trigger                        | none (svg)                                              | none                                                                                                    | N/A                                                                                    | `header-user-icon` -> `/login`                                                                                                                                                                                                                                                                                                    |
| Wishlist trigger                                 | none                                                    | none                                                                                                    | N/A                                                                                    | `header-wishlist-button` -> `/wishlist`                                                                                                                                                                                                                                                                                           |
| Mobile menu                                      | none                                                    | none                                                                                                    | N/A                                                                                    | `header-menu-icon`                                                                                                                                                                                                                                                                                                                |
| Product search (`/products`, IN SCOPE)           | `textbox`                                               | none (placeholder `Search products...`)                                                                 | none                                                                                   | `all-products-search-input`; use `getByPlaceholder('Search products...')`                                                                                                                                                                                                                                                         |
| Home hero title                                  | `heading`                                               | `'Demo E-commerce Testing Store'`                                                                       | N/A                                                                                    | `<h1>`, `hero-title`                                                                                                                                                                                                                                                                                                              |
| Hero CTA                                         | `button` (inside link `/products`)                      | `'Shop Now'`                                                                                            | N/A                                                                                    | `hero-shop-now`                                                                                                                                                                                                                                                                                                                   |
| Category tiles                                   | `heading`                                               | `'Audio & Camera'`, `'Appliances'`, `'Gadgets'`, `'PC & Laptops'` (all link to `/products`)             | N/A                                                                                    | `<h2>`, `category-title-*`                                                                                                                                                                                                                                                                                                        |
| Section headings                                 | `heading`                                               | `'Feature Product'`, `'New Arrivals'`, `'Category Product'`, `'Frequently Asked Questions'`             | N/A                                                                                    | `<h2>`; `featured-products-title`, `new-arrivals-title`, `category-products-title`                                                                                                                                                                                                                                                |
| Offers                                           | `heading` + `button`                                    | `'Enjoy an Exclusive 20% Off on Laptops'`, `'Watch the Price Drop by a Whopping 20%!'`; `'Shop Now'` x2 | N/A                                                                                    | `offer-title-N`, `offer-shop-now-N`                                                                                                                                                                                                                                                                                               |
| Newsletter                                       | `textbox` / `button`                                    | `'Your Email'` / `'Subscribe'`                                                                          | placeholder only                                                                       | `email-input`, `subscribe-button`                                                                                                                                                                                                                                                                                                 |
| Product card (home carousels)                    | `link` to `/product/:slug` containing `heading` level 3 | product name                                                                                            | N/A                                                                                    | `feature-card-header`, `feature-card-price` (`$240`), `feature-card-rating`, `feature-card-review-count` (`(350)`), `feature-card-image`, `wishlist-button`, `cart-button`                                                                                                                                                        |
| Product card (`/products`)                       | `heading` level 2                                       | product name                                                                                            | N/A                                                                                    | `all-products-header`, `all-products-price`, `all-products-cart-button` (icon-only, inner `img` name `'shopping'`), `all-products-wishlist-button` (`'heart'`); rating = 5 `img` named `'star'`, no numeric rating text                                                                                                           |
| (out of scope) Login email / password            | `textbox` / (password has no role)                      | `'Email Address *'` / `'Password *'`                                                                    | Yes: `getByLabel('Email Address')`, `getByLabel('Password')` (ids `email`, `password`) | `login-email-input`, `login-password-input`                                                                                                                                                                                                                                                                                       |
| Login submit                                     | `button`                                                | `'Sign in'`                                                                                             | N/A                                                                                    | `login-submit-button`; title `'Sign In'` (`login-title`), signup link `login-signup-link` ("Sign up")                                                                                                                                                                                                                             |
| (out of scope) Signup fields                     | `textbox`                                               | `'First Name *'`, `'Last Name *'`, `'Email Address *'`, `'Password *'`                                  | Yes (ids `firstname`, `lastname`, `email`, `password`)                                 | `signup-*-input`, `signup-submit-button` (`'Create Account'`), `signup-login-link`                                                                                                                                                                                                                                                |
| Cart drawer                                      | none                                                    | `'Your Cart'` h2; `button 'Close cart'`                                                                 | N/A                                                                                    | `cart-drawer`, `close-cart`, `cart-item`, `cart-item-header`, `item-quantity`, `increase-quantity`/`decrease-quantity` (icon-only), `item-price`, `remove-item` (`button 'Remove item'`), `subtotal-value`, `shipping-value` ("Free"), `total-value`, `checkout-button`, `view-cart-button` (buttons `'Checkout'`, `'View Cart'`) |
| (out of scope) Cart page (`/cart`)               | `heading`                                               | `'Shopping Cart'` (h1), `'Order Summary'` (h3)                                                          | N/A                                                                                    | `cart-title`, `cart-price`, `cart-quantity`, `cart-increment-button`, `cart-decrement-button` (disabled at qty 1), `cart-subtotal`, `cart-delete-button`, `cart-order-summary-*-value`, `cart-continue-shopping-button` (`'Continue Shopping'`), `cart-checkout-button` (`'Checkout'`)                                            |
| (out of scope) Empty cart                        | `heading`                                               | text contains "empty"                                                                                   | N/A                                                                                    | `cart-empty-title`, `cart-empty-description`                                                                                                                                                                                                                                                                                      |
| (out of scope) PDP                               | `heading`                                               | product name (h1), `'You may also like'` (h2)                                                           | N/A                                                                                    | `product-name`, `product-price`, `product-rating`, `product-review-count`, `quantity-value`, `add-to-cart-button` (`'ADD TO CART'`), `buy-now-button` (`'BUY NOW'`), `description-tab`, `additional-info-tab`, `reviews-tab`                                                                                                      |
| Products toolbar                                 | none                                                    | `Filters` text                                                                                          | N/A                                                                                    | `all-products-filter-toggle`, `all-products-category-select`, `all-products-reset-filters-button` (`'Reset Filters'`), `all-products-results-count` (`Showing 14 products`), `all-products-view-switcher-grid` / `-list`                                                                                                          |

Note on `getByTestId`: duplicates exist (`increase-quantity` appears twice inside one drawer item; carousel clones duplicate cards: 62 `cart-button` on home vs 14 unique products). Always scope with `.first()` or filter by product name, and avoid clones (`.slick-cloned`, `aria-hidden`).

#### 1.7.3 Keyboard-Only Operability Probe (`Tab`, `Enter`, `Space`, `Escape`, Focus Trap)

- **Keyboard Navigation Observations**: On `/`, 8 consecutive Tab presses left focus on `BODY`; no header element is focusable (DEF-003). Form fields and buttons inside forms are natively focusable. Escape/focus trap for the cart drawer not verified (drawer has no dialog role).

### 1.8 Shadow DOM, Iframes & Viewport Platform Adaptation (`SFDIPOT` Platform)

- **Shadow DOM Components**: None observed.
- **Embedded Iframes & Frame Locator Strategy**: 0 iframes on home; no `frameLocator` needed so far.
- **Responsive Viewport Breakpoint Behavior (`Desktop 1280x720`, `Tablet 768x1024`, `Mobile 390x844`)**: Mobile (390): nav links, cart, user, wishlist icons hidden (`hidden lg:block`), hamburger `header-menu-icon` visible; opening it reveals a second set of `header-menu-*` items (duplicate testids in DOM, only the visible one is clickable). No horizontal scroll. Tablet not probed (breakpoint is Tailwind `lg`, 1024px).

### 1.9 Interactive Elements, Component States & Domain Variables

| Interactive Control                      | Default State         | Active / Expanded State                                                                | Disabled / Boundary State               | Hover Trigger Required?              |
| :--------------------------------------- | :-------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------- | :----------------------------------- |
| Cart drawer                              | Off-canvas, in DOM    | Slides in on cart icon click                                                           | Close via `close-cart`                  | No                                   |
| Card wishlist/cart buttons (`/products`) | `opacity-0`           | `opacity-100` on card hover                                                            | n/a                                     | Yes (hover card; forced click works) |
| Cart decrement (out of scope)            | Enabled when qty >= 2 | Decrements                                                                             | Disabled at qty 1                       | No                                   |
| Cart increment (out of scope)            | Enabled               | Increments                                                                             | Stops at 9, stays enabled (DEF-004)     | No                                   |
| Filters panel                            | Collapsed             | Shows Category (All / Uncategorized observed), Price Range `$0 - $2000`, Reset Filters | n/a                                     | Click `all-products-filter-toggle`   |
| Login submit (out of scope)              | Enabled               | "Signing in..." while pending                                                          | Required-field messages on empty submit | No                                   |
| FAQ items                                | Collapsed `group`     | Click question to reveal answer                                                        | n/a                                     | Click                                |

- **Key Domain Variables Identified**: Prices `$15` to `$1,560` (comma formatting for >= $1,000), review counts `(110)` to `(2000)`, cart quantity 1..9, Shipping always "Free" in observed carts, cart persisted as localStorage `cartItems`. No out-of-stock or discount states seen (the "20% off" banners link only to `/products`; no price reflects a discount, an oracle Claims item for Phase 2).

### 1.10 Exploratory Tours & `FEW HICCUPPS` Consistency Oracles

- **Structured Exploratory Tours Executed**: Business District (home -> products -> PDP -> add -> drawer -> /cart -> checkout redirect to login), Skeptical Customer (qty x price math, card vs PDP price), Saboteur (qty overshoot, rapid clicks, empty/invalid login, bad URLs). Registration and authenticated checkout NOT executed (would create data on the shared backend; needs approval).

| Oracle Name                  | What It Evaluates             | Live Observation / Pass or Defect Reference                                                                                                                                        |
| :--------------------------- | :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F — Familiar Problems**    | Rounding, NaN, undefined      | Pass: $240 x 3 = $720, x 9 = $2,160. Search count text "1 products" (not pluralized, trivial).                                                                                     |
| **E — Explainability**       | No silent failures            | DEF-002 (login error), DEF-004 (qty cap).                                                                                                                                          |
| **W — World (Domain Truth)** | Real domain rules             | "Shipping: Free" with no threshold stated; observed only.                                                                                                                          |
| **H — History**              | Consistent transitions        | Pass: delete item gives empty-cart state and removes badge.                                                                                                                        |
| **I — Image (Brand Trust)**  | Visuals/typos                 | DEF-006 typo; all 91 images have `alt`. Carousel repeats the same 14 products (list duplication).                                                                                  |
| **C — Comparable Products**  | Web conventions               | DEF-001 (PDP reload); logo is not a link; nav items not links (DEF-003). Header search absent (search exists only on `/products`).                                                 |
| **C — Claims**               | UI matches its claims         | Offer banners claim "20% Off on Laptops" but link to generic `/products` with no discounted price (Phase 2 to verify). FAQ claims wishlist, reviews, checkout; `/wishlist` exists. |
| **U — User's Expectations**  | Clear empty/validation states | Pass: required-field messages and empty-cart copy; Fail: DEF-002.                                                                                                                  |
| **P — Product Consistency**  | Card vs PDP vs Cart           | Pass for Rode NT1-A: `$240`, `(350)` identical in card, PDP, drawer, cart. Only one product compared.                                                                              |
| **P — Purpose**              | Sort/filter accuracy          | Search "mouse" returned only the Logitech mouse (pass). Category filter only lists All / Uncategorized (observed text); price-range and list/grid not verified.                    |
| **S — Statutes & Standards** | WCAG 2.1 AA                   | DEF-003; `html[lang]` and `alt` pass; DEF-005 titles.                                                                                                                              |

### 1.11 Dynamic, Animated & Visual Sensitivity Widgets

- **Auto-playing Carousels / Sliders & Container Selectors to Mask**: Three react-slick sliders on home: `[data-testid="featured-products-section"] .slick-slider`, `[data-testid="new-arrivals-section"] .slick-slider`, `[data-testid="category-products-section"] .slick-slider` (class `slick-slider slick-initialized`, 17 / 17 / 11 cloned slides, 3 active). Track transform did not change over 4 s (no autoplay observed), but mask the three sections anyway as slides are arrow-driven and cloned. Autoplay interval: none observed.
- **Sticky Navigation / Floating Banners**: Header height 80px; sticky behavior not verified. Offers section (`offers-section`) is static banners.
- **Live Counters / Timers / Dynamic Badges**: `header-cart-count` badge, toast "Added to the cart" / "Item removed from cart" (transient, mask or wait out), cart drawer slide animation.

### 1.12 Baseline Core Web Vitals & Testability Scorecard

- **Largest Contentful Paint (LCP) Candidate**: Hero `img alt="Background"` under `hero-section` (not measured).
- **Cumulative Layout Shift (CLS) Hazards**: Not measured; carousels initialize after load (slick) and the cart badge is injected on first add.
- **Image Lazy Loading & Alt Audit**: 91 images on home, 1 with `loading="lazy"`, 0 missing `alt` (alt values are weak: "dp", "star", "shopping", "heart", "left", "right", "logo").
- **Intrinsic Testability Scorecard (1–5)**:
  - _Observability (API/Console/DOM state clarity)_: 3/5 (cart in localStorage, toasts; silent login failure)
  - _Controllability (Deterministic state reset / direct URLs)_: 3/5 (`localStorage.clear()` resets cart; PDP deep links broken)
  - _Algorithmic Simplicity & Stability_: 4/5 (static catalog, simple math)
  - _Semantic Accessibility (Role-first locator readiness)_: 2/5 (no landmarks, icons unnamed; compensated by pervasive `data-testid`)
  - _Key Testability Recommendations for Engineering_: Add landmarks and real `<a>`/`<button>` for nav and icons with `aria-label`; fix base href (`/` absolute asset paths); show login errors; publish demo credentials or a seed user.

### 1.13 Sign-Off and Handoff

- **Reviewed by**: not recorded (Phase 2 was started on this Phase 1; no approval was recorded)
- **Date**: 2026-10-28
- **Status**: Draft
- **Log entries made this phase**: none
- **Handoff**: the former "Risk Hotspots" list was taken into Section 2.2 with a disposition for every item, so no `HANDOFF 1→2` block remains.

---

## Section 2: Scenarios — What to Check and Why

- **Template**: `docs/templates/02-SCENARIOS.template.md`
- **Scope**: Home (`/`), All Products (`/products`) and the cart drawer, as covered in Section 1
- **Mode**: Full, scoped
- **Feature context**: none
- **Test cases**: none
- **Defects**: none
- **Date**: 2026-10-28
- **Status**: Draft (awaiting review)

### 2.1 Context Frame

| Quality criterion                   | Importance | Why                                                                    |
| :---------------------------------- | :--------- | :--------------------------------------------------------------------- |
| Functionality                       | High       | Search and cart are the store's core flow (1.1, 1.9)                   |
| Reliability and error handling      | Medium     | Cart is client-side and simple; login failure handling is out of scope |
| Usability                           | Medium     | Hover-revealed icon-only actions, no search label (1.7.2)              |
| Accessibility                       | High       | No landmarks, header not keyboard reachable (DEF-003)                  |
| Security                            | Out        | Demo store, no real transactions, shared backend we should not probe   |
| Performance                         | Medium     | 91 images and three carousels on home (1.12)                           |
| Compatibility (browsers, viewports) | High       | Header changes completely below the `lg` breakpoint (1.8)              |
| Localization                        | Out        | English only                                                           |
| Testability and maintainability     | Medium     | Scorecard 2/5 for semantics, offset by pervasive test ids (1.12)       |

- **Constraints**: cart lives in `localStorage` so each browser context starts empty; accounts live on a shared backend and no credentials are published, so nothing that registers or logs in; carousel clones duplicate test ids; product detail pages cannot be loaded directly (DEF-001); public demo site, so keep run volume modest.
- **Out of scope**: login, signup, checkout, product detail, wishlist, contact, newsletter. Phase 1 did not cover them.

### 2.2 Phase 1 Intake

| Phase 1 source                     | Item                                                            | Disposition                                                            |
| :--------------------------------- | :-------------------------------------------------------------- | :--------------------------------------------------------------------- |
| 1.12 hotspots, DEF-001             | Product detail direct load and reload                           | Dropped: out of scope. Policy in 2.9                                   |
| 1.12 hotspots                      | Login credentials, checkout, logout, wishlist, reviews, BUY NOW | Dropped: out of scope                                                  |
| 1.12 hotspots                      | Duplicated test ids from carousel clones and drawer             | Handoff to Phase 3                                                     |
| 1.12 hotspots                      | Cart badge counts lines, not units; quantity cap of 9           | `CH-003` (owner question: is the badge meaning intended?)              |
| 1.12 hotspots                      | "20% off" banners link to generic `/products`                   | `CH-002`                                                               |
| 1.12 hotspots                      | Category filter contents, price range, list/grid not verified   | `CH-001` (explore first, then promote findings to scenarios)           |
| 1.12 hotspots                      | Tablet viewport not probed                                      | `VIS-001`, `CH-004`                                                    |
| DEF-003                            | Header not keyboard reachable, no landmarks                     | `AUD-001`, `AUD-005`                                                   |
| DEF-005                            | Generic titles on login, signup, cart                           | `AUD-003` on in-scope routes only; other routes dropped (out of scope) |
| DEF-006                            | Footer typo                                                     | Dropped: low risk, stays in the defect ledger                          |
| DEF-002, DEF-004                   | Silent login failure, quantity cap                              | Dropped: observed on out-of-scope pages (`CH-003` touches the cap)     |
| 1.10 oracles (Product Consistency) | Card, PDP and cart price agree; only one product checked        | `SC-004` (card and drawer only)                                        |
| 1.12 vitals                        | Layout shift hazards, lazy loading 1 of 91 images               | `AUD-002`, `AUD-004`                                                   |
| 1.12 vitals                        | Alt text values are weak ("dp", "star")                         | Dropped: needs human judgement, recorded in 2.9                        |
| 1.4 timing                         | Search result for no match, wording unknown                     | `SC-002` (needs a live check in Phase 4 before locators are written)   |

### 2.3 Risk Register

| Risk ID | Failure mode (what goes wrong, for whom)                                | Likelihood | Impact | Priority | Covered by                     |
| :------ | :---------------------------------------------------------------------- | :--------- | :----- | :------- | :----------------------------- |
| `R-001` | Shopper searches and gets wrong or missing products                     | M          | H      | `P0`     | `SC-001`, `SC-002`             |
| `R-002` | Add to cart fails or shows the wrong item or count                      | M          | H      | `P0`     | `SC-003`, `SC-005`             |
| `R-003` | Cart contents or prices differ from what the shopper chose, or are lost | M          | H      | `P0`     | `SC-004`, `SC-006`, `CH-003`   |
| `R-004` | Hero call to action does not lead to the catalog                        | L          | H      | `P1`     | `SC-007`                       |
| `R-005` | Layout or navigation breaks below the desktop breakpoint                | M          | M      | `P1`     | `VIS-001`, `VIS-003`, `CH-004` |
| `R-006` | Keyboard and screen-reader users cannot operate header controls         | H          | M      | `P1`     | `AUD-001`, `AUD-005`           |
| `R-007` | Offer banners promise a discount the shopper does not get               | M          | M      | `P2`     | `CH-002`                       |
| `R-008` | Filters or view switch return wrong products                            | M          | M      | `P2`     | `CH-001`                       |
| `R-009` | Slow load or layout shift from images and carousels                     | M          | M      | `P2`     | `AUD-002`, `AUD-004`           |
| `R-010` | Hostile or odd search input breaks the page                             | L          | M      | `P2`     | `SC-008`                       |

Override: `R-005` is raised from `P2` to `P1` because Compatibility is rated High in 2.1.

### 2.4 Test Techniques and Data Variation

| Entity / behavior   | Technique                          | Derived cases                                                                      | Scenario                     |
| :------------------ | :--------------------------------- | :--------------------------------------------------------------------------------- | :--------------------------- |
| Search text         | Zero / One / Many, equivalence     | empty, one match, broad match, no match, special characters, 256+ characters       | `SC-001`, `SC-002`, `SC-008` |
| Cart lines          | State transition                   | 0 to 1 (badge appears), 1 to 0 (badge disappears, empty state), reload keeps state | `SC-003`, `SC-005`, `SC-006` |
| Price display       | Consistency across views           | listing card price equals drawer price                                             | `SC-004`                     |
| Filters and view    | Pairwise (category x price x view) | explored in a charter first                                                        | `CH-001`                     |
| Viewport            | Equivalence (above or below `lg`)  | 1280 desktop, 768 tablet, 390 mobile                                               | `VIS-001`, `VIS-003`         |
| Hero call to action | Claims                             | the button says Shop Now and goes to the catalog                                   | `SC-007`                     |

### 2.5 Scenario Catalog

#### Functional (UI)

| ID       | Intent                                                                 | Risk    | Technique         | Oracle              | Priority | Preconditions and data              | Decision | External refs |
| :------- | :--------------------------------------------------------------------- | :------ | :---------------- | :------------------ | :------- | :---------------------------------- | :------- | :------------ |
| `SC-001` | Searching a product name leaves only the matching product              | `R-001` | One               | Purpose             | `P0`     | Fresh context, empty cart, no login | Automate |               |
| `SC-002` | Searching for something that does not exist tells the shopper so       | `R-001` | Zero              | Explainability      | `P1`     | Fresh context, empty cart, no login | Automate |               |
| `SC-003` | Adding a product shows one cart line in the badge and the drawer       | `R-002` | 0 to 1            | Product consistency | `P0`     | Fresh context, empty cart, no login | Automate |               |
| `SC-004` | The price on the listing card equals the price in the drawer           | `R-003` | Consistency       | Product consistency | `P1`     | Fresh context, empty cart, no login | Automate |               |
| `SC-005` | Removing the only item shows the empty-cart state and clears the badge | `R-002` | 1 to 0            | History             | `P1`     | One item in the cart, no login      | Automate |               |
| `SC-006` | Cart contents survive a full page reload                               | `R-003` | State persistence | User expectations   | `P1`     | Items in the cart, no login         | Automate |               |
| `SC-007` | The hero Shop Now button leads to all products                         | `R-004` | Claims            | Claims              | `P1`     | Fresh context, empty cart, no login | Automate |               |
| `SC-008` | Special-character and very long search text leave the page usable      | `R-010` | Equivalence       | Familiar problems   | `P2`     | Fresh context, empty cart, no login | Automate |               |

#### API contract

Not applicable. All catalog and cart data is client-side (Section 1.5). The login endpoints are out of scope.

#### Visual

| ID        | Page or component            | Viewports               | Dynamic regions to freeze or mask       | Risk    | Priority | Decision |
| :-------- | :--------------------------- | :---------------------- | :-------------------------------------- | :------ | :------- | :------- |
| `VIS-001` | Home, above the fold         | desktop, tablet, mobile | the three product carousels, cart toast | `R-005` | `P1`     | Automate |
| `VIS-002` | All products listing         | desktop, mobile         | none known                              | `R-005` | `P2`     | Automate |
| `VIS-003` | Mobile header with menu open | mobile                  | none known                              | `R-005` | `P2`     | Automate |

#### Audit

| ID        | Target           | Audit type           | Standard or budget                    | Risk    | Priority | Decision |
| :-------- | :--------------- | :------------------- | :------------------------------------ | :------ | :------- | :------- |
| `AUD-001` | `/`, `/products` | Accessibility        | WCAG 2.1 AA scan                      | `R-006` | `P1`     | Automate |
| `AUD-002` | `/`, `/products` | Core Web Vitals      | LCP 2.5 s, CLS 0.1, FCP 1.8 s         | `R-009` | `P2`     | Automate |
| `AUD-003` | `/`, `/products` | Technical SEO        | specific title, description, viewport | `R-009` | `P2`     | Automate |
| `AUD-004` | `/`              | Image loading        | offscreen images lazy-load            | `R-009` | `P2`     | Automate |
| `AUD-005` | `/`              | Keyboard operability | header controls reachable with Tab    | `R-006` | `P1`     | Automate |

### 2.6 Exploratory Charters

| ID       | Explore                                        | With                                                 | To discover                                         | Timebox | Risk    | Record                                             |
| :------- | :--------------------------------------------- | :--------------------------------------------------- | :-------------------------------------------------- | :------ | :------ | :------------------------------------------------- |
| `CH-001` | Filters and list/grid view on All Products     | category and price range combinations, reset, search | wrong results, state not reset, inconsistent counts | 45 min  | `R-008` | combinations tried, anomalies, candidate scenarios |
| `CH-002` | Offer banners and their claims                 | banner links, prices on the listing                  | whether any discount is shown or applied            | 20 min  | `R-007` | claim text, destination, observed prices           |
| `CH-003` | Cart badge and quantity behavior in the drawer | several products, repeated adds, quantity controls   | what the badge counts, limits, silent failures      | 30 min  | `R-003` | badge meaning, caps, questions for the owner       |
| `CH-004` | Tablet and mobile navigation                   | 768 and 390 widths, hamburger menu                   | hidden or duplicated controls, broken layouts       | 25 min  | `R-005` | breakpoints, broken states                         |

### 2.7 Automation Decision

Scored only where the decision is not obvious (`1` low, `3` high; cost: higher means more costly).

| Scenario  | Risk | Frequency | Stability | Determinism | Cost | Decision | Note                                                            |
| :-------- | :--- | :-------- | :-------- | :---------- | :--- | :------- | :-------------------------------------------------------------- |
| `SC-008`  | 1    | 1         | 3         | 3           | 1    | Automate | Cheap and deterministic; low value, so keep it to one test      |
| `VIS-002` | 2    | 2         | 2         | 2           | 2    | Automate | Revisit if baselines churn                                      |
| `VIS-003` | 2    | 1         | 2         | 2           | 3    | Automate | Duplicated test ids on mobile raise cost; revisit after Phase 3 |
| `AUD-002` | 2    | 2         | 2         | 1           | 1    | Automate | Network variance makes budgets flaky; keep generous budgets     |
| `CH-001`  | 2    | 2         | 1         | 3           | 3    | Charter  | Behavior not yet understood; promote findings to scenarios      |

### 2.8 Known Defects and Coverage Gaps

| Defect                          | Scenario             | Policy                                                                  |
| :------------------------------ | :------------------- | :---------------------------------------------------------------------- |
| `DEF-003`                       | `AUD-001`, `AUD-005` | Expect failure until fixed, tagged with the defect ID                   |
| `DEF-005`                       | `AUD-003`            | In-scope routes already set specific titles, so assert current behavior |
| `DEF-001`                       | none                 | Exclude. No scenario loads a product page directly                      |
| `DEF-002`, `DEF-004`, `DEF-006` | none                 | Exclude. Out of scope or low value                                      |

| Not covered                                       | Reason                                         | Revisit when                               |
| :------------------------------------------------ | :--------------------------------------------- | :----------------------------------------- |
| Login, signup, checkout, product detail, wishlist | Outside Phase 1 scope                          | Scope expands or credentials are published |
| Image alt text quality                            | Needs human judgement                          | A human review pass is scheduled           |
| Security testing                                  | Public demo site on a shared backend           | Never, unless owners approve               |
| A separate end-to-end shopper journey             | `SC-007` and `SC-003` already cover the joints | A defect appears between the two           |
| Price range and filter correctness                | Behavior not understood yet                    | `CH-001` completes                         |

### 2.9 Sign-Off and Handoff

- **Reviewed by**: pending
- **Date**: 2026-10-28
- **Log entries made this phase**: none
- **Status**: Draft

```text
<!-- HANDOFF 2→3 status=open -->
- Open question for design: the mobile menu duplicates test ids, needed for `VIS-003`, which is not designed yet
- Assumption to confirm: the empty-search wording is unknown and needs a live check before `SC-002` is built
<!-- /HANDOFF -->
```

---

## Section 3: Automation Design

- **Template**: `docs/templates/03-AUTOMATION-DESIGN.template.md`
- **Scope**: cart scenarios `SC-003` to `SC-006`, plus the existing `SC-001`, `SC-007` and `VIS-001` specs
- **Mode**: Lite
- **Date**: 2026-10-28
- **Status**: Draft (built on the user's approval in session; formal sign-off pending)

### 3.1 Reuse Check

| Need                                            | Existing asset                                | Decision                          | Reason                                                               |
| :---------------------------------------------- | :-------------------------------------------- | :-------------------------------- | :------------------------------------------------------------------- |
| Navigate to a route and wait for a ready marker | none                                          | `New`: `helpers/route.helper.ts`  | Removes the duplicated `open()` logic; composition, not a base class |
| Header cart icon and badge                      | `page-objects/components/header.component.ts` | `Extend`                          | The drawer locators move out so the header has one responsibility    |
| Search and add a product                        | `page-objects/pages/products.page.ts`         | `Extend`                          | Needs the product prices                                             |
| Drawer items, prices, remove, empty message     | none                                          | `New`: `cart-drawer.component.ts` | The drawer is a separate widget from the header                      |

### 3.2 Scenario-to-Test Mapping

| Scenario ID | Suite    | Spec file                   | Test title                                                                    | Tags                     | Annotations |
| :---------- | :------- | :-------------------------- | :---------------------------------------------------------------------------- | :----------------------- | :---------- |
| `SC-001`    | `ui`     | `tests/ui/products.spec.ts` | SC-001 searching a product name leaves only the matching product              | `@smoke`                 | `scenario`  |
| `SC-003`    | `ui`     | `tests/ui/cart.spec.ts`     | SC-003 adding a product shows one cart line in the badge and the drawer       | `@smoke`                 | `scenario`  |
| `SC-004`    | `ui`     | `tests/ui/cart.spec.ts`     | SC-004 the price on the listing card equals the price in the drawer           | `@regression`            | `scenario`  |
| `SC-005`    | `ui`     | `tests/ui/cart.spec.ts`     | SC-005 removing the only item shows the empty-cart state and clears the badge | `@regression`            | `scenario`  |
| `SC-006`    | `ui`     | `tests/ui/cart.spec.ts`     | SC-006 cart contents survive a full page reload                               | `@regression`            | `scenario`  |
| `SC-007`    | `ui`     | `tests/ui/home.spec.ts`     | SC-007 the hero Shop Now button leads to all products                         | `@regression`            | `scenario`  |
| `VIS-001`   | `visual` | `tests/visual/home.spec.ts` | VIS-001 home page matches the approved visual baseline                        | `@regression`, `@visual` | `scenario`  |

### 3.3 Pages and Components

| Name                  | Kind        | Responsibility                                  | Behaviours it exposes                                         | Used by                        | Decision |
| :-------------------- | :---------- | :---------------------------------------------- | :------------------------------------------------------------ | :----------------------------- | :------- |
| `CartDrawerComponent` | `component` | Show and change the cart contents in the drawer | List items and prices, remove an item, show the empty message | `SC-003` to `SC-006`           | `New`    |
| `HeaderComponent`     | `component` | Open the cart and show the item badge           | Open the cart, read the badge                                 | `SC-003` to `SC-006`           | `Extend` |
| `ProductsPage`        | `page`      | Search the catalog and add a product            | Open, search, add, read product names and prices              | `SC-001`, `SC-003` to `SC-006` | `Extend` |

### 3.4 Fixtures and State Setup

| Scenario ID        | Precondition                                | Mechanism                   | Isolation notes                                                                          |
| :----------------- | :------------------------------------------ | :-------------------------- | :--------------------------------------------------------------------------------------- |
| `SC-003`, `SC-004` | Catalog narrowed to one product, empty cart | `UI`                        | Each test gets a fresh browser context, so the cart starts empty                         |
| `SC-005`, `SC-006` | One item in the cart                        | `UI` (add through the page) | Same; storage injection was rejected because it couples tests to the cart storage format |

| Fixture               | Scope  | Provides              | Depends on | Status |
| :-------------------- | :----- | :-------------------- | :--------- | :----- |
| `cartDrawerComponent` | `test` | `CartDrawerComponent` | `page`     | `New`  |

Not filled (Lite): 3.5 test data (no new data), 3.6 design by test type, 3.7 execution design, 3.8 review checklist. `SC-002`, `SC-008`, `VIS-002`, `VIS-003` and `AUD-001` to `AUD-005` are not yet designed.

### 3.9 Sign-Off and Handoff

- **Reviewed by**: pending
- **Date**: 2026-10-28
- **Status**: Draft
- **Log entries made this phase**: none
- **Handoff**: the `HANDOFF 3→4` items were resolved in Section 4 in the same pass, so no block remains.

---

## Section 4: Test Spec

- **Template**: `docs/templates/04-TEST-SPEC.template.md`
- **Scope**: the same as Section 3
- **Mode**: Lite
- **Date**: 2026-10-28
- **Status**: Draft

### 4.1 Live Check Log

| Item                               | How checked                                                                      | Finding                                                                                                                                                                    | Date       |
| :--------------------------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| Drawer items                       | Browser snapshot and script on `/products`, search "mouse", add, open the drawer | Item `cart-item`; name `cart-item-header`; price `item-price` reads "$90"; quantity `item-quantity`; the remove control is a button with the accessible name "Remove item" | 2026-10-28 |
| Listing price against drawer price | Same session                                                                     | The listing card (`all-products-price`) and the drawer both read "$90"                                                                                                     | 2026-10-28 |
| Empty drawer                       | Removed the last item                                                            | The drawer shows "Your cart is empty" (`empty-cart`) and "Start Shopping"; the badge is absent; `localStorage.cartItems` is `[]`                                           | 2026-10-28 |
| Reload                             | Added one item and reloaded `/products`                                          | The badge shows 1 and `cartItems` still has one entry                                                                                                                      | 2026-10-28 |
| Probe state                        | Noted during the check                                                           | The probing browser profile kept a cart from an earlier session. Tests use fresh contexts, so this does not affect them                                                    | 2026-10-28 |

### 4.2 Locator Decisions and Exceptions

| Element                         | Locator used (tier)                      | Source     | Reason, if below role-first                                   | Scoping notes                                                      |
| :------------------------------ | :--------------------------------------- | :--------- | :------------------------------------------------------------ | :----------------------------------------------------------------- |
| Drawer root, items, item prices | Test id (tier 4)                         | 1.7.4, 4.1 | The drawer is a plain element with no role or accessible name | Items and prices are scoped inside the drawer root                 |
| Remove item                     | Role button named "Remove item" (tier 1) | 4.1        | none                                                          | Scoped to the drawer; first match removes the first item           |
| Empty cart message              | Text (tier 3)                            | 4.1        | Plain message; its role was not verified                      | Scoped to the drawer                                               |
| Product prices and names        | Test id (tier 4)                         | 1.7.4      | No semantic role on the listing cards                         | One product after the search, so the first match is the only match |

Not filled (Lite): 4.3 to 4.6.

### 4.7 Completion Checklist

- [x] `npm run check` passes.
- [x] Every `Automate` scenario in scope has a test, and titles, tags and annotations follow `CORE_PRINCIPLES.md` section 7.
- [x] Locator exceptions are recorded above. There were no deviations from the design.
- [x] A first local run was used to debug: 18 of 18 passed on three browsers. The clean evidence run belongs to Phase 5.

### 4.8 Sign-Off and Handoff

- **Reviewed by**: pending
- **Date**: 2026-10-28
- **Status**: Draft
- **Log entries made this phase**: none

---

## Section 5: Evidence

Not started. Follow `docs/templates/05-EVIDENCE.template.md` once Section 4 is `Approved`.

---

## Section 6: Review

Not started. Follow `docs/templates/06-PR-REVIEW.template.md` once Section 5 is `Approved`.
