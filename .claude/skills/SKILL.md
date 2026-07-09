---
name: review-docs-pr
description: "Review a documentation pull request on a Mintlify docs site (default repo cometchat/docs) for the issues that actually break docs: missing redirects after moves/renames (404s on live URLs), navigation refs that break the build, broken in-content links, and content-integrity problems (contradictory or ambiguous prose, conflicting code examples, stale or missing screenshots). Use this skill whenever the user asks to review, check, audit, or QA a docs PR, a docs.json/mint.json reorganization, a documentation restructure or consolidation, a version promotion (e.g. making v7 the default), or asks 'will this PR break links / the build / SEO'. Reports findings in chat by default and does NOT post GitHub comments unless explicitly asked. Trigger on phrases like 'review docs PR', 'review this docs pull request', 'check the docs PR', 'docs reorg review', 'did we add redirects', 'will this 404'."
---

# Docs PR Reviewer (Mintlify)

You review a documentation PR and report **what will break for readers**, ranked by severity. The
biggest risks in docs PRs — especially reorganizations, consolidations, and version promotions —
are silent: moved files that 404, navigation that breaks the build, broken cross-links, and merged
pages that now contradict themselves. This skill makes the mechanical checks deterministic (a
script) and reserves your judgment for content quality.

**Default behavior: report all findings in chat. Do NOT post GitHub comments or reviews unless the
user explicitly asks you to.** The user decides what to act on.

## Inputs

- PR number (required). Repo defaults to `cometchat/docs`; override if the user names another.
- The Mintlify config is `docs.json` at repo root (older sites use `mint.json` — auto-detect).
- Every `.mdx`/`.md` file maps 1:1 to a public URL: the repo-relative path minus extension. Mintlify
  does **not** auto-redirect moved/renamed/deleted files — a broken URL must be caught by an explicit
  entry in the `redirects` array of the config.

## Procedure

Run these in order. Steps 2–4 are the script; steps 1, 5, 6 are your reading.

### 1. Scope & checkout
- Pull PR metadata and the file list with status. The unified diff for a reorg routinely exceeds
  GitHub's 20k-line API limit, so **do not** rely on `gh pr diff`. Instead:
  ```bash
  gh pr view <PR> --repo <repo> --json title,author,baseRefName,headRefName,additions,deletions,changedFiles,body
  HEAD=$(gh pr view <PR> --repo <repo> --json headRefName --jq .headRefName)
  git clone --quiet --depth 1 --branch "$HEAD" https://github.com/<repo>.git /tmp/docpr_<PR>
  ```
- Note the change shape (added / modified / removed / renamed counts). A high removed+renamed count
  means redirect coverage is the headline risk.

### 2–4. Deterministic checks (run the script)
```bash
python3 ~/.claude/skills/review-docs-pr/scripts/analyze_docs_pr.py \
  --pr <PR> --repo <repo> --clone /tmp/docpr_<PR> --scope <product-prefix>/
```
`--scope` limits link-rot and orphan scanning to the PR's area (e.g. `ui-kit/react/`); omit to scan
the whole repo. Use `--config mint.json` if the site uses that. The script reports:

- **[2a] Redirect coverage** — every removed/renamed old URL with no redirect (these 404). Renames
  count: the *old* path dies too. A `+0` redirect delta on a move-heavy PR is a red flag.
- **[2b] Chained 404s** — existing redirects whose destination this PR deletes.
- **[3a] Navigation integrity** — `pages` refs in the config that don't resolve. **Any miss breaks
  the Mintlify build** — treat as P0.
- **[3b] Orphans** — in-scope current-version files absent from navigation (unreachable pages).
- **[4] In-content link rot** — internal links inside changed pages that don't resolve, with
  file → target. Common after consolidation: links left pointing at pre-move paths or wrong slugs.

Spot-check a few script findings by hand before reporting, but the checks are designed for near-zero
false positives.

### 5. Content integrity (read the content — this is judgment, not grep)
The #1 risk in **consolidation** PRs (several source pages merged into one) is content that now
contradicts itself or misleads. For the added/heavily-modified pages, read for:

- **Contradictions** — the same fact stated two ways: conflicting default values, prop/method names,
  package names, required-vs-optional, or stale version claims ("v6 is the latest") left over after a
  promotion. Check *within* each merged page, not just across pages.
- **Version / package drift** — grep install snippets and prose for version pins (`@6`, `@7`, `v6`,
  `v7`, `x.y.z`). Flag any page mixing versions, or an install command that disagrees with the
  documented default version.
- **Code examples** — imports/package names match the documented SDK; APIs/props match the current
  version (cross-check any "prop audit" in the PR); code blocks within a page are mutually consistent
  and runnable; no leftover snippets calling removed/renamed APIs; **prose and code agree**.
- **Ambiguity & placeholders** — vague or unresolved instructions, `TODO`/`FIXME`/"coming soon"/lorem/
  copy-paste leftovers, and in-prose cross-references ("see the section above/below", "as mentioned
  earlier") that no longer resolve after pages were split or merged.
- **Screenshots / images** — every image ref (`![](...)`, `<img src>`, `<Frame>`) resolves to a file
  that exists on the branch; flag stale screenshots showing an older version/UI than the page now
  documents, version numbers/badges baked into images, and missing alt text.

Useful greps (run inside the clone, scoped to the product area):
```bash
grep -rnE '@cometchat/[a-z-]+@[0-9]|/v[0-9]+\b|version [0-9]' <scope>     # version drift
grep -rniE 'TODO|FIXME|coming soon|lorem|tbd|placeholder' <scope>         # placeholders
grep -rnoE '\!\[[^]]*\]\(([^)]+)\)|src=["'\''"][^"'\'']+' <scope>          # image refs to resolve
```

### 6. Structural coherence
If the PR changes the default version or promotes a version tree: confirm old-version content is
preserved where expected (e.g. v6 still lives under `/<product>/v6/`), and that the default flip is
consistent across navigation **and** redirects (stale `…/vN/:slug*` wildcards from the previous
default often need updating).

## Severity framework

- **P0 — blocker:** build breaks (unresolved nav refs); mass 404s on live/indexed URLs from missing
  redirects; content that is flatly wrong or self-contradictory in a way that misleads integration.
- **P1 — should-fix before merge:** chained-404 redirects; broken in-content links; version/package
  drift; broken or missing images; orphaned pages.
- **P2 / nit:** ambiguity, missing alt text, cosmetic nav cruft, style inconsistencies.

## Output

Report in chat, grouped by severity, each finding with exact path/URL and `file:line`. Lead with a
one-paragraph TL;DR and a clear verdict (**approve** / **request changes**). List what passed too
(e.g. "build is safe: 0 dangling nav refs") so the user knows it was actually checked.

Then **offer** to generate the concrete fixes — the full `redirects` JSON block (old→new for every
404, asking for a target on many→one consolidations), and the exact link/content edits — but do not
apply or commit anything, and do not post to GitHub, unless the user says so.

## Notes
- The script needs `gh` authenticated and a local checkout of the PR HEAD branch.
- Renamed files: the script treats the *previous* filename as a dead URL needing a redirect, which is
  correct — Mintlify won't follow the move.
- If the repo uses `mint.json` instead of `docs.json`, pass `--config mint.json` and adjust greps.
