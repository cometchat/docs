# CometChat Docs — working guide for Claude

This is the **Mintlify** documentation site for cometchat.com/docs. Content is **MDX** (~3,100 files). The site config is `docs.json`. There is **no app to build** — `package.json` is a stub.

## ⚠️ Never read these files whole (they will blow up the context)

Query them with `python3`/`grep`, never `Read` in full:

| File | What it is | How to inspect |
|------|------------|----------------|
| `docs.json` (431 KB) | Mintlify nav/config | `python3 -c "import json; d=json.load(open('docs.json')); ..."` — read `navigation.products`, `redirects` by slice |
| `chat-apis.json` (590 KB) | OpenAPI spec | grep for the path/operation you need |
| `management-apis.json` (527 KB) | OpenAPI spec | grep |
| `ai-agent-service.json` (578 KB) | OpenAPI spec | grep |
| `data-import-apis.json` (128 KB) | OpenAPI spec | grep |

When editing one MDX page, read **only that page** — do not pre-load sibling files.

**When you must edit an OpenAPI spec** (REST API content changes): never read it whole. Find the operation with `grep -n '"/the/path"'` or `python3 -c "import json; d=json.load(open('chat-apis.json')); print(json.dumps(d['paths']['/x'], indent=2))"`, then make a targeted `Edit` on the located lines (or rewrite a single path object via python). Validate after: `python3 -c "import json; json.load(open('chat-apis.json'))"`.

## Where content lives

| Dir | Contents | MDX count |
|-----|----------|-----------|
| `ui-kit/` | UI Kit docs (react, react-native, angular, ios, android, flutter) | ~1,200 |
| `sdk/` | SDK docs, versioned (e.g. `sdk/android/2.0/`) | ~886 |
| `rest-api/` | REST API reference | ~404 |
| `calls/` | Voice & video calling | ~207 |
| `fundamentals/` | Core concepts, AI user copilot | ~48 |
| `notifications/`, `moderation/`, `ai-agents/`, `chat-builder/`, `widget/`, `on-premise-deployment/` | Product areas | — |
| `snippets/` | Reusable MDX snippets (`<Snippet>`) | — |
| `images/`, `assets/` | Media (2,800+ images — never list this dir whole) | — |

Ignore for content work: `node_modules/`, `.venv/`, `doc-auditor/`, `docs-comparison-tool/`, `docs-test-suite/`, `html-exports/`, `html-files/`, `web-shared/`, `web-elements/` (these are git-ignored from publish via `.mintignore`).

## MDX page format

Frontmatter differs by page type:

**Content pages** (`ui-kit/`, `sdk/`, `calls/`, `fundamentals/`, …) — quoted `title` + `description`:

```mdx
---
title: "Conversation Starter"
description: "One sentence, under 160 chars, technical not promotional."
---

Body starts here. First paragraph, then `## Section` headings.
```
- Optional: `sidebarTitle` (when the sidebar label should differ from the title); landing pages add `mode: "custom"` + `canonical`.

**REST API pages** (`rest-api/`) — these auto-generate from the OpenAPI specs. Frontmatter is `openapi` + `description` only:

```mdx
---
openapi: post /ai-agents/agent-builder/agents
description: "..."
---

Static context here — Mintlify renders MDX body BETWEEN the endpoint header and the
auto-generated params. There is NO way to add content AFTER the API docs.
```
Section order in the body when present: `## Constraints` → `## Common errors` (table) → `## Related` (`<CardGroup>`).

- ATX headings with a space after `#`. Body sections typically start at `##`.
- Internal links are **relative, root-absolute paths without extension**: `/fundamentals/ai-user-copilot/overview` (not `.mdx`, not a full URL).
- Code blocks: always include a language id (```` ```javascript ````). Mintlify components available: `<Tabs>`, `<Tab>`, `<CodeGroup>`, `<Card>`, `<CardGroup>`, `<Note>`, `<Warning>`, `<Steps>`, `<Frame>`, `<Snippet>`.

## Images & assets

- New images go under `images/` (screenshots, diagrams) or `assets/`. Reference with a **root-absolute path**: `/images/conversations-context.png` — never a relative `./` path.
- Naming: lowercase with hyphens, descriptive, `component-or-page-context.png` (e.g. `message-composer-attachments.png`).
- Always wrap screenshots in `<Frame>` with meaningful `alt` text — never a bare `![](…)`:
  ```mdx
  <Frame>
    <img src="/images/conversations-context.png" alt="Conversations list showing recent chats" />
  </Frame>
  ```
- `images/` has 2,800+ files — never list it whole. Check existence with `git ls-files 'images/<name>*'` or `ls images/<path>`.

## Navigation (docs.json)

A new page is **not visible until it's added to `docs.json`** under `navigation.products[].tabs[]…groups…pages`. `pages` entries are page paths without extension. There are 8 products and 784 redirects.

**Moving or renaming a page** — always do all three, or live URLs 404 (use `/move-doc` to do it in one step):
1. Move/rename the `.mdx` file.
2. Update its path in `navigation` (`docs.json`).
3. Add a `{ "source": "/old-path", "destination": "/new-path" }` entry to `redirects` in `docs.json`.

## Versioning (SDK / UI Kit)

SDK and UI Kit docs are versioned by directory (e.g. `sdk/android/2.0/`, `sdk/android/3.0/`). To add a new version:
1. Create the new version directory and author/copy its pages.
2. In `docs.json`, add a nav group for it; keep **only the latest version as the default**, and move older versions under a collapsible **"Previous Versions"** group.
3. Add redirects from any unversioned/old paths that should now point at the new version.

## Style & doc standards

Present tense, active voice, clear and concise. Match the existing surrounding page's structure. (Prose guide: `CONTRIBUTING.md`.)

The detailed CometChat doc standards live in two tracked skills — load them when authoring or reviewing pages:
- **`.claude/skills/docs-reviewer/`** — official page templates: section ordering (Component/Overview/Integration/Landing), AI Agent Component Spec, required table column formats, banned marketing phrases, per-platform type/import/memory conventions, glossary linking, nav rules. Includes `rest-api.md` for REST pages.
- **`.claude/skills/dual-audience-auditor/`** — content quality for humans + AI agents (RAG): heading hierarchy, self-contained chunking, terminology normalization, "why before how", agentic-readiness score.

Run both over a page with the `/audit-doc <path>` command.

## Local preview & checks

```bash
npx mint dev            # local preview at http://localhost:3000
npx mint broken-links   # validate internal links before opening a PR
```

## Git / PRs

- Branch naming (enforced by CI — see `.github/branch-naming-convention.md`):
  internal docs work → `docs/<section-name>`; fixes → `fix/<desc>`; chores → `chore/<desc>`.
  Never commit directly to `main`; branch first.
- PR template lives at `.github/PULL_REQUEST_TEMPLATE.md` — fill type + checklist.
- Commit/PR only when asked.

## Formatting (.prettierrc / .editorconfig)

2-space indent, LF, double quotes, no trailing comma. `.mdx`/`.md` keep trailing whitespace; everything else trims it.
