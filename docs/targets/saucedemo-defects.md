# Sauce Demo (Swag Labs): Defect Ledger

- **Target Application**: Sauce Demo (Swag Labs)
- **Target URL**: `https://www.saucedemo.com`
- **Environment**: `env-config/saucedemo.env` (`UI_BASE_URL=https://www.saucedemo.com`)
- **Created**: October 29, 2026
- **Status**: Active Ledger
- **Defect tool**: none

Record format, severity, levels, oracle names and statuses are defined in `docs/templates/DEFECT_LEDGER.template.md` and `docs/templates/README.md`.

---

## 1. Rules

Logging rules are in section 1 of `docs/templates/DEFECT_LEDGER.template.md`.

---

## 2. Summary Table

| Defect ID | Title                                                                      | Severity | Level | Oracle                              | Found by | Status  | Ticket key |
| :-------- | :------------------------------------------------------------------------- | :------- | :---- | :---------------------------------- | :------- | :------ | :--------- |
| `DEF-001` | Pressing Enter on checkout step one submits "Cancel" instead of "Continue" | Medium   | UI    | Explainability, Comparable products | Phase 1  | Triaged | none       |

---

## 3. Detailed RIMGEA Defect Records

### DEF-001: Pressing Enter on checkout step one submits "Cancel" instead of "Continue"

- **Severity**: Medium
- **Level**: UI
- **Oracle**: Explainability (the user gets no indication their checkout was just cancelled), Comparable products (breaks the universal "Enter submits the primary form action" convention)
- **Status**: Triaged
- **Found by**: Phase 1
- **Route or endpoint**: `/checkout-step-one.html`
- **Element or field**: the `firstName`/`lastName`/`postalCode` form and its two submit controls

#### Stakeholder and user impact (Externalize)

A keyboard-driven user (or anyone who instinctively presses Enter after filling the last field, which is extremely common) gets silently sent back to the cart instead of advancing to the order summary. There is no error, no warning — the form data is simply lost and checkout is aborted. For a checkout flow, this is a direct, silent conversion loss.

#### Minimal steps to reproduce (Replicate and Isolate)

1. Go to `https://www.saucedemo.com/`, log in as `standard_user` / `secret_sauce`.
2. Add any product to the cart, open the cart, click "Checkout".
3. Fill First Name, Last Name, and Postal/Zip Code.
4. Press `Enter` instead of clicking "Continue".
5. Observe: the browser navigates to `/cart.html` (the "Cancel" action), not `/checkout-step-two.html`.

Isolated via DOM inspection: both `[data-test="cancel"]` (`<button type="submit">`) and `[data-test="continue"]` (`<input type="submit">`) live inside the same `<form>`, with `cancel` appearing before `continue` in DOM order. Per the HTML spec, a form's implicit submit (triggered by Enter in a text field) activates the **first** submit control in DOM order — here, that's Cancel.

#### Generalization (Maximize and Generalize)

Confirmed specifically on checkout step one. Not checked on step two's Cancel/Finish pair (same risk pattern would apply if they share a form with the same DOM order), noted as an open question for Phase 2.

#### Expected result

Pressing Enter after filling a form's primary fields should trigger the form's main/primary action (Continue), matching standard web convention, or the Cancel and Continue controls should not share one `<form>` with an ambiguous implicit-submit order.

#### Actual result

Enter silently triggers Cancel, discarding the entered checkout information with no warning.

#### Diagnostics

```text
cancelType: BUTTON:submit
continueType: INPUT:submit
formChildrenOrder: ["firstName", "lastName", "postalCode", "cancel", "continue"]
```

#### Artifacts

- Live verification: in-browser JS inspection and manual Enter-key reproduction against `https://www.saucedemo.com/`, 2026-10-29.
- Automated reproduction: `tests/ui/saucedemo/checkout.authenticated.spec.ts` ("SC-006 pressing Enter on checkout step one does not cancel the order"), confirmed on the 2026-10-29 Phase 5 run. `test-results/` from that run is not durable (`D-015`); reproduce on demand with `npx playwright test --config=config/playwright.ui.config.ts tests/ui/saucedemo/checkout.authenticated.spec.ts -g SC-006`.
