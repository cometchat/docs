# Documentation Patterns: Good vs Bad

Based on official CometChat doc templates.

---

## AI Agent Component Spec

### ❌ Bad: Missing or incomplete spec
```mdx
<!-- No AI Agent Component Spec -->

## Where It Fits
...
```

### ✅ Good: Complete spec in Accordion
```mdx
<Accordion title="AI Agent Component Spec">
```json
{
  "component": "CometChatConversations",
  "package": "CometChatUIKitSwift",
  "import": "import CometChatUIKitSwift\nimport CometChatSDK",
  "description": "Displays a list of recent conversations with real-time updates",
  "inherits": "UIViewController",
  "primaryOutput": {
    "callback": "onItemClick",
    "type": "(Conversation, IndexPath) -> Void"
  },
  "props": {
    "data": {
      "conversationsRequestBuilder": {
        "type": "ConversationsRequest.ConversationsRequestBuilder?",
        "default": "nil"
      }
    },
    "callbacks": {
      "onItemClick": "(Conversation, IndexPath) -> Void",
      "onError": "(CometChatException) -> Void"
    },
    "visibility": {
      "hideSearch": { "type": "Bool", "default": false }
    }
  },
  "events": [
    {
      "name": "ccConversationDeleted",
      "payload": "Conversation",
      "description": "Fires when a conversation is deleted"
    }
  ],
  "sdkListeners": ["onMessageReceived", "onTypingStarted"]
}
```
</Accordion>
```

---

## Code Examples

### ❌ Bad: No imports, no language identifier
```
const chat = new CometChat();
chat.init();
```

### ✅ Good: Complete with imports and language
```javascript
import { CometChat } from "@cometchat/chat-sdk-javascript";

const appID = "YOUR_APP_ID";
const region = "YOUR_REGION";

const appSetting = new CometChat.AppSettingsBuilder()
  .subscribePresenceForAllUsers()
  .setRegion(region)
  .build();

CometChat.init(appID, appSetting).then(
  () => console.log("CometChat initialized"),
  (error) => console.log("Init failed:", error)
);
```

---

## iOS Memory Management

### ❌ Bad: Missing [weak self]
```swift
conversations.set(onItemClick: { conversation, indexPath in
    self.openMessages(for: conversation)  // Retain cycle!
})
```

### ✅ Good: Proper weak self
```swift
import CometChatUIKitSwift
import CometChatSDK

conversations.set(onItemClick: { [weak self] conversation, indexPath in
    guard let self = self else { return }
    self.openMessages(for: conversation)
})
```

---

## Callouts

### ❌ Bad: Raw HTML div
```html
<div class="bg-yellow-100 p-4 rounded">
  <strong>Note:</strong> This requires API version 3.0+
</div>
```

### ✅ Good: Mintlify component
```mdx
<Note>
This requires API version 3.0+
</Note>
```

---

## Multi-Language Examples

### ❌ Bad: Separate sections
```mdx
## JavaScript
```javascript
// JS code
```

## Swift
```swift
// Swift code
```
```

### ✅ Good: Tabs component
```mdx
<Tabs>
<Tab title="TypeScript">
```tsx
import { CometChatConversations } from '@cometchat/chat-uikit-react';

<CometChatConversations
  onItemClick={(conversation) => navigateToMessages(conversation)}
/>
```
</Tab>
<Tab title="Swift">
```swift
import CometChatUIKitSwift

let conversations = CometChatConversations()
conversations.set(onItemClick: { [weak self] conversation, _ in
    self?.navigateToMessages(conversation)
})
```
</Tab>
</Tabs>
```

---

## Props Tables

### ❌ Bad: Inconsistent format
```mdx
**userId** - The user's ID (required)
**theme** - Can be "light" or "dark", defaults to light
```

### ✅ Good: Per-prop table format
```mdx
### userId

The unique identifier of the user to display.

| | |
|---|---|
| Type | `string` |
| Default | — |

### theme

Visual theme for the component.

| | |
|---|---|
| Type | `"light" \| "dark"` |
| Default | `"light"` |
```

---

## Style Properties Table

### ❌ Bad: Missing columns
```mdx
| Property | Description |
|----------|-------------|
| backgroundColor | Background color |
```

### ✅ Good: Complete columns
```mdx
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `backgroundColor` | `UIColor` | `CometChatTheme.backgroundColor01` | Background color of the component |
| `titleFont` | `UIFont` | `CometChatTypography.Heading.bold` | Font for the title text |
| `titleColor` | `UIColor` | `CometChatTheme.textColorPrimary` | Color for the title text |
```

---

## Customization Matrix

### ❌ Bad: Missing example column
```mdx
| What to change | Property |
|----------------|----------|
| Background | backgroundColor |
```

### ✅ Good: Complete matrix
```mdx
| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
| Background color | Style | `backgroundColor` | `style.backgroundColor = .systemBlue` |
| Title appearance | Style | `titleFont`, `titleColor` | `style.titleFont = .boldSystemFont(ofSize: 18)` |
| Hide search bar | Property | `hideSearch` | `component.hideSearch = true` |
| Custom avatar | View Slot | `set(avatarView:)` | See Custom View Slots section |
```

---

## Actions and Events Section

### ❌ Bad: Missing subsections
```mdx
## Events

The component fires events when things happen.
```

### ✅ Good: Three required subsections
```mdx
## Actions and Events

### Callback Props

#### onItemClick

Fires when the user taps on a conversation. Use this to navigate to the message view.

```swift
import CometChatUIKitSwift
import CometChatSDK

conversations.set(onItemClick: { [weak self] conversation, indexPath in
    guard let self = self else { return }
    self.navigateToMessages(for: conversation)
})
```

### Actions Reference

| Method | Description | Example |
|--------|-------------|---------|
| `set(onItemClick:)` | Fires when user taps a conversation | Navigate to messages |
| `set(onError:)` | Fires when an error occurs | Display error alert |

### Global UI Events

| Event | Fires when | Payload |
|-------|------------|---------|
| `ccConversationDeleted` | User deletes a conversation | `Conversation` |

### SDK Events (Real-Time, Automatic)

| SDK Listener | Internal behavior |
|--------------|-------------------|
| `onMessageReceived` | Updates conversation with new message, moves to top |
| `onTypingStarted` | Shows typing indicator in subtitle |
```

---

## Empty State Fallbacks

### ❌ Bad: Empty table or no mention
```mdx
### Global UI Events

| Event | Fires when | Payload |
|-------|------------|---------|
```

### ✅ Good: Exact fallback text
```mdx
### Global UI Events

The component does not emit global UI events.
```

---

## Screenshots

### ❌ Bad: Raw image
```mdx
![Screenshot](./screenshot.png)
```

### ✅ Good: Frame wrapped with alt text
```mdx
<Frame>
  <img src="/images/conversations-context.png" alt="CometChatConversations showing list of recent chats" />
</Frame>
```

---

## Sequential Instructions

### ❌ Bad: Plain numbered list
```mdx
1. Install the SDK
2. Initialize CometChat
3. Log in a user
4. Send a message
```

### ✅ Good: Steps component
```mdx
<Steps>
  <Step title="Install the SDK">
    ```bash
    npm install @cometchat/chat-sdk-javascript
    ```
  </Step>
  <Step title="Initialize CometChat">
    ```javascript
    import { CometChat } from "@cometchat/chat-sdk-javascript";
    // initialization code
    ```
  </Step>
  <Step title="Log in a user">
    ```javascript
    // login code
    ```
  </Step>
</Steps>
```

---

## Prerequisites

### ❌ Bad: Buried in text
```mdx
Before you begin, make sure you have Node.js 16+ installed and have 
created a CometChat account to get your appId and authKey.
```

### ✅ Good: Info component at top
```mdx
<Info>
**Prerequisites:**
- Node.js 16+
- CometChat account with `appId` and `authKey`
- Basic knowledge of React
</Info>
```

---

## Resource Links

### ❌ Bad: Plain list
```mdx
- Demo: https://demo.cometchat.com
- Docs: /docs
- Support: /support
```

### ✅ Good: CardGroup
```mdx
<CardGroup cols={2}>
  <Card title="Demo App" icon="play-circle" href="https://demo.cometchat.com">
    Experience the full UI Kit in action
  </Card>
  <Card title="Documentation" icon="book" href="/docs">
    Explore all available components
  </Card>
  <Card title="Support" icon="message-circle" href="/support">
    Get help from our team
  </Card>
</CardGroup>
```

---

## Marketing vs Technical Language

### ❌ Bad: Marketing copy
```mdx
## Future proof your chat roadmap

Partner with subject matter experts and master the art of real-time 
engagement with CometChat. Our enterprise-grade solutions for every 
industry empower you to offer the best in-app chat experience.
```

### ✅ Good: Technical description
```mdx
## Getting Started

CometChat provides real-time messaging through three core primitives:

1. **Users** - Represent individuals in your app
2. **Groups** - Collections of users for group messaging
3. **Messages** - Text, media, and custom message types

Here's how to send your first message:

```javascript
import { CometChat } from "@cometchat/chat-sdk-javascript";

const textMessage = new CometChat.TextMessage(
  receiverUID,
  "Hello!",
  CometChat.RECEIVER_TYPE.USER
);

CometChat.sendMessage(textMessage).then(
  message => console.log("Message sent:", message),
  error => console.log("Error:", error)
);
```
```

---

## Frontmatter

### ❌ Bad: Missing required fields
```yaml
---
title: "Messages"
---
```

### ✅ Good: Complete frontmatter
```yaml
---
title: "Sending Messages"
description: "Learn how to send text, media, and custom messages using the CometChat SDK."
sidebarTitle: "Messages"
---
```

---

## Glossary Term Usage

### ❌ Bad: Term used without context
```mdx
Pass the uid to the login function.
```

### ✅ Good: First usage links to glossary
```mdx
Pass the [uid](/fundamentals/glossary#uid) to the login function.
```

---

## Demo Links

### ❌ Bad: Plain link
```mdx
Try the demo here: https://example.com/demo
```

### ✅ Good: Callout component
```mdx
<Callout type="info">
  [Try it live →](https://example.com/demo)
</Callout>
```

---

## File Structure Display

### ❌ Bad: Plain text
```
src/
  components/
    CometChatSelector.tsx
    CometChatSelector.css
```

### ✅ Good: Tree component
```mdx
<Tree>
  <Tree.Folder name="src" defaultOpen>
    <Tree.Folder name="components" defaultOpen>
      <Tree.File name="CometChatSelector.tsx" />
      <Tree.File name="CometChatSelector.css" />
    </Tree.Folder>
  </Tree.Folder>
</Tree>
```
