---
name: pr-review
description: Stage 5 (PR review). Invokes the verifier agent to review a diff against CORE_PRINCIPLES.md and the target's spec file, and report a recommended verdict.
---

# /pr-review: Stage 5

Dispatches to the `verifier` agent (`.claude/agents/verifier.md`) - read-only
tools, cannot fix code, cannot give the final merge decision. See that agent's
file for its full procedure and review-area table.

The human always makes the final merge decision (`INTENT.md` §4, Stage 5).
