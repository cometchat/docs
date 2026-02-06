# React UI Kit v6 Documentation Guidelines (Overview)

These guidelines are for **React UI Kit v6** docs only (the pages under `ui-kit/react/` **excluding** `ui-kit/react/v2`, `v3`, `v4`, `v5`). Do not copy structure, imports, or terminology from older-version folders unless you are explicitly writing a migration/upgrade page.

## What the React UI Kit v6 docs cover

The React UI Kit v6 is a set of **prebuilt React UI components** built on top of the **CometChat JavaScript Chat SDK**, plus optional add-ons (e.g., Calls SDK) and platform integrations (React, Next.js, React Router, Astro).

The v6 docs set is organized into page types:

- **Product overview**: `ui-kit/react/overview.mdx`
- **Getting started / framework setup**: `ui-kit/react/react-js-integration.mdx`, `next-js-integration.mdx`, `react-router-integration.mdx`, `astro-integration.mdx`
- **Chat experience integrations**: `react-conversation.mdx`, `react-one-to-one-chat.mdx`, `react-tab-based-chat.mdx` (+ framework variants)
- **Feature overviews**: `core-features.mdx`, `call-features.mdx`, `ai-features.mdx`, `extensions.mdx`
- **Theming + localization + sound**: `theme.mdx`, `localize.mdx`, `sound-manager.mdx` (+ pages under `ui-kit/react/theme/`)
- **Component reference**: `conversations.mdx`, `message-list.mdx`, `message-composer.mdx`, etc.
- **API reference**: `methods.mdx`, `events.mdx`
- **Task guides**: `guide-*.mdx`, `*-formatter-guide.mdx`
- **Upgrade/migration**: `upgrading-from-v5.mdx`, `property-changes.mdx`

## AI-first writing rules (non-negotiable)

Write so an AI agent (and a developer) can implement without guessing.

- **Always specify the end state** in the first paragraph (what the reader will have working).
- **Use concrete file paths and filenames** for every code block (example: `src/App.tsx`, `app/providers/CometChatProvider.tsx`).
- **Make code blocks copy/paste runnable**:
  - Include all imports used in the snippet.
  - Avoid `...` placeholders; if you must omit, explicitly list what was omitted and why.
  - Keep placeholder values centralized and enumerated (e.g., `APP_ID`, `REGION`, `AUTH_KEY`).
- **Declare assumptions** (project type, router, TypeScript vs JavaScript, SSR vs CSR) before steps begin.
- **One “happy path” first**, then label variations as **Optional** / **Advanced**.
- **Every page ends with “Next steps”**: 3–6 internal links that help the reader continue.

## Version + package rules (v6)

- Treat `@cometchat/chat-uikit-react` as the **default import source** for UI Kit v6 APIs and components.
- Use `@cometchat/chat-sdk-javascript` when you need Chat SDK types/objects (`CometChat.User`, `CometChat.Group`, requests, etc.).
- Use `@cometchat/calls-sdk-javascript` only on call-related pages and explicitly call it out in prerequisites/installation.
- Do **not** introduce older package names (examples: `@cometchat/uikit-react`, `@cometchat/uikit-elements`, `@cometchat/uikit-resources`) unless you have verified they are required for v6 and you explain why.

If an import is unclear, the doc should say “Verify this export exists in v6” and link to the UI Kit source or API reference page.

## MDX conventions for this repo

- **Frontmatter**: every published page must include at least:
  - `title`
  - `sidebarTitle` only when needed for navigation clarity
- **Headings**: use ATX headings (`## Heading`) and keep them descriptive.
- **Separators**: use `***` between major sections (matches existing v6 pages).
- **UI components available in docs** (use consistently):
  - Media: `<Frame>...</Frame>`
  - Multi-file examples: `<Tabs>` + `<Tab title="...">`
  - Callouts: `<Info>`, `<Note>`, `<Warning>`, `<Tip>`
  - Navigation cards: `<CardGroup>` + `<Card ... />`

## Links, images, and examples

- **Internal links**: prefer root-relative doc links like `/ui-kit/react/react-js-integration` (stable even when a file moves).
- **External links**: use only when they add unique value (dashboard, GitHub, Figma, CodeSandbox).
- **Images**:
  - Use `<Frame>` for screenshots/diagrams.
  - Add a one-sentence caption directly below the image explaining what to look for.
- **CodeSandbox/Live demo**:
  - Include a single “Try it” link near the top of pages where it helps validation.
  - Instruct the reader exactly what to change (credentials) and what to expect.

## Terminology (keep consistent)

- Product: “**CometChat UI Kit for React**” on first mention, then “**UI Kit**”.
- Underlying library: “**CometChat JavaScript Chat SDK**” or “**Chat SDK**”.
- Credentials: “**App ID**”, “**Region**”, “**Auth Key**” (dev/POC), “**Auth Token**” (production).
- Layouts: “Conversation List + Message View”, “One-to-One/Group Chat”, “Tab-Based Chat”.

## Quality checklist (use before PR)

- Links point to **v6 pages** (no accidental `/ui-kit/react/v5/...` unless it’s a migration context).
- Imports match **v6 packages** and compile as written.
- Steps have no missing prerequisites (init/login/theme import are called out clearly).
- The page answers: **what to do**, **where to do it**, **why it matters**, and **what to do next**.

## Next guideline files

- `ui-kit/react/_docs-guidelines-v6/getting-started.md`
- `ui-kit/react/_docs-guidelines-v6/integration.md`
- `ui-kit/react/_docs-guidelines-v6/other-pages-structure.md`

