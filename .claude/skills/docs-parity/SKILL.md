---
name: docs-parity
description: "Compare a docs PR's changed pages against the same feature's pages on every other platform, as merged on main. Reports API-surface, behaviour, version, structure and image divergence so the author can see where their platform is out of step. Advisory only — never blocks. Use on any PR touching ui-kit/**/*.mdx or images/**, and locally before opening one."
license: "MIT"
compatibility: "Python 3.9+ (system python3). Repo: cometchat/docs. No network, no gh, no PyYAML."
metadata:
  author: "CometChat"
  version: "1.0.0"
  tags: "cometchat docs parity cross-platform mdx drift review pr"
---

# Cross-Platform Docs Parity

## Purpose

All eight platforms' docs live in this one repo. Nothing compares them, so each drifts
independently and the drift is found by hand, late. Documenting pin/save and thread
subscription across platforms cost a month of rework for exactly this reason.

This skill answers one question for a set of changed pages:

> Where does this platform's documentation of feature X disagree with every other
> platform's documentation of feature X?

It does **not** decide who is right. A contradiction between two docs is the finding.

## When to use

- Locally, while writing, before committing or opening a PR — the main use.
- On any PR touching `ui-kit/**/*.mdx` or `images/**` (CI runs it automatically).
- When adding a feature page for a platform that already has siblings.

## Running it

```bash
python3 .claude/skills/docs-parity/compare.py            # uncommitted edits vs merged siblings
python3 .claude/skills/docs-parity/compare.py --pr 519   # what CI will say, locally
python3 .claude/skills/docs-parity/compare.py --markdown --sha "$(git rev-parse HEAD)"
```

No network, no `gh`, no PR need exist. Requires only that `origin/main` is fetched.

## What it compares against

**Sibling pages as merged on `origin/main`. Nothing else.** It reads no unmerged branch and
no other PR. This is deliberate:

- **Deterministic** — the report is a function of (your pages, `main`). Someone else pushing
  cannot change it.
- **No trust surface** — never reads fork PR heads, needs no extra token scope.
- **Explainable** — "we compare you against what is merged" is predictable.

The cost: during a concurrent burst (four platforms landed pin/save inside 48 hours) a sibling
on `main` may be mid-correction, so a finding can be stale on arrival. That is a **human**
coordination problem. Reviewers on simultaneous platform PRs still need to talk to each other.
Do not add cross-PR reading to "fix" this.

## The feature map

`parity-baseline.yml` declares which paths are the same page across platforms, because the
conventions differ and cannot be inferred (`ui-kit/ios/pinned-messages.mdx` vs
`ui-kit/react/components/pinned-messages.mdx` vs
`ui-kit/angular/components/cometchat-pinned-messages.mdx`).

Three keys per feature:

| Key | Meaning |
|---|---|
| `pages` | This platform's page for the feature. |
| `sections` | Platform documents it as a *section* of another page (`<path>#<anchor>`). iOS deleted its standalone thread-subscription guide (`84c9e7df`) and redirected; without this it would be reported missing forever. |
| `accepted-gaps` | Genuinely absent and known. Suppressed from the body, named in one footer line. |

**Editing an accepted-gap entry is how a gap gets closed.** Delete the line and the next run
starts reporting it. The file is the team's written record of intentional divergence.

## The five axes

Ordered by how much damage each class actually caused.

**1. API surface.** Symbols documented here and nowhere else (`enableThreadSubscription` was
"invented wholesale" on the iOS pinned-messages page and did not exist), or on every sibling
but not here. Reported with line numbers as *suspicions to verify against source* — the skill
never asserts a symbol is fictional, it says who disagrees.

The extractor is filtered to **behavioural** surface. Literals (`true`, `nil`) and visual-style
properties (anything ending `Color`, `Font`, `Style`, `Tint`, …) are dropped: platforms name
colours differently by design, and comparing them buries the real findings. On the iOS pinned
page this cuts 21 raw tokens to 6 real ones.

**2. Core behaviour.** Default state, permission gating, whether destructive actions confirm,
scope limits. Angular says "Unpin and Unsave ask first"; iOS is immediate and optimistic.

**3. Version claims.** A page citing a version no sibling mentions — how the never-published
`4.1.14-beta-1` survived three weeks.

**4. Structure.** Sections present on most platforms and absent here. Deliberately low-weight:
flag a *missing section*, never a different table shape. iOS's per-prop tables and React
Native's four-column table are both legitimate house styles.

**5. Images.** A feature with screenshots on some platforms and none on others, and — loudly —
**the same `/images/x.png` referenced by two platforms**. Android and RN were about to share one
byte-identical pair for two platforms' chrome; `06b3f375` avoided it by filing iOS's separately.

## Skip rule

If no sibling page exists on `main`, there is nothing to compare and the feature is skipped —
but still named in the report. An author who learns they are first should know it: everyone
else will copy their structure.

## Output

A sticky PR comment keyed by `<!-- docs-parity: report sha=... -->`, replaced on each push.
The verdict word is always `report`, never pass/fail — there is no correct state to enforce,
only divergence to surface. CI posts a `success` status unconditionally.

## Anti-patterns

| Don't | Why |
|---|---|
| Flag a different table shape or heading style | House style, not drift. Only missing *sections* count. |
| Report an accepted gap | It's in the baseline because it's known. Noise buries real findings. |
| Assert a symbol doesn't exist | The skill can't see platform source. Say who disagrees, ask the author to verify. |
| Trust a path to tell you a page is current | `guide-thread-subscription.mdx` is dead on iOS (redirected) and live on Android/Angular. |
| Add cross-PR or unmerged-branch reading | Breaks determinism and adds a fork-PR trust surface. The staleness it solves is a human problem. |
| Make the check blocking | It is advisory by design. Not in branch protection; `exit 1` never. |
| Truncate a symbol list silently | Alphabetical truncation hides findings. Always name the overflow count. |
