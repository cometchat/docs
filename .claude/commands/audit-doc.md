---
description: Audit one or more MDX pages using the docs-reviewer (template compliance) and dual-audience-auditor (DX + AI-readiness) skills
---

Audit the page(s) in `$ARGUMENTS` (a path or glob). Do not auto-fix unless I say so.

For each page:

1. **Template compliance** — use the **docs-reviewer** skill (`.claude/skills/docs-reviewer/`). It carries the official CometChat page templates, required section ordering, table formats, banned marketing phrases, glossary rules, and nav constraints. For any `rest-api/**` page, follow `rest-api.md` rather than the Component/Overview template.

2. **Dual-audience quality** — use the **dual-audience-auditor** skill (`.claude/skills/dual-audience-auditor/`) for content quality and AI-agent/RAG readiness: heading hierarchy, self-contained chunking, terminology normalization, pronoun clarity, "why before how", and the agentic-readiness score.

3. **Mechanical checks** — internal links resolve to real files (relative, no `.mdx`); referenced images exist under `images/`/`assets/`; the page path appears in `docs.json` nav (else orphaned); if recently moved/renamed, a redirect exists.

Output a concise report per page: an issues list with `file:line` references grouped Critical / Important / Nice-to-have, plus the agentic-readiness score from the auditor skill. Never read `docs.json` or the OpenAPI specs whole — query with python/grep.
