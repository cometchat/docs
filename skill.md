---
name: cometchat
description: Add CometChat chat, voice and video calling to a web or mobile app. Use when the user asks to add chat, messaging, calling or push notifications with CometChat; to build a chat app or a clone of one; to migrate from Sendbird, Stream or Twilio Conversations; to upgrade a CometChat UI Kit; or to work with CometChat credentials, users, groups, webhooks or the REST API.
compatibility: Installing the skills needs a shell with Node.js 18+ (npx) in the user's project. The UI Kit skills cover React, Angular, React Native, iOS, Android and Flutter apps. The CometChat MCP server works in any agent that supports remote MCP servers.
metadata:
  author: CometChat
  version: "1.0"
---

# CometChat

CometChat provides chat, voice and video calling for web and mobile apps through UI Kits
(prebuilt components), SDKs (build your own UI) and a REST API (server side). Docs:
https://www.cometchat.com/docs

Follow these steps in order. Stop at the first one that works in your environment.

## Ground rules

- Work inside the user's existing app. Don't scaffold a separate demo project.
- Never create a new CometChat app or change anything in the user's CometChat account
  unless the user asks. Ask before any account change, and before deleting anything.
- Never invent App IDs, regions, keys or API names. Read them from the user's project,
  the CometChat MCP server, or the docs.
- The Auth Key is for development only. In production the user's server creates an
  auth token for each user, and the app logs in with that token.
- Keep credentials out of version control.

## 1. Install the CometChat Agent Skills (recommended)

If you can run shell commands in the user's project, run this in the app's folder
(in a monorepo, the app package, not the repo root):

```bash
npx @cometchat/skills add
```

The installer detects the platform, installs that platform's skills for Claude Code,
and connects the CometChat MCP server (`--no-mcp` skips that). For another agent, pass
`--ide`: `cursor`, `codex`, `copilot`, `windsurf`, `gemini`, `kiro`, `cline`,
`continue`, `antigravity`, `replit` or `aider`, or `--ide all`.

Then reload the skills (restart the agent if it doesn't pick them up) and follow the
`cometchat` skill. It plans the work with the user, shows which files it will create or
change, and writes the code once the user approves.

| The user's project | Install | Then ask |
| --- | --- | --- |
| React (Vite, Next.js, React Router, Astro, Create React App) | `npx @cometchat/skills add` | `add chat to my app` |
| Angular | `npx @cometchat/skills add` | `add chat to my app` |
| React Native (bare or Expo) | `npx @cometchat/skills add` | `add chat to my app` |
| iOS (Swift) | `npx @cometchat/skills add` | `add chat to my app` |
| Android (Jetpack Compose or Kotlin Views) | `npx @cometchat/skills add` | `add chat to my app` |
| Flutter | `npx @cometchat/skills add` | `add chat to my app` |
| Calling only, no UI Kit | `npx @cometchat/skills add --family <js-calls, react-native-calls, ios-calls, android-calls or flutter-calls>` | `add voice and video calling to my app` |
| Android chat with its own UI (Chat SDK v5) | `npx @cometchat/skills add --family android-sdk` | `build chat with my own UI using the CometChat Android SDK` |

The skills build with the current UI Kits: React v7, Angular v5, React Native v5,
iOS v5, Android v6 and Flutter v6.

- **No app in the folder yet**, or the installer can't tell the platform (for example
  at a monorepo root): create the app or `cd` into it first, or name the platform with
  `--family react|angular|react-native|ios|android|flutter`.
- **The app uses an older UI Kit**: ask `upgrade my CometChat <platform> UI Kit from vX to vY`.
  The migration skill upgrades it. Adding chat on an older UI Kit stops with a version
  conflict until it's upgraded.
- **The app uses Sendbird, Stream Chat or Twilio Conversations**: ask
  `migrate my app to CometChat`.
- **A whole app or a clone**: ask `build a <app name> clone` or describe the app.
- **Check the setup**: `npx @cometchat/skills doctor` checks Node.js, the platform, the
  MCP server in each agent's config, and whether its docs and account tools answer.

Full guide: https://www.cometchat.com/docs/agent-skills

## 2. Connect the CometChat MCP server

Use this if the installer didn't connect it, or if you can't run `npx` at all.

- URL: `https://mcp.cometchat.com/mcp` (remote, HTTP)
- Claude Code: `claude mcp add --transport http cometchat https://mcp.cometchat.com/mcp`
- Other agents: add the URL as a remote MCP server in the agent's MCP settings.
  Steps for Claude, Cursor, Windsurf, VS Code and Lovable:
  https://www.cometchat.com/docs/mcp-server#connect-from-your-agent

The docs tools work without signing in: `search_cometchat_docs`,
`fetch_cometchat_doc_page`, `list_cometchat_bundles` and
`get_cometchat_implementation_bundle` (ready-made recipes per platform). Read the
`cometchat://skills/overview` resource first.

The account tools (`cometchat_*`) act on the user's CometChat account after the user
signs in. The first call opens the sign-in page in their browser. To get credentials:
`cometchat_whoami`, then `cometchat_list_apps`, ask the user which existing app to use,
then `cometchat_get_app_credentials`. Write the values into the project's env or config
file; don't echo them back. If the user can't sign in, ask them to copy the credentials
from the dashboard instead.

Full guide: https://www.cometchat.com/docs/mcp-server

## 3. Without skills or MCP: read the docs directly

- Index of every page: https://www.cometchat.com/docs/llms.txt
- Every page is available as Markdown: add `.md` to its URL, for example
  https://www.cometchat.com/docs/ui-kit/react/overview.md

Start from the overview for the user's platform:

| Building | Start here |
| --- | --- |
| A chat UI with prebuilt components | `/ui-kit/react/overview`, `/ui-kit/angular/overview`, `/ui-kit/react-native/overview`, `/ui-kit/ios/overview`, `/ui-kit/android/overview`, `/ui-kit/flutter/overview` |
| Chat with your own UI | `/sdk/javascript/overview`, `/sdk/react-native/overview`, `/sdk/ios/overview`, `/sdk/android/v5/overview`, `/sdk/flutter/overview` |
| Voice and video calling | `/calls/javascript/overview`, `/calls/react-native/overview`, `/calls/ios/overview`, `/calls/android/overview`, `/calls/flutter/overview` |
| Server-side operations | `/rest-api/chat-apis` |

All paths are under https://www.cometchat.com/docs.

## Facts to get right

| Item | Where it comes from | Used for |
| --- | --- | --- |
| App ID | CometChat dashboard → your app → API & Auth Keys | Every SDK and UI Kit init, REST API URLs |
| Region | Same place: `us`, `eu` or `in` | SDK init, REST API URLs |
| Auth Key | Same place | Client login during development only |
| REST API key | Same place (`fullAccess` or `authOnly` scope) | Server-side REST calls, in the `apikey` header. Never in client code |
| Auth token | Your server: `POST /users/{uid}/auth_tokens` | Production client login |

- REST API base URL: `https://<appId>.api-<region>.cometchat.io/v3`
- Initialize, then log in, then render. A UI Kit component rendered before `init` and
  `login` finish shows a blank screen.
- Users and groups are identified by `uid` and `guid` from the user's own system.
  New apps include test users `cometchat-uid-1` through `cometchat-uid-5`.
- In production, create the CometChat user when the user signs up in the app (REST API),
  and log in with an auth token minted on the server.
- Remove SDK listeners when the screen or component that added them goes away.

## Before you finish

- The app builds, and chat loads for a test user.
- Credentials come from the user's env or config file, not hard-coded, and that file
  is ignored by version control.
- The Auth Key isn't used in a production build (or the user knows it must be replaced
  by server-side auth tokens).
- Tell the user what you changed and what they still need to do, such as adding real
  users or setting up push notifications.
