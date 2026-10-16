---
title: Angular UI Kit Quickstart
framework: angular
prerequisites:
  - "Node.js 18+"
  - "Angular 17 to 21 project (Angular 22 is outside the kit's peer range and fails to install)"
  - "CometChat App ID, Region and Auth Key from app.cometchat.com (Auth Key is for development only)"
last_verified: "2026-10-16"
packages:
  - registry: npm
    name: "@cometchat/chat-uikit-angular"
    version: "5.2.2"
  - registry: npm
    name: "@cometchat/chat-sdk-javascript"
    version: "4.2.1"
  - registry: npm
    name: "@cometchat/cards-angular"
    version: "1.0.0"
  - registry: npm
    name: "@cometchat/calls-sdk-javascript"
    version: "5.0.8"
---

# Angular UI Kit Quickstart

Install the CometChat Angular UI Kit v5, initialize and log in before the app boots, and render a conversation list next to a message pane. All kit components are standalone.

Source: https://www.cometchat.com/docs/ui-kit/angular/integration

## 1. Install

```bash
npx -y @angular/cli@21 new my-app --style css --ssr false   # skip if you have an Angular 17-21 app
npm install @cometchat/chat-uikit-angular@5.2.2 @cometchat/chat-sdk-javascript@4.2.1 \
  @cometchat/cards-angular@1.0.0 dompurify@^3
# Optional voice/video calling
npm install @cometchat/calls-sdk-javascript@5.0.8
```

The kit needs a browser, so create the app without SSR.

## 2. Configure

In `angular.json`, under `projects.<app>.architect.build`:

```json
"options": {
  "styles": [
    "node_modules/@cometchat/chat-uikit-angular/styles/css-variables.css",
    "src/styles.css"
  ],
  "assets": [
    { "glob": "**/*", "input": "public" },
    { "glob": "**/*", "input": "node_modules/@cometchat/chat-uikit-angular/src/lib/assets", "output": "assets" }
  ],
  "allowedCommonJsDependencies": ["@cometchat/chat-sdk-javascript"]
},
"configurations": {
  "production": {
    "budgets": [{ "type": "initial", "maximumWarning": "5mb", "maximumError": "6mb" }]
  }
}
```

The kit stylesheet goes **first**, or its tokens override your brand colors. The `assets` entry ships the kit's icons. The kit plus SDK is about 4 MB, so the default 1 MB budget fails `ng build` (`ng serve` still works).

Credentials go in `src/environments/environment.ts` (Angular has no `.env`):

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  cometchat: { appId: "YOUR_APP_ID", region: "YOUR_REGION", authKey: "YOUR_AUTH_KEY" },
};
```

## 3. Initialize and 4. Log in

`init` must resolve before `login`, and `login` before any kit component renders, so do both in `main.ts` before `bootstrapApplication`. Angular's `login` takes a UID string; in production call `loginWithAuthToken(token)` with a token your server mints.

```ts
// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { CometChatUIKit } from "@cometchat/chat-uikit-angular";
import { environment } from "./environments/environment";
import { appConfig } from "./app/app.config";
import { App } from "./app/app"; // Angular 17-19: AppComponent from "./app/app.component"

const { appId, region, authKey } = environment.cometchat;
(async () => {
  try {
    await CometChatUIKit.initFromSettings({
      appId, region,
      credentials: { authKey },                                // development only
      chatSDK: { presenceSubscription: { type: "ALL_USERS" } },
      // uiKit: { callsSDK: {} },                             // enables calling
    });
    await CometChatUIKit.login("cometchat-uid-1");             // a UID that exists in your app
  } catch (e) {
    console.error("CometChat init/login failed", e);
  } finally {
    bootstrapApplication(App, appConfig).catch(console.error); // boot even if chat fails
  }
})();
```

`initFromSettings` records the integration as agent-built; the docs' `UIKitSettingsBuilder` + `CometChatUIKit.init()` is the hand-written equivalent.

## 5. Render

```ts
// src/app/chat/chat.component.ts
import { Component, inject } from "@angular/core";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import {
  CometChatConversationsComponent, CometChatMessageComposerComponent, CometChatMessageHeaderComponent,
  CometChatMessageListComponent, CometChatUIKitConstants, ThemeService,
} from "@cometchat/chat-uikit-angular";

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [ // every kit component used in the template, or it renders nothing
    CometChatConversationsComponent, CometChatMessageHeaderComponent,
    CometChatMessageListComponent, CometChatMessageComposerComponent,
  ],
  template: `
    <div class="cc-shell">
      <aside class="cc-side">
        <cometchat-conversations class="cc-fill" (itemClick)="open($event)"></cometchat-conversations>
      </aside>
      @if (user || group) {
        <main class="cc-main">
          <cometchat-message-header [user]="user" [group]="group"></cometchat-message-header>
          <cometchat-message-list class="cc-fill" [user]="user" [group]="group"
            [hideReplyInThreadOption]="true"></cometchat-message-list>
          <cometchat-message-composer [user]="user" [group]="group"></cometchat-message-composer>
        </main>
      }
    </div>`,
  styles: [`
    .cc-shell { display: flex; height: 100dvh; overflow: hidden; }
    .cc-side, .cc-main { display: flex; flex-direction: column; min-height: 0; }
    .cc-side { width: 320px; }  .cc-main { flex: 1; }
    .cc-fill { flex: 1; min-height: 0; overflow: hidden; }
  `],
})
export class ChatComponent {
  user: CometChat.User | undefined;   // `| undefined`, not `| null`: strict templates reject null
  group: CometChat.Group | undefined;
  constructor() { inject(ThemeService).initFromPreference(); } // follow OS light/dark

  open(c: CometChat.Conversation) {
    const isGroup = c.getConversationType() === CometChatUIKitConstants.MessageReceiverType.group;
    this.user = isGroup ? undefined : (c.getConversationWith() as CometChat.User);
    this.group = isGroup ? (c.getConversationWith() as CometChat.Group) : undefined;
  }
}
```

Add `html, body { height: 100%; margin: 0; }` to `src/styles.css`, and render `<app-chat>` from your root component (add `ChatComponent` to its `imports`). Threads are hidden here; to add them, wire `(threadRepliesClick)` to a panel with `<cometchat-thread-header>`.

## Common pitfalls

- **Component not in `imports: []`.** The tag renders nothing, with no error. Import the class (`CometChatConversationsComponent`), use the selector (`<cometchat-conversations>`).
- **Kit stylesheet after yours, or `@import`ed from CSS/SCSS.** Use the `angular.json` path above, first in the list; the package exports do not expose an `@import` path.
- **Missing icon `assets` entry.** Icons are blank across the kit and nothing errors.
- **Unsized ancestors.** Each kit list needs `flex: 1; min-height: 0` inside a sized parent, or it collapses to zero height.
- **One variable for user and group.** `(itemClick)` emits 1:1 and group conversations; bind both `[user]` and `[group]`.
- **Concurrent `login()` calls** throw "Please wait until the previous login request ends". Log in once, before bootstrap.
- **No repaint after an SDK callback.** Angular 21 is zoneless by default; write to a signal or call `markForCheck()`.
- **Calling installed but no call buttons.** On the `initFromSettings` path, pass `uiKit: { callsSDK: {} }`.
- **Angular 22** fails `npm install` with `ERESOLVE` (peer range `>=17.0.0 <22.0.0`).
- **Auth Key in production.** Use `loginWithAuthToken` with a server-issued token.

## What to read next

- Components: https://www.cometchat.com/docs/ui-kit/angular/components/components-overview
- Theming: https://www.cometchat.com/docs/ui-kit/angular/customization/theming
- Calling: https://www.cometchat.com/docs/ui-kit/angular/call-features
- Methods reference: https://www.cometchat.com/docs/ui-kit/angular/methods
