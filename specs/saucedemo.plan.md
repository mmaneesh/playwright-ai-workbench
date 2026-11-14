# Sauce Demo (Swag Labs): Test Plan

Migrated 2026-11-14 from the retired Sauce Demo workbook (its Sections 1-2)
into this single-file format (`INTENT.md` §3, §11). No findings were dropped
in the move - see `docs/targets/saucedemo-defects.md` for the defect ledger.

## Stage 0 - Intake

- **What is this**: Public demo e-commerce storefront ("Swag Labs") built by
  Sauce Labs explicitly as an automation/QA practice target, with
  intentionally seeded defects behind specific demo accounts.
- **Surfaces**: UI only. No API exists for this target. Visual and audit
  suites were deliberately not opened for this target this pass.
- **Database access**: no.
- **Auth model**: 6 published demo accounts, password `secret_sauce` for all:
  `standard_user` (happy path), `locked_out_user` (clean, accessible lockout
  error), `problem_user`, `performance_glitch_user`, `error_user`,
  `visual_user` (the last four are Sauce Labs' own seeded-defect accounts).
- **Constraints**: shared public demo app - no destructive/mutating actions
  beyond what the app itself resets via "Reset App State."
- **Scope for this pass**: Login, inventory, cart, and the full checkout flow,
  plus the four seeded-defect accounts (`CH-001`, executed 2026-11-14).

## Context

- **Core value proposition**: a sandbox for a QA engineer or automation
  framework to practice against - no real shoppers, no real inventory or
  payment.
- **Top risks to value**: see Risk Register below.
- **Testability**: high - clean `data-test` attributes once confirmed (this
  site uses `data-test`, not Playwright's default `data-testid`).

## Risk Register

| Risk ID | Failure mode                                                                               | Likelihood | Impact | Priority |
| :------ | :----------------------------------------------------------------------------------------- | :--------- | :----- | :------- |
| `R-001` | A user cannot log in, or a locked-out user gets no clear explanation                       | M          | H      | `P0`     |
| `R-002` | Adding or removing a product shows the wrong cart count                                    | M          | H      | `P0`     |
| `R-003` | Checkout cannot be completed at all                                                        | L          | H      | `P0`     |
| `R-004` | A keyboard user's checkout is silently cancelled instead of advanced (`DEF-001`)           | H          | M      | `P1`     |
| `R-005` | Sort control does not actually reorder the product list                                    | L          | M      | `P2`     |
| `R-006` | A product renders the wrong (or no) image and nothing notices (`DEF-002`)                  | L          | M      | `P2`     |
| `R-007` | The checkout form throws an uncaught client-side exception and nothing notices (`DEF-003`) | L          | M      | `P2`     |

## Scenarios

### SC-001 - Valid login reaches the inventory page

- Risk: `R-001` · Priority: `P0` · Technique: Equivalence classes · Oracle: User expectations
- Preconditions: guest, `standard_user`/`secret_sauce`
- Test case: 1) Log in as `standard_user` -> expect: inventory page loads, title "Products"
- Decision: `Automate`
- Spec: `tests/ui/saucedemo/login.spec.ts`

### SC-002 - Locked-out user sees a clear, accessible error

- Risk: `R-001` · Priority: `P1` · Technique: Equivalence classes · Oracle: Explainability
- Preconditions: guest, `locked_out_user`/`secret_sauce`
- Test case: 1) Log in as `locked_out_user` -> expect: accessible (`role="alert"`) error containing "locked out"; no navigation to inventory
- Decision: `Automate`
- Spec: `tests/ui/saucedemo/login.spec.ts`

### SC-003 - Adding a product updates the badge and the cart page

- Risk: `R-002` · Priority: `P0` · Technique: State transition · Oracle: History
- Preconditions: logged in as `standard_user`, empty cart
- Test case: 1) Add a product -> expect: header badge shows "1" 2) Open cart -> expect: 1 item listed
- Decision: `Automate`
- Spec: `tests/ui/saucedemo/cart.authenticated.spec.ts`

### SC-004 - Removing the only item clears the badge and empties the cart

- Risk: `R-002` · Priority: `P1` · Technique: State transition · Oracle: History
- Preconditions: logged in, one item in cart
- Test case: 1) Remove the item -> expect: cart shows 0 items, badge hidden
- Decision: `Automate`
- Spec: `tests/ui/saucedemo/cart.authenticated.spec.ts`

### SC-005 - A full checkout completes and reaches the confirmation page

- Risk: `R-003` · Priority: `P0` · Technique: Flow / story · Oracle: Claims
- Preconditions: logged in, one item in cart
- Test case: 1) Checkout, fill info, continue -> expect: total equals subtotal + tax 2) Finish -> expect: "Thank you for your order!" confirmation
- Decision: `Automate`
- Spec: `tests/ui/saucedemo/checkout.authenticated.spec.ts`

### SC-006 - Enter on checkout step one does not silently cancel the order

- Risk: `R-004` · Priority: `P1` · Technique: Comparable products (convention) · Oracle: Comparable products
- Preconditions: logged in, on checkout step one with valid field values
- Test case: 1) Fill the form, press Enter instead of clicking Continue -> expect: advances to step two, not back to the cart
- Decision: `Automate (known-defect)` - DEFECT (`DEF-001`, `Open`): Cancel precedes Continue in the shared form's DOM order, so Enter's implicit submit hits Cancel instead. Automated as an expected failure (`test.fail()`) until fixed.
- Spec: `tests/ui/saucedemo/checkout.authenticated.spec.ts`

### SC-007 - Sorting by "Price (low to high)" actually reorders the list

- Risk: `R-005` · Priority: `P2` · Technique: Claims · Oracle: Purpose
- Preconditions: logged in, on the inventory page
- Test case: 1) Sort by "Price (low to high)" -> expect: at least one product listed, prices ascending
- Decision: `Automate`
- Spec: `tests/ui/saucedemo/inventory.authenticated.spec.ts`

### SC-008 - problem_user sees the same broken placeholder image for every product

- Risk: `R-006` · Priority: `P2` · Technique: Claims · Oracle: Claims
- Preconditions: guest, `problem_user`/`secret_sauce`
- Test case: 1) Log in, view inventory -> expect: at least one product listed, all images identical (the seeded `sl-404-*.jpg` placeholder)
- Decision: `Automate (known-defect)` - DEFECT (`DEF-002`, `Accepted` - seeded, won't be remediated): verified via DOM `src` + a live network trace (only 1 unique image request for 6 products).
- Spec: `tests/ui/saucedemo/seeded-accounts.spec.ts`

### SC-010 - error_user throws an uncaught exception filling the checkout form

- Risk: `R-007` · Priority: `P2` · Technique: Fault injection (seeded account) · Oracle: Conformance to spec
- Preconditions: guest, `error_user`/`secret_sauce`, one item in cart
- Test case: 1) Reach checkout step one, fill the form -> expect: a `pageerror` event fires (the seeded `TypeError` in the app's own `onChange` handler)
- Decision: `Automate (known-defect)` - DEFECT (`DEF-003`, `Accepted` - seeded, won't be remediated).
- Spec: `tests/ui/saucedemo/seeded-accounts.spec.ts`

`SC-009` is intentionally unused - reserved for `performance_glitch_user` if a
non-flaky way to assert its slowness is ever found (see "Not covered" below).

## Exploratory charters

- `CH-001` (`problem_user`, `visual_user`, `performance_glitch_user`,
  `error_user` accounts) - executed 2026-11-14. Findings: `problem_user` ->
  `SC-008`/`DEF-002`; `error_user` -> `SC-010`/`DEF-003`;
  `performance_glitch_user` confirmed slow (not automated, see below);
  `visual_user`'s backpack image renders at a different width (262px) than
  the other 5 products (159px) at the same viewport - confirmed, needs a
  screenshot baseline to assert reliably, not a bounding-box heuristic.
- `CH-002` (open) - landmark roles on inventory/cart/checkout pages, 15 min
  timebox, to discover whether `header`/`nav`/`footer`/`main` roles are
  present post-login.

## Not covered

| Item                                      | Reason                                                                                                               | Revisit when                                                                |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `performance_glitch_user` timing          | Confirmed slow (`CH-001`); a fixed threshold would be flaky across CI runners for a risk with no production exposure | A non-flaky way to assert it is found, or a real perf budget is applied     |
| `visual_user` layout difference           | Confirmed (`CH-001`); needs a screenshot baseline, not a bounding-box heuristic                                      | The visual regression suite exists (`PLAN.md` Phase 4)                      |
| API, visual, audit suites for this target | No API exists; visual/audit intentionally out of scope for this pass                                                 | If this target is kept as a long-term suite rather than a portability proof |
| Sort options beyond "Price (low to high)" | Low risk, redundant with `SC-007`'s technique                                                                        | If a sort-specific defect is ever reported                                  |

## Confidence Log

### 2026-11-14 - Stage 1 - Explore (`CH-001`)

- Confidence: 7
- Unknowns: whether `DEF-002` (the identical placeholder image) also affects
  the cart or product-detail pages, not checked - only the inventory page was
  verified.
- Rationale: every finding (`problem_user`'s image, `error_user`'s exception,
  `performance_glitch_user`'s timing, `visual_user`'s layout) was confirmed by
  a live observation - DOM inspection, a network trace, or a console error -
  not inferred. Held back from High because of the one unchecked
  generalization above.

### 2026-11-14 - Stage 2/3 - Scenarios, Test cases

- Confidence: 9
- Unknowns: none.
- Rationale: `SC-008`/`SC-010` were written directly from the Stage 1
  observations above, each with a concrete test case and a traced `DEF-ID`.
  `SC-001`-`SC-007` were migrated unchanged in substance from the
  previously-verified workbook (risk, priority, technique, and oracle
  preserved exactly). `performance_glitch_user`/`visual_user` are a decided
  exclusion with a stated reason, not an open unknown.
