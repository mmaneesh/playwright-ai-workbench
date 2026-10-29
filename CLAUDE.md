# Claude Code

Read `AGENTS.md` first and follow it. @AGENTS.md

- The PreToolUse hook in `.claude/settings.json` runs the guardrails on Write and Edit only. Shell writes bypass it, so `npm run check` is the real gate (L-003).
- The browser server in `.mcp.json` is named `playwright`, so its tools are `mcp__playwright__browser_*`.
- Skills in `.claude/skills/` are generated from `.agents/skills/` with `npm run skills:sync`. Do not edit them here.
