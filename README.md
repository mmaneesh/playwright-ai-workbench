# Playwright AI Workbench

A simple TypeScript Playwright foundation with separate UI, API, and visual configs, environment selection, Docker, and basic Claude Code/Codex/Antigravity setup.

```sh
npm ci --ignore-scripts
npx playwright install --with-deps
npm run env:config -- stg
npm run check
npm run test:ui
npm run test:api
```

`npm test` runs UI then API. UI uses Chromium, Firefox, and WebKit. Visual checks are opt-in through `npm run test:visual` and require human-approved baselines. Public examples use The Internet and JSONPlaceholder; Internet access is required. JSONPlaceholder simulates writes rather than persisting them.

| Folder             | Purpose                                                             |
| ------------------ | ------------------------------------------------------------------- |
| page_objects/      | Page locators/actions                                               |
| fixtures/          | Necessary test setup/teardown                                       |
| tests/             | UI/API/visual scenarios                                             |
| config/            | Three independent suite configurations                              |
| env-config/        | STG/UAT/PROD targets                                                |
| types/, test-data/ | Contracts and public synthetic data                                 |
| helpers/           | Reserved for useful shared operations; no wrappers currently needed |
| utils/             | Reserved for needed shared constants/enums; no filler code          |

Each config imports dotenv/config to load .env and reads its URL directly from process.env with a public demo default. Use npm run env:config -- stg (or uat / prod) to copy a plain template into the ignored .env file. No folder needs unused code just to be populated. The original starter test remains outside active suite folders. Each suite writes its own report/results. `npm run report` opens the UI report; use `npx playwright show-report playwright-report/api` for API results.

See [PLAN.md](PLAN.md) for the agreed phase boundaries and [the ledger](docs/PLAN-LEDGER.md) for actual status. Environment, Docker, and client setup instructions are below. Root client instruction files are self-contained.

Agents, skills, evals, orchestration, advanced coverage, and optional team integrations remain later phases. Work stays local. Git initialization, branch changes, upstream tracking, staging, commits, remotes, and publication require explicit authorization.

## Foundation checks

`npm run lint` checks code and Playwright usage. `npm run lint:fix` applies available lint fixes. `npm run format:check` checks formatting; `npm run format` formats files. `npm run typecheck` checks TypeScript. `npm run check` runs all three checks and is used by CI.

For local dependency installation without lifecycle scripts or Git hook changes, use `npm ci --ignore-scripts`. `npm run test:ci` uses cross-env to run UI/API tests locally with CI settings across Windows, macOS, and Linux.

Husky installs the pre-commit hook through `npm install` / `npm ci` in a Git checkout. The hook runs lint/format checks on staged files, then typecheck. It does not run browser tests or silently rewrite staged files. Fix failures with the explicit commands above, then stage the corrections.

`npm run env:config -- stg` copies `env-config/stg.env` to ignored `.env`. Pass `uat` or `prod` to the same command to select the other templates. URLs are placeholders until configured for your target application.

# Environments

Each Playwright config reads UI_BASE_URL or API_BASE_URL directly. When neither is supplied, the configs use the public sample applications. There is no environment resolver or profile registry.

Plain templates live in env-config/stg.env, uat.env, and prod.env. Replace STG/UAT/PROD placeholder URLs with your authorized test targets, then select a template:

```sh
npm run env:config -- stg
npm run test:ui
npm run test:api
```

The env command copies that template into the ignored root .env file. Each standalone Playwright config imports dotenv/config to load .env into process.env. The scripts call Playwright directly; there is no custom loader. Use npm run env:config -- stg, npm run env:config -- uat, or npm run env:config -- prod to select the corresponding environment. Public sample URLs remain the defaults when no .env or shell URL is provided.

Shell/CI variables take precedence over .env values. npm run test:ci uses cross-env to set CI=true consistently on Windows, macOS, and Linux. It runs the UI and API suites with CI settings locally; it does not publish anything or connect to a Git branch. To override one URL in PowerShell:

```powershell
$env:UI_BASE_URL = 'https://your-test-app.example'
npm run test:ui
Remove-Item Env:UI_BASE_URL
```

Docker Compose reads the root .env and passes both URL variables to the test container. Example scenarios still require the matching application paths and API contract; changing a URL alone does not adapt a test to another application.

Keep committed templates free of private credentials. Use ignored .env or CI secrets for private values. Confirm the authorized target before mutation; Production environment selection does not authorize mutating tests; obtain explicit approval for such actions. TLS verification remains enabled.

# Docker

Use Docker with a running Linux engine. The image tag matches Playwright Test 1.63.0.

```sh
docker compose build
docker compose run --rm tests
```

For one suite: `docker compose run --rm tests npm run test:api`.

Compose mounts reports and test-results into the repository. No application service is created. Update the Playwright dependency and Docker image tag together.

Private networks may require trusted certificate/proxy configuration in Docker. Node and browser trust are separate. Do not disable TLS verification or bake private credentials/certificates into the public image. Container runtime validation remains pending where network trust blocks it.

# AI client setup

AI is optional for running tests. Use your existing client login; test execution needs no provider API keys. Project instructions and optional browser MCP templates are provided.

| Client              | Instructions          | Project MCP config      |
| ------------------- | --------------------- | ----------------------- |
| Claude Code         | CLAUDE.md             | .mcp.json               |
| Codex               | AGENTS.md             | .codex/config.toml      |
| Current Antigravity | GEMINI.md / AGENTS.md | .agents/mcp_config.json |

Open this directory in the client, approve workspace trust as required, and inspect its MCP server status. Codex loads project config only for trusted projects. Claude's /mcp and Antigravity's MCP Servers view show connection status. Older editions can use different discovery paths; confirm against your installed version. No global settings are changed here.

Each template uses pinned official @playwright/mcp@0.0.83, isolated/headless Google Chrome, and the same public demo origins. Install Chrome and ensure Node/npm are available on the client's PATH. First connection downloads the server. Windows editions that cannot directly launch npx may require their documented cmd /c wrapper.

Origin filtering is not a security boundary. Keep normal tool permissions and consent enabled; treat browser content as untrusted. Before browsing another target, confirm authorization and intentionally update the origins in the relevant configs.

Client discovery and MCP connections remain unverified. Confirm template compatibility with the installed client before connecting.
