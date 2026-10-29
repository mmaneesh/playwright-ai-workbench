# Playwright AI Workbench — Core Principles

This document defines the core principles of our test automation framework. Every test, fixture, page object, and automated agent must adhere to these principles.

---

## 1. Commands

Simple, direct npm scripts with zero custom wrappers or dynamic runners.

| Command                       | Purpose                                                            |
| :---------------------------- | :----------------------------------------------------------------- |
| `npm run env:config -- <env>` | Atomic environment switch (`dev`, `stg`, `uat`, `prod`)            |
| `npm run check`               | Quality check: runs linter, format check, and typecheck            |
| `npm run test:ui`             | Run UI and E2E tests                                               |
| `npm run test:api`            | Run API contract tests                                             |
| `npm run test:visual`         | Run visual regression tests (Docker: `npm run test:visual:docker`) |
| `npm run test:audit`          | Run Accessibility, Web Vitals, and SEO audits                      |
| `npm run guardrails:check`    | Run pure TypeScript rule checker on staged/modified files          |

---

## 2. Code Standards

Native Playwright, modular composition, and high-signal diagnostics.

| Area                     | Principle                                                                                     |
| :----------------------- | :-------------------------------------------------------------------------------------------- |
| **Dependency Injection** | Tests consume pages and services via `@fixtures`. Never instantiate `new PageObject(page)`.   |
| **Locators**             | Role-first (`getByRole`, `getByLabel`). Always chain `.describe('purpose')` for clear traces. |
| **API Contracts**        | Validate all API responses using strict Zod schemas in `types/schemas/`. Zero `any`.          |
| **Assertions**           | Always use auto-retrying web-first assertions (`await expect(locator).toBeVisible()`).        |
| **Test Steps**           | Wrap actions and assertions in native `test.step('Action description')`. No Gherkin prefixes. |
| **Exploration First**    | Inspect the real app (via Playwright CLI / MCP) before writing locators. Never guess.         |
| **Verification**         | Pass `npm run check` and execute affected tests before considering work done.                 |

---

## 3. Guardrails

Eliminate flakiness, coupling, and maintenance nightmares.

| Anti-Pattern          | Why We Avoid It                                                                         |
| :-------------------- | :-------------------------------------------------------------------------------------- |
| **No Hard Sleeps**    | Never use `page.waitForTimeout()`. Rely on auto-waiting assertions.                     |
| **No XPath**          | Never use `//...` or fragile CSS selector chains. Use semantic accessible locators.     |
| **No God Objects**    | Never create a monolithic BasePage. Break UI into small components via fixtures.        |
| **No Pseudo-Gherkin** | Do not write `GIVEN/WHEN/THEN` strings. Write clear, natural action descriptions.       |
| **No Untyped Data**   | Do not use raw `.json` files. Use typed `.ts` constants (`as const`) or data factories. |
| **No Speculation**    | Never write code or assertions without live DOM or documented API contracts.            |

---

## 4. Folder Structure

Domain-driven separation with single responsibilities.

| Folder                     | Contents                                                          |
| :------------------------- | :---------------------------------------------------------------- |
| `page-objects/pages/`      | Page-specific classes with locators and actions                   |
| `page-objects/components/` | Reusable UI components (header, modal, cookie banner)             |
| `tests/ui/`                | UI and end-to-end tests                                           |
| `tests/api/`               | API endpoint and contract tests                                   |
| `tests/visual/`            | Visual snapshot regression tests                                  |
| `tests/audit/`             | Accessibility (Axe-core), Web Vitals, and SEO tests               |
| `fixtures/`                | Composable fixtures for dependency injection and setup            |
| `test-data/`               | Synthetic data factories and typed static constants               |
| `types/`                   | Zod schemas, TypeScript types, and enums                          |
| `config/`                  | Independent suite configurations (`ui`, `api`, `visual`, `audit`) |

---

## 5. Naming Conventions

Predictable, semantic, and descriptive. Never abbreviate or guess.

### Files & Directories

- **Directories**: `kebab-case` (`page-objects/`, `test-data/`, `tests/ui/`)
- **Pages**: `kebab-case` with `.page.ts` (`login.page.ts`, `user-profile.page.ts`)
- **Components**: `kebab-case` with `.component.ts` (`header.component.ts`, `modal.component.ts`)
- **Specs**: `kebab-case` with `.spec.ts` (`login.spec.ts`, `checkout.spec.ts`)
- **Fixtures**: `kebab-case` with `.fixture.ts` (`ui.fixture.ts`, `api.fixture.ts`)
- **Schemas**: `kebab-case` with `.schema.ts` (`user.schema.ts`, `post.schema.ts`)
- **Factories**: `kebab-case` with `.factory.ts` (`user.factory.ts`, `product.factory.ts`)
- **Static Data**: `kebab-case` with `.data.ts` (`messages.data.ts`)
- **Enums**: `kebab-case` with `.enum.ts` (`routes.enum.ts`, `roles.enum.ts`)
- **Helpers**: `kebab-case` with `.helper.ts` (`auth.helper.ts`, `date.helper.ts`)

### Code Elements

- **Classes**: `PascalCase` with suffix (`LoginPage`, `HeaderComponent`, `AuthHelper`)
- **Locators**: `camelCase` with element suffix (`emailInput`, `submitButton`, `errorBanner`)
- **Actions**: `camelCase` verb phrases (`open()`, `login()`, `searchFor()`)
- **Variables**: `camelCase` descriptive noun phrases (`authToken`, `userProfile`)
- **Constants**: `UPPER_SNAKE` for global constants (`DEFAULT_TIMEOUT`, `STORAGE_STATE_PATH`)
- **Enums**: `PascalCase` name with `UPPER_SNAKE` keys (`enum UserRole { ADMIN = 'admin' }`)
- **Types**: `PascalCase` contracts (`UserCredentials`, `ApiResponse<T>`)
- **Schemas**: `PascalCase` with `Schema` suffix (`UserSchema` -> `type User = z.infer<typeof UserSchema>`)

---

## 6. Workflow & Approvals

AI works autonomously within bounds, but halts on uncertainty.

1. **Inspect**: Check the live page or API contract first.
2. **Confidence Gate**: Score plan confidence 1–10. **If confidence < 5, stop and ask the user.**
3. **Approval Gates**: Always ask before:
   - Updating visual baseline snapshots.
   - Performing destructive actions on shared environments.
   - Skipping or quarantining failing tests.
   - Modifying core framework configurations.
4. **Deliver & Verify**: Write clean code, run `npm run check`, run affected tests, and report proof.

---

## 7. Test Structure

How tests are organised, so every scenario is traceable and every test stays independent.

| Area              | Rule                                                                                                                                                                           |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One scenario**  | One scenario maps to one test. Data-driven variants are allowed, and each carries its scenario ID.                                                                             |
| **Title**         | `<ID> <intent in plain language>`, for example `SC-001 search by name leaves only the matching product`.                                                                       |
| **Tags**          | Priority tag from Phase 2 (`@smoke`, `@regression`, `@edge`), plus the suite tag (`@visual`, `@audit`) where one applies.                                                      |
| **Annotations**   | Link a test to outside records with Playwright's `annotation` option. Types: `scenario`, `requirement`, `case`, `defect`. They are tool-neutral, so any reporter can map them. |
| **Spec files**    | One spec file per feature area, in the folder for its level, named after the area.                                                                                             |
| **Grouping**      | Group the tests of one feature area in a `test.describe` named after the area. Setup shared by the group lives inside it.                                                      |
| **Independence**  | Every test runs alone and in any order. No shared mutable state between tests.                                                                                                 |
| **Page objects**  | They expose locators and actions, never assertions. No raw selectors outside page objects.                                                                                     |
| **Locator order** | Role, then label, then text or placeholder. A test id is a documented exception, with the reason recorded in the workbook.                                                     |
