# React UI Kit v6 Documentation Guidelines (Integration pages)

Use this structure for “build a chat experience” pages like:

- `ui-kit/react/react-conversation.mdx`
- `ui-kit/react/react-one-to-one-chat.mdx`
- `ui-kit/react/react-tab-based-chat.mdx`
- and their framework variants (`next-*`, `react-router-*`, `astro-*`)

## Goal of an Integration page

The reader starts from a project that already completed Getting Started (init + login), and ends with a **specific UI Kit layout working end-to-end**.

Each Integration page must answer four questions:

1. What experience are we building and when should I choose it?
2. What UI Kit components are involved?
3. What files do I create/change (exact paths)?
4. What do I run and what should I see?

## Required sections (in this order)

### 1) Intro + “Try it” link

Include:

- 2–3 sentences describing the layout + best-fit use cases
- A single CodeSandbox/live demo link (if available)
- A one-line note telling the reader what to change (credentials)

### 2) UI overview (visual)

- Screenshot inside `<Frame>`
- Short explanation of the major regions (sidebar, header, message list, composer, etc.)

### 3) Prerequisites (keep it short)

- Link back to the correct Getting Started page for the framework (v6)
- Mention required UI Kit styles import if the integration relies on them
- Mention any additional SDKs needed (Calls SDK for call pages, etc.)

### 4) Step-by-step implementation

Rules:

- Use numbered steps (`Step 1`, `Step 2`, …)
- Every step has:
  - a short “what/why”
  - explicit file tree or file paths
  - code blocks labeled with filenames
- Prefer small, composable files:
  - `src/components/ChatLayout/...`
  - `src/routes/chat/...`
  - `src/styles/cometchat.css`

### 5) Verify

- Commands to run
- What should render
- 3–6 common issues and their fixes (init/login missing, unstyled UI, SSR crashes, invalid region)

### 6) Next steps

Link to relevant follow-ons, typically:

- Theming: `/ui-kit/react/theme`
- Component reference: `/ui-kit/react/components-overview`
- Feature pages: `/ui-kit/react/core-features`, `/ui-kit/react/extensions`
- Guides: `/ui-kit/react/guide-overview`

## Implementation guidance (what to standardize)

### Prefer stable, explicit state flow

Integration pages often need state for:

- Selected conversation/user/group
- Route params (if deep-linking)
- Logged-in user session

Guideline:

- Keep state in one place (a parent layout component), then pass to UI Kit components via props.
- Avoid patterns that re-trigger effects unnecessarily (e.g., `useEffect(..., [loggedInUser])` when you set `loggedInUser` inside the effect).

### SSR/CSR notes must be correct

- React (Vite/CRA): no SSR section needed.
- Next.js / React Router SSR templates / Astro: explicitly call out client-only rendering requirements.
- If you add a “Disable SSR” step, state:
  - where it applies (which file/route)
  - why it is needed (browser APIs)

### Styling guidance

- Keep CSS overrides minimal and purposeful.
- Prefer theming via CSS variables over deep selector overrides.
- If you must include a long CSS file:
  - add a short list of “what this CSS changes”
  - isolate overrides under a wrapper class to avoid app-wide collisions

## Code example rules

- Use v6 package imports (`@cometchat/chat-uikit-react`).
- Ensure examples either:
  - assume init/login is already done (and say so), or
  - include a short “init/login snippet” and clearly mark it as shared setup.
- When you show multi-file implementations, keep the file list small and add a file tree.

## Recommended Integration page template (MDX skeleton)

```mdx
---
title: "Building <Experience Name>"
sidebarTitle: "<Nav label>"
---

<2–3 sentence intro>
[<Try it link>]

***

## User Interface Overview
<Frame screenshot>
<Brief region breakdown>

***

## Prerequisites
- Complete: <Getting Started link>
- Ensure: UI Kit initialized + user logged in

***

## Step-by-step Guide
### Step 1: <Create component>
<Folder structure>
<Tabs: TS/CSS>

### Step 2: <Wire into App>
<Tabs: App.tsx/App.css>

...

***

## Verify
<Commands + expected result>

***

## Next steps
<Links>
```

