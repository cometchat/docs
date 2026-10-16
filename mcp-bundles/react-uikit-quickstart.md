---
title: React UI Kit Quickstart
framework: react
prerequisites:
  - "Node.js 18+"
  - "React 18 or 19 project (Vite or CRA)"
  - "CometChat App ID, Auth Key, and Region from app.cometchat.com"
last_verified: "2026-10-16"
packages:
  - registry: npm
    name: "@cometchat/chat-uikit-react"
    version: "7.2.4"
  - registry: npm
    name: "@cometchat/chat-sdk-javascript"
    version: "4.2.1"
  - registry: npm
    name: "@cometchat/calls-sdk-javascript"
    version: "5.0.8"
---

# React UI Kit Quickstart

Install the CometChat React UI Kit v7, initialize, log in, and render a conversation list next to a message view.

Source: https://www.cometchat.com/docs/ui-kit/react/integration-react

## 1. Install

```bash
npm install @cometchat/chat-uikit-react@7.2.4 @cometchat/chat-sdk-javascript@4.2.1 dompurify
```

For voice/video calling, also run `npm install @cometchat/calls-sdk-javascript@5.0.8` and enable calling in step 3.

## 2. Configure

Put credentials in `.env.local` (Vite reads `VITE_*`; CRA uses `REACT_APP_*` and `process.env`):

```bash
VITE_COMETCHAT_APP_ID=your-app-id
VITE_COMETCHAT_REGION=us
VITE_COMETCHAT_AUTH_KEY=your-auth-key
```

Import the kit stylesheet once, in your entry file. v7 ships it at `/styles` (`css-variables.css` no longer exists):

```tsx
// src/main.tsx
import "@cometchat/chat-uikit-react/styles";
import "./index.css";
```

On TypeScript 6 (or with `noUncheckedSideEffectImports`), add a declaration so the CSS import type-checks. Do not name it after an existing `.ts` file:

```ts
// src/cometchat-styles.d.ts
declare module "@cometchat/chat-uikit-react/styles";
```

## 3. Initialize and log in (once)

`init()` must resolve before `login()`, and `login()` must resolve before any UI Kit component renders. Cache the promises so React StrictMode's double effect does not start a second init or a concurrent login (that throws "Please wait until the previous login request ends").

```ts
// src/cometchat.ts
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";

let initPromise: Promise<unknown> | null = null;
let loginPromise: Promise<unknown> | null = null;

export function initCometChat(): Promise<unknown> {
  if (!initPromise) {
    const settings = new UIKitSettingsBuilder()
      .setAppId(import.meta.env.VITE_COMETCHAT_APP_ID)
      .setRegion(import.meta.env.VITE_COMETCHAT_REGION)
      .setAuthKey(import.meta.env.VITE_COMETCHAT_AUTH_KEY) // dev only
      .subscribePresenceForAllUsers()
      // .setCallingEnabled(true) // only if @cometchat/calls-sdk-javascript is installed
      .build();
    initPromise = CometChatUIKit.init(settings);
  }
  return initPromise;
}

export async function loginCometChat(uid: string): Promise<void> {
  await initCometChat();
  const current = CometChatUIKit.getLoggedInUser(); // sync, capital "In"
  if (current?.getUid() === uid) return;
  if (current) await CometChatUIKit.logout();
  if (!loginPromise) {
    loginPromise = CometChatUIKit.login(uid).finally(() => (loginPromise = null));
  }
  await loginPromise;
}
```

The user must already exist (new apps include `cometchat-uid-1` to `cometchat-uid-5`).

## 4. Render conversations + messages

There is no combined `CometChatConversationsWithMessages` in v7. Compose the list and the message pane yourself, inside `CometChatProvider`:

```tsx
// src/Chat.tsx
import { useEffect, useState } from "react";
// CometChat.User / Group / Conversation are used as types only; the SDK declares the
// CometChat namespace globally, so no import is needed (a value import fails noUnusedLocals).
import {
  CometChatProvider,
  CometChatErrorBoundary,
  CometChatConversations,
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatMessageComposer,
} from "@cometchat/chat-uikit-react";
import { loginCometChat } from "./cometchat";

export function Chat({ uid }: { uid: string }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<CometChat.User>();
  const [group, setGroup] = useState<CometChat.Group>();

  useEffect(() => {
    loginCometChat(uid).then(() => setReady(true), (e) => setError(String(e?.message ?? e)));
  }, [uid]);

  if (error) return <div>Chat failed to start: {error}</div>;
  if (!ready) return <div>Loading chat…</div>;

  const open = (c: CometChat.Conversation) => {
    const w = c.getConversationWith();
    if (c.getConversationType() === "user") { setUser(w as CometChat.User); setGroup(undefined); }
    else { setGroup(w as CometChat.Group); setUser(undefined); }
  };

  return (
    <CometChatErrorBoundary>
      <CometChatProvider>
        <div className="cc-app">
          <div className="cc-list"><CometChatConversations onItemClick={open} /></div>
          <div className="cc-pane">
            {(user || group) && (
              <>
                <CometChatMessageHeader user={user} group={group} />
                <CometChatMessageList user={user} group={group} />
                <CometChatMessageComposer user={user} group={group} />
              </>
            )}
          </div>
        </div>
      </CometChatProvider>
    </CometChatErrorBoundary>
  );
}
```

The components fill their parent, so the parent needs a fixed height:

```css
/* src/index.css — also remove the Vite/CRA template's #root max-width/padding/centering */
html, body, #root { height: 100%; margin: 0; }
.cc-app  { display: flex; height: 100dvh; overflow: hidden; }
.cc-list { width: 320px; flex-shrink: 0; height: 100%; }
.cc-pane { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
```

## 5. Production auth

The Auth Key is for development only. In production, mint an Auth Token on your server (REST `POST /v3/users/{uid}/auth_tokens`) and call `CometChatUIKit.loginWithAuthToken(token)` instead of `login(uid)`. Omit `setAuthKey` from the client build.

REST: https://www.cometchat.com/docs/rest-api/auth-tokens/create

## Common pitfalls

- **Logging in before `init()` resolves, or rendering before `login()` resolves.** Await both; gate rendering on a ready flag.
- **StrictMode double effects.** A boolean "initialized" flag or an unguarded `login()` races. Cache the init and login promises as above.
- **Removed v6 names.** `CometChatConversationsWithMessages` and `css-variables.css` do not exist in v7. Without the `/styles` import the UI renders unstyled.
- **Zero-height chat.** A parent with `height: auto` or `min-height` collapses the kit. Pin the height (`100dvh` or a fixed value) and set `min-height: 0` on flex columns.
- **`transform` or `filter` on an ancestor.** It clips the kit's fixed-position menus, emoji picker, and call screen.
- **Wrong region or env prefix.** Login errors usually mean the region is wrong. Vite needs `VITE_*`; restart the dev server after editing `.env`.
- **Server-side rendering.** The kit needs `window`. In Next.js, load the chat in a `"use client"` component via `dynamic(..., { ssr: false })`.
- **Shipping the Auth Key.** Switch to Auth Tokens before launch.

## What to read next

- CometChatProvider (theme, locale): https://www.cometchat.com/docs/ui-kit/react/cometchat-provider
- Theming: https://www.cometchat.com/docs/ui-kit/react/theming
- Methods (login, logout, auth tokens): https://www.cometchat.com/docs/ui-kit/react/methods
- Components: https://www.cometchat.com/docs/ui-kit/react/components-overview
- Next.js setup: https://www.cometchat.com/docs/ui-kit/react/integration-nextjs
