# Target Registry

Every target this repo has been pointed at, and the per-target names that must
never appear in the process layer (`AGENTS.md`, `CORE_PRINCIPLES.md`, any agent
or skill file - `INTENT.md` §2). `npm run docs:check` greps the process layer
for every name below; add a target here when it's brought in, not after.

| Target                          | Names (case-insensitive, checked)      | Config                      | Spec file                                                      |
| :------------------------------ | :------------------------------------- | :-------------------------- | :------------------------------------------------------------- |
| Sauce Demo / Swag Labs (UI)     | `saucedemo`, `sauce demo`, `swag labs` | `env-config/saucedemo.env`  | `specs/saucedemo.plan.md`, `docs/targets/saucedemo-defects.md` |
| Gaurav Khurana Bill Payment API | `billpay`, `gauravkhurana`             | `.env` (`API_BASE_URL`)     | none yet - API suite predates the spec-file format             |
| LambdaTest eCommerce Playground | `lambdatest`                           | `env-config/lambdatest.env` | archived - never exercised by a current spec                   |
