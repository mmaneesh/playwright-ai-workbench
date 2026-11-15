# Target Registry

Every target this repo has been pointed at, and the per-target names that must
never appear in the process layer (`AGENTS.md`, `CORE_PRINCIPLES.md`, any agent
or skill file - `INTENT.md` §2). `npm run docs:check` greps the process layer
for every name below; add a target here when it's brought in, not after.

The **Origin** column is also checked: every non-archived origin below must
appear in `--allowed-origins` in `.mcp.json`, `.agents/mcp_config.json`, and
`.codex/config.toml` (the browser MCP server refuses to navigate anywhere not
on that list), and anything in those configs that isn't listed here is a
stale, orphaned origin (`INTENT.md` §2).

| Target                          | Names (case-insensitive, checked)      | Origin                                                       | Config                              | Spec file                                                      |
| :------------------------------ | :------------------------------------- | :----------------------------------------------------------- | :---------------------------------- | :------------------------------------------------------------- |
| Sauce Demo / Swag Labs (UI)     | `saucedemo`, `sauce demo`, `swag labs` | `https://www.saucedemo.com`                                  | `env-config/{dev,stg,uat,prod}.env` | `specs/saucedemo.plan.md`, `docs/targets/saucedemo-defects.md` |
| Gaurav Khurana Bill Payment API | `billpay`, `gauravkhurana`             | `https://billpay-api.gauravkhurana-practice-api.workers.dev` | `.env` (`API_BASE_URL`)             | none yet - API suite predates the spec-file format             |
