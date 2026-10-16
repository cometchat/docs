---
title: Presence and Typing Indicators
framework: any
prerequisites:
  - "CometChat JavaScript SDK installed and initialized (see js-sdk-messaging-basics)"
  - "App ID, Region, and a logged-in user"
last_verified: "2026-10-16"
packages:
  - registry: npm
    name: "@cometchat/chat-sdk-javascript"
    version: "4.2.1"
---

# Presence and Typing Indicators

Show online presence, typing indicators, and delivery/read receipts. The recipes use the JavaScript SDK; the iOS, Android, Flutter, and React Native SDKs have equivalent APIs (check each platform's docs for exact names).

If you use a CometChat UI Kit, its components already show presence, typing, and receipts. You only need the presence subscription at init (step 2). Use this bundle when building your own UI.

Source:
- https://www.cometchat.com/docs/sdk/javascript/user-presence
- https://www.cometchat.com/docs/sdk/javascript/typing-indicators
- https://www.cometchat.com/docs/sdk/javascript/delivery-read-receipts

## 1. Install

```bash
npm install @cometchat/chat-sdk-javascript@4.2.1
```

The React UI Kit already depends on this package.

## 2. Subscribe to presence at init

Presence is configured when you call `init()`. If you call none of the `subscribePresenceFor*` methods, no presence events are delivered.

```ts
import { CometChat } from "@cometchat/chat-sdk-javascript";

const settings = new CometChat.AppSettingsBuilder()
  .setRegion(REGION)
  .subscribePresenceForAllUsers() // or .subscribePresenceForRoles(["role"]) / .subscribePresenceForFriends()
  .build();
await CometChat.init(APP_ID, settings);
```

With the React UI Kit, call `.subscribePresenceForAllUsers()` on `UIKitSettingsBuilder` instead.

## 3. Listen for online/offline events

```ts
const presenceListenerId = "presence-listener";
CometChat.addUserListener(
  presenceListenerId,
  new CometChat.UserListener({
    onUserOnline: (user: CometChat.User) => setPresence(user.getUid(), "online"),
    onUserOffline: (user: CometChat.User) => setPresence(user.getUid(), "offline"),
  }),
);

// on unmount:
CometChat.removeUserListener(presenceListenerId);
```

## 4. Read a user's status on demand

```ts
const u = await CometChat.getUser("cometchat-uid-2");
console.log(u.getStatus());       // "online" | "offline"
console.log(u.getLastActiveAt()); // Unix timestamp of last activity
```

Users fetched with `UsersRequestBuilder` carry the same `status` and `lastActiveAt` fields.

## 5. Send typing indicators

```ts
const typing = new CometChat.TypingIndicator("cometchat-uid-2", CometChat.RECEIVER_TYPE.USER);
// for a group: new CometChat.TypingIndicator(guid, CometChat.RECEIVER_TYPE.GROUP)

CometChat.startTyping(typing); // on first keystroke, not every keystroke
// after ~2 s with no input, or when the message is sent:
CometChat.endTyping(typing);
```

Both calls are fire-and-forget (they return `void`).

## 6. Receive typing indicators

```ts
const typingListenerId = "typing-listener";
CometChat.addMessageListener(
  typingListenerId,
  new CometChat.MessageListener({
    onTypingStarted: (t: CometChat.TypingIndicator) =>
      showTyping(t.getReceiverType(), t.getReceiverId(), t.getSender().getUid()),
    onTypingEnded: (t: CometChat.TypingIndicator) =>
      hideTyping(t.getReceiverType(), t.getReceiverId(), t.getSender().getUid()),
  }),
);
```

For a one-to-one chat the receiver ID is your own UID, so key the indicator on the sender. For a group, key it on the group ID and list the senders.

## 7. Delivery and read receipts

Mark a message read when the user actually sees it. `markAsRead(message)` marks every message up to and including that one, so pass only the latest visible message:

```ts
CometChat.markAsRead(lastVisibleMessage); // also: CometChat.markAsDelivered(message)
```

Listen for receipts on the sender side:

```ts
CometChat.addMessageListener(
  "receipts-listener",
  new CometChat.MessageListener({
    onMessagesDelivered: (r: CometChat.MessageReceipt) => markUiDelivered(r.getMessageId()),
    onMessagesRead: (r: CometChat.MessageReceipt) => markUiRead(r.getMessageId()),
  }),
);
```

Group "delivered to all" / "read by all" events (`onMessagesDeliveredToAll`, `onMessagesReadByAll`) require the Enhanced Messaging Status feature.

## Common pitfalls

- **No presence subscription at init.** Without a `subscribePresenceFor*` call, `onUserOnline`/`onUserOffline` never fire.
- **`subscribePresenceForFriends()` without friends.** Only friends' events arrive; add friends (REST Friends API) or use roles/all users.
- **Calling `startTyping` on every keystroke.** Send it once when typing starts, then `endTyping` after about 2 s of inactivity or on send.
- **Marking every message read on screen open.** Mark only the latest visible message; it covers all earlier ones.
- **Large groups.** Group receipts stop above 300 online users and typing indicators above 1,000; don't rely on them there.
- **Not removing listeners on unmount.** Causes duplicate handlers and leaks. Remove each listener ID you add.
- **Untyped callbacks in strict TypeScript.** Listener callbacks are typed as `Function`; annotate parameters to avoid implicit-any errors.
- **Wrong receiver type.** A typing indicator sent to a GUID with `RECEIVER_TYPE.USER` (or the reverse) does not reach anyone.

## What to read next

- All real-time listeners: https://www.cometchat.com/docs/sdk/javascript/all-real-time-listeners
- Connection status: https://www.cometchat.com/docs/sdk/javascript/connection-status
- Retrieve users: https://www.cometchat.com/docs/sdk/javascript/retrieve-users
