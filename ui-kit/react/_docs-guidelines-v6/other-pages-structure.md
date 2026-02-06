# React UI Kit v6 Documentation Guidelines (Other pages + structure)

This file defines structure for all v6 React UI Kit pages that are **not** Overview / Getting Started / Integration.

## 1) Feature overview pages

Examples: `core-features.mdx`, `call-features.mdx`, `ai-features.mdx`, `extensions.mdx`

### Required sections

- **What you get**: bullet list of capabilities (1 screen of content max)
- **How it works**: 1–2 short paragraphs mapping features to UI Kit components/APIs
- **Enable/Configure**: the minimum steps required (SDK install, flags, extensions)
- **Example(s)**: 1–2 short, runnable snippets (not full apps)
- **Next steps**: link to the most relevant component pages + guides

### Rules

- Don’t duplicate Getting Started; link to it.
- If an extra dependency is needed (Calls SDK), declare it early and show install steps.

## 2) Theming / Localization / Sound pages

Examples: `theme.mdx`, `localize.mdx`, `sound-manager.mdx`, `ui-kit/react/theme/*`

### Required sections

- **Baseline import** (what CSS file to import and where)
- **Common customizations** (global variables + component-scoped variables)
- **Dark mode strategy** (how to switch + where variables live)
- **Pitfalls** (class selector mismatch, not scoping overrides, SSR constraints)
- **Reference** (link to variable list / resource files)

### Rules

- Prefer CSS variables over deep selectors.
- If you show JS-driven theming (`document.documentElement.style.setProperty`), also mention CSS-only alternatives.

## 3) Component reference pages

Examples: `users.mdx`, `groups.mdx`, `message-list.mdx`, `message-composer.mdx`, `search.mdx`

### Required sections (recommended order)

1. **Overview**
   - 2–3 sentences describing what the component does
   - A screenshot (`<Frame>`)
2. **Basic usage**
   - Minimal working snippet showing the component mounted
   - Explicit prerequisites: UI Kit init + logged-in user
3. **Props / configuration**
   - Document the most-used props first
   - Use tables for complex option objects/builders
4. **Actions**
   - Define each action in one sentence
   - Provide a short snippet showing how to override it
5. **Events**
   - Only if the component emits/consumes events that matter for integration
6. **Styling**
   - Which CSS variables affect it + minimal overrides
7. **Troubleshooting**
   - Common mistakes and fixes
8. **Next steps**
   - Link to related components, guides, and features

### Rules

- Avoid long, repeated snippets; link to shared setup once.
- When a prop expects a `User`/`Group` object, say so explicitly (and show how to fetch/build it).

## 4) API reference pages (Methods / Events)

Examples: `methods.mdx`, `events.mdx`

### Required format per method/event

- **What it does** (1 sentence)
- **Signature** (TS signature if available)
- **Parameters** table
- **Returns** (type + meaning)
- **Errors** / failure modes
- **Example** (short, runnable snippet)
- **Related links** (components/features that use it)

### Rules

- Keep imports consistent with v6 packages.
- Avoid mixing v5/v4 APIs; if you must mention, put it in a clearly labeled migration callout.

## 5) Task-oriented guides

Examples: `guide-*.mdx`, `*-formatter-guide.mdx`, `custom-text-formatter-guide.mdx`

### Required sections

- **Goal**: what the user will achieve
- **When to use**: the product UX scenario
- **Prerequisites**: which integration is assumed + which UI Kit components are used
- **Steps**: numbered, file-based steps
- **Result**: what should happen in the UI
- **Next steps**: link to adjacent guides or APIs

### Rules

- Keep the guide narrow. If it needs 4+ unrelated concepts, split it.
- Show exactly where customization hooks are attached (props, overrides, formatters, listeners).

## 6) Upgrade / migration pages

Examples: `upgrading-from-v5.mdx`, `property-changes.mdx`

### Required sections

- **What changed** (table: v5 vs v6)
- **Who is impacted** (which apps / which features)
- **Step-by-step migration**
  - “Before” + “After” snippets (keep them short)
  - Clear mapping of renamed/removed props/methods
- **Validation**: how to confirm migration worked
- **Links**: reference docs + changelog

### Rules

- Do not rewrite entire v5 docs; link to them where needed.
- Always include explicit version language (“v5”, “v6”) in headings.

## 7) Structure + navigation rules (v6)

- New v6 pages belong directly under `ui-kit/react/` (not inside `v5/`).
- Use file names that match the URL slug and the navigation label.
- Prefer **one page = one purpose**:
  - “Getting Started” initializes and logs in.
  - “Integration” builds a specific layout.
  - “Component reference” documents a single component and its APIs.

## Final doc QA checklist

- Internal links resolve to v6 pages and do not point at `ui-kit/react/moved/*` unless explicitly intended.
- Code compiles with the listed imports and uses consistent package names.
- The page has a clear end state and a Next steps section.

