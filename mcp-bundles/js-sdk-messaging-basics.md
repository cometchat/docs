---
title: JavaScript SDK — Messaging Basics
framework: javascript
prerequisites:
  - "A modern browser app (the SDK is browser-first; it needs window and WebSocket)"
  - "A bundler (Vite, webpack) for npm imports, or the CDN script"
  - "CometChat App ID, Auth Key, and Region from app.cometchat.com"
last_verified: "2026-10-16"
packages:
  - registry: npm
    name: "@cometchat/chat-sdk-javascript"
    version: "4.2.1"
---

# JavaScript SDK — Messaging Basics

Install the JavaScript Chat SDK v4, initialize, log a user in, and send and receive text and media messages without the UI Kit.

Source: https://www.cometchat.com/docs/sdk/javascript/overview

## 1. Install

```bash
npm install @cometchat/chat-sdk-javascript@4.2.1
```

## 2. Initialize and log in

Call `init()` once at startup and wait for it before any other SDK call. `login()` needs a user that already exists (new apps include `cometchat-uid-1` to `cometchat-uid-5`).

```ts
import { CometChat } from "@cometchat/chat-sdk-javascript";

const APP_ID = import.meta.env.VITE_COMETCHAT_APP_ID;
const REGION = import.meta.env.VITE_COMETCHAT_REGION; // "us" | "eu" | "in"
const AUTH_KEY = import.meta.env.VITE_COMETCHAT_AUTH_KEY; // dev only

const settings = new CometChat.AppSettingsBuilder()
  .setRegion(REGION)
  .subscribePresenceForAllUsers()
  .autoEstablishSocketConnection(true)
  .build();

await CometChat.init(APP_ID, settings);

// Reuse a stored session instead of logging in again.
const me = (await CometChat.getLoggedinUser()) ?? (await CometChat.login("cometchat-uid-1", AUTH_KEY));
```

In production, mint an Auth Token on your server and call `CometChat.login(authToken)` (one argument). Never ship the Auth Key.

## 3. Send a text message

```ts
const text = new CometChat.TextMessage(
  "cometchat-uid-2",            // receiver UID (or GUID for a group)
  "Hello from the SDK!",
  CometChat.RECEIVER_TYPE.USER, // CometChat.RECEIVER_TYPE.GROUP for groups
);
const sent = await CometChat.sendMessage(text);
```

## 4. Send a media message (image)

```ts
const file = (document.getElementById("upload") as HTMLInputElement).files![0];
const media = new CometChat.MediaMessage(
  "cometchat-uid-2",
  file,
  CometChat.MESSAGE_TYPE.IMAGE,
  CometChat.RECEIVER_TYPE.USER,
);
const sentMedia = await CometChat.sendMediaMessage(media);
```

For upload progress, retries, or several files per message, use `CometChat.createUploadFileRequest()` (see "Media & file messages" below).

## 5. Listen for incoming messages

Register after login. Use a unique listener ID per screen, and remove it when the screen goes away.

```ts
const listenerId = "chat-screen";
CometChat.addMessageListener(
  listenerId,
  new CometChat.MessageListener({
    onTextMessageReceived: (msg: CometChat.TextMessage) => console.log("text:", msg.getText()),
    onMediaMessageReceived: (msg: CometChat.MediaMessage) => console.log("media:", msg.getAttachment()?.getUrl()),
  }),
);

// when leaving the screen:
CometChat.removeMessageListener(listenerId);
```

The sender does not receive its own message through the listener (other devices of the same user do). Use the value returned by `sendMessage()` to show it locally.

## 6. Fetch message history

```ts
const request = new CometChat.MessagesRequestBuilder()
  .setUID("cometchat-uid-2") // .setGUID(guid) for a group
  .setLimit(30)
  .build();

const page1 = await request.fetchPrevious(); // call again on the same request for older pages
```

## Common pitfalls

- **Calling `login()`, `sendMessage()`, or adding listeners before `init()` resolves.** They fail. Await `init()` first.
- **Wrong or missing region.** `setRegion()` must match the app's region in the dashboard; a mismatch makes login fail.
- **Logging in twice.** Check `CometChat.getLoggedinUser()` first. A second `login()` while one is in flight throws "Please wait until the previous login request ends".
- **Running in Node or during SSR.** The SDK expects a browser. In Next.js and similar, initialize it only on the client.
- **Untyped listener callbacks in strict TypeScript.** Listener callbacks are typed as `Function`, so annotate parameters (`msg: CometChat.TextMessage`) or you get implicit-any errors.
- **Not removing listeners.** Call `removeMessageListener(id)` on unmount; re-adding with new IDs leaks duplicate handlers.
- **Receiver type mismatch.** Sending to a GUID with `RECEIVER_TYPE.USER` (or the reverse) fails.
- **Building a new `MessagesRequest` for each page.** Pagination state lives on the request object; reuse it for `fetchPrevious()`.
- **Auth Key in production.** Use server-issued Auth Tokens.

## What to read next

- Setup: https://www.cometchat.com/docs/sdk/javascript/setup-sdk
- Authentication: https://www.cometchat.com/docs/sdk/javascript/authentication-overview
- Send a message: https://www.cometchat.com/docs/sdk/javascript/send-message
- Receive a message: https://www.cometchat.com/docs/sdk/javascript/receive-message
- Media & file messages: https://www.cometchat.com/docs/sdk/javascript/upload-files
- Real-time listeners: https://www.cometchat.com/docs/sdk/javascript/all-real-time-listeners
