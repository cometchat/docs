# React UI Kit v6 Documentation Guidelines (Getting Started pages)

Use this template for framework setup pages like:

- `ui-kit/react/react-js-integration.mdx` (React)
- `ui-kit/react/next-js-integration.mdx` (Next.js)
- `ui-kit/react/react-router-integration.mdx` (React Router)
- `ui-kit/react/astro-integration.mdx` (Astro)

## Goal of a Getting Started page

By the end, the reader should have:

1. A new project created for the target framework
2. `@cometchat/chat-uikit-react` installed
3. UI Kit initialized (`CometChatUIKit.init(...)`)
4. A user logged in (Auth Key for POC or Auth Token for production)
5. A working screen that links to one of the chat experiences (Conversation + Messages, One-to-One, Tab-based)

## Required sections (in this order)

### 1) Intro (2–4 sentences)

- What the UI Kit is
- What the reader will build on this page
- A link to the **framework-specific** chat experience pages they can follow next

### 2) Prerequisites

Must include:

- CometChat app created in Dashboard
- Credentials list: App ID, Region, Auth Key (optional), Auth Token (recommended)
- Runtime requirements: Node.js + package manager
- Framework requirements:
  - React: Vite or CRA
  - Next.js: App Router vs Pages Router (state which is used)
  - React Router: whether SSR is enabled by default in the chosen template
  - Astro: whether React is used via integration + hydration mode

### 3) Install

Must include:

- `npm` + `yarn` tabs (or `pnpm` if the ecosystem expects it)
- A single canonical package name: `@cometchat/chat-uikit-react`
- If the page requires additional packages (Calls SDK, etc.), include them here and explain why

### 4) Import styles (theming baseline)

The page must say (explicitly) that UI Kit styles come from the CSS variables file and where to import it:

- Global import option (recommended)
- If framework has constraints (Next.js global CSS import rules), document the correct location

Also include a **failure symptom**: “If you skip this step, the UI may render unstyled / broken.”

### 5) Initialize the UI Kit (required)

Rules:

- Show a full snippet with:
  - `CometChatUIKit`
  - `UIKitSettingsBuilder`
  - `setAppId`, `setRegion`
  - `setAuthKey` (only when demonstrating Auth Key flow)
  - `subscribePresenceForAllUsers` (or whichever presence setting is recommended)
  - A `.catch(...)` that prints errors
- Add a `<Note>` that **Auth Key is POC/dev only**, and link to Auth Token login
- State clearly: initialize **exactly once** on app start

### 6) Authenticate a user

Include both flows:

- **POC**: `CometChatUIKit.login(UID)`
- **Production**: `CometChatUIKit.loginWithAuthToken(AUTH_TOKEN)` (and explain server-side generation/storage at a high level)

Also include:

- How to avoid double-login by calling `getLoggedinUser()` first
- Example test UIDs (if they exist) or how to create a user

### 7) Verify it works

Include the exact commands and expected output:

- Start dev server (`npm run dev`, `npm start`, etc.)
- What the reader should see (even one sentence is enough)
- A “common failure” list (wrong region, not initialized, missing CSS import)

### 8) Next steps

Link to:

- `/ui-kit/react/react-conversation`
- `/ui-kit/react/react-one-to-one-chat`
- `/ui-kit/react/react-tab-based-chat`
- `/ui-kit/react/theme`
- `/ui-kit/react/methods`

Framework variants should link to their equivalents (e.g., `next-conversation`, `react-router-conversation`, `astro-conversation`).

## Framework-specific guidance (must call out)

### Next.js

- UI Kit uses browser APIs; ensure all UI Kit usage is **client-side**.
- If using App Router, say where `use client` is required (e.g., the component that calls init/login and renders UI Kit components).
- Mention SSR pitfalls succinctly: “Don’t run `CometChatUIKit.init` on the server.”

### React Router / SSR templates

- If the recommended starter renders on the server by default, add an explicit “Disable SSR for the chat route” section.
- Explain why in one paragraph (window/document/WebSockets usage).

### Astro

- State the chosen hydration directive (example: `client:only="react"` vs `client:load`) and why.
- Keep steps minimal and specific.

## Code example rules

- Prefer **TypeScript first**, then JavaScript if it adds value.
- Every multi-file example must use `<Tabs>` with tab titles that are **filenames**.
- Avoid repeating the same 100+ lines across framework pages—link to the base React page and document only the deltas.

## Recommended Getting Started page template (MDX skeleton)

```mdx
---
title: "Getting Started With CometChat React UI Kit"
sidebarTitle: "Integration"
---

<Intro paragraph(s) with end state + next links.>

***

## Prerequisites
<Bullets + credentials callout>

***

## Step 1: Create a project
<Framework-specific commands>

***

## Step 2: Install dependencies
<Tabs: npm/yarn>

***

## Step 3: Import UI Kit styles
<Show exact file + import>

***

## Step 4: Initialize CometChat UI Kit
<Init code + Auth Key vs Auth Token note>

***

## Step 5: Login a user
<getLoggedinUser + login/loginWithAuthToken>

***

## Verify
<Commands + expected UI>

***

## Next steps
<Links>
```

