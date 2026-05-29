# Documentation Patterns: Human & AI Optimized

Examples of good vs bad patterns for dual-audience documentation.

---

## Heading Hierarchy

### ❌ Bad: Skipped Levels
```markdown
# Getting Started

### Installation

### Configuration
```

### ✅ Good: Proper Nesting
```markdown
# Getting Started

## Installation

### npm

### yarn

## Configuration

### Required Settings

### Optional Settings
```

---

## Self-Contained Sections

### ❌ Bad: Context-Dependent
```markdown
## Sending Messages

Use the method shown above to send messages. It works similarly to what we discussed.

```javascript
sendMessage(msg);
```
```

### ✅ Good: Self-Contained
```markdown
## Sending Messages with CometChat SDK

CometChat SDK provides the `sendMessage` method to send text, media, and custom messages between users.

### Prerequisites
- CometChat SDK initialized with valid `appId`
- Active user session (logged in)

### Send a Text Message

```javascript
import { CometChat } from "@cometchat/chat-sdk-javascript";

const receiverUID = "user_123";
const messageText = "Hello!";

const textMessage = new CometChat.TextMessage(
  receiverUID,
  messageText,
  CometChat.RECEIVER_TYPE.USER
);

CometChat.sendMessage(textMessage).then(
  (message) => console.log("Message sent:", message),
  (error) => console.log("Error:", error)
);
```
```

---

## Terminology Consistency

### ❌ Bad: Terminology Drift
```markdown
First, get your app ID from the dashboard. Then use the application identifier 
to initialize the SDK. Pass the App Id to the init function along with your 
auth token. The authentication key should be kept secure.
```

### ✅ Good: Consistent Terms
```markdown
First, get your `appId` from the CometChat Dashboard. Then use the `appId` 
to initialize the SDK. Pass the `appId` to the `init` function along with 
your `authKey`. The `authKey` should be kept secure and never exposed in 
client-side code in production.
```

---

## Pronoun Clarity

### ❌ Bad: Ambiguous Pronouns
```markdown
When the user sends a message, it triggers an event. This is handled by 
the listener. It then updates the UI. You can customize this behavior.
```

### ✅ Good: Explicit Nouns
```markdown
When a user sends a message, the SDK triggers a `messageReceived` event. 
The `CometChatMessageListener` handles the `messageReceived` event. The 
listener then updates the message list UI. You can customize the listener 
behavior by overriding the `onMessageReceived` callback.
```

---

## Code Block Formatting

### ❌ Bad: No Language Tag
```
const chat = new CometChat();
chat.init(appId);
```

### ✅ Good: Proper Language Tag
```javascript
import { CometChat } from "@cometchat/chat-sdk-javascript";

const appId = "YOUR_APP_ID";
const region = "YOUR_REGION";

const appSetting = new CometChat.AppSettingsBuilder()
  .subscribePresenceForAllUsers()
  .setRegion(region)
  .build();

CometChat.init(appId, appSetting).then(
  () => console.log("CometChat initialized successfully"),
  (error) => console.log("Initialization failed:", error)
);
```

---

## Prerequisites

### ❌ Bad: Buried Prerequisites
```markdown
## Quick Start

Let's build a chat app! First, install the SDK:

```bash
npm install @cometchat/chat-sdk-javascript
```

Note: You'll need Node.js 16+ and a CometChat account.
```

### ✅ Good: Upfront Prerequisites
```markdown
## Quick Start

Build a chat application using CometChat JavaScript SDK.

### Prerequisites

Before you begin, ensure you have:
- Node.js 16 or higher installed
- A CometChat account ([sign up free](https://app.cometchat.com))
- Your `appId` and `authKey` from the CometChat Dashboard

### Step 1: Install the SDK

```bash
npm install @cometchat/chat-sdk-javascript
```
```

---

## The "Why" Before "How"

### ❌ Bad: Implementation Only
```markdown
## User Authentication

```javascript
CometChat.login(uid, authKey).then(
  (user) => console.log("Login successful:", user),
  (error) => console.log("Login failed:", error)
);
```
```

### ✅ Good: Context Then Implementation
```markdown
## User Authentication

CometChat requires user authentication to establish a secure session. Each 
user in your app needs a unique `uid` that maps to their identity in your 
system.

### When to Use Auth Key vs Auth Token

| Method | Use Case | Security |
|--------|----------|----------|
| `authKey` | Development and testing | Lower - key exposed in client |
| Auth Token | Production | Higher - token generated server-side |

### Development: Login with Auth Key

For quick testing during development:

```javascript
import { CometChat } from "@cometchat/chat-sdk-javascript";

const uid = "user_123";
const authKey = "YOUR_AUTH_KEY";

CometChat.login(uid, authKey).then(
  (user) => console.log("Login successful:", user),
  (error) => console.log("Login failed:", error)
);
```

> ⚠️ **Security Warning:** Never use `authKey` in production. Generate Auth 
> Tokens server-side instead.
```

---

## Error Handling

### ❌ Bad: No Error Guidance
```markdown
## Send Message

```javascript
CometChat.sendMessage(message);
```
```

### ✅ Good: Error Handling Included
```markdown
## Send Message

```javascript
import { CometChat } from "@cometchat/chat-sdk-javascript";

CometChat.sendMessage(textMessage).then(
  (message) => {
    console.log("Message sent:", message);
  },
  (error) => {
    console.log("Send failed:", error);
    // Handle specific error codes
    if (error.code === "ERR_UID_NOT_FOUND") {
      console.log("Recipient user does not exist");
    }
  }
);
```

### Common Errors

| Error Code | Cause | Solution |
|------------|-------|----------|
| `ERR_UID_NOT_FOUND` | Recipient doesn't exist | Verify the `uid` is correct |
| `ERR_NOT_LOGGED_IN` | No active session | Call `CometChat.login()` first |
| `ERR_MESSAGE_EMPTY` | Empty message text | Validate message before sending |
```

---

## Tables vs JSON

### ❌ Bad: Verbose JSON for Reference
```markdown
## Configuration Options

```json
{
  "appId": {
    "type": "string",
    "required": true,
    "description": "Your CometChat application ID"
  },
  "region": {
    "type": "string",
    "required": true,
    "description": "Deployment region (us, eu, in)"
  },
  "autoEstablishSocketConnection": {
    "type": "boolean",
    "required": false,
    "default": true,
    "description": "Auto-connect WebSocket on init"
  }
}
```
```

### ✅ Good: Token-Efficient Table
```markdown
## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `appId` | string | Yes | — | Your CometChat application ID |
| `region` | string | Yes | — | Deployment region: `us`, `eu`, or `in` |
| `autoEstablishSocketConnection` | boolean | No | `true` | Auto-connect WebSocket on init |
```

---

## Cross-References

### ❌ Bad: Vague References
```markdown
See the section above for more details. The configuration options are 
explained elsewhere in the documentation.
```

### ✅ Good: Explicit Links
```markdown
See [User Authentication](#user-authentication) for login details. For all 
configuration options, refer to the [Configuration Reference](/sdk/configuration).
```

---

## Version Information

### ❌ Bad: No Version Context
```markdown
## New Feature

Use the `sendInteractiveMessage` method to send interactive messages.
```

### ✅ Good: Version Specified
```markdown
## Interactive Messages

> **Available in:** CometChat SDK v4.0.0+

Use the `sendInteractiveMessage` method to send interactive messages with 
buttons, forms, and other UI elements.

```javascript
// Requires @cometchat/chat-sdk-javascript@^4.0.0
import { CometChat } from "@cometchat/chat-sdk-javascript";
```
```

---

## Deprecation Notices

### ❌ Bad: No Warning
```markdown
## Login

```javascript
CometChat.login(uid, apiKey);
```
```

### ✅ Good: Clear Deprecation
```markdown
## Login

> ⚠️ **Deprecated:** The `apiKey` parameter is deprecated in v4.0. Use 
> `authKey` instead. See [Migration Guide](/migration/v3-to-v4).

```javascript
// Deprecated (v3.x)
CometChat.login(uid, apiKey);

// Recommended (v4.x)
CometChat.login(uid, authKey);
```
```

---

## Platform-Specific Code

### ❌ Bad: Unlabeled Platform Code
```markdown
## Installation

```
npm install @cometchat/chat-sdk-javascript
pod install
gradle sync
```
```

### ✅ Good: Clearly Labeled Platforms
```markdown
## Installation

### JavaScript/Web

```bash
npm install @cometchat/chat-sdk-javascript
```

### iOS (CocoaPods)

```bash
pod install
```

### Android (Gradle)

```groovy
implementation 'com.cometchat:chat-sdk-android:4.0.0'
```

Then sync your Gradle files.
```

---

## Troubleshooting Section

### ❌ Bad: No Troubleshooting
```markdown
## Summary

That's how you send messages with CometChat!
```

### ✅ Good: Troubleshooting Included
```markdown
## Troubleshooting

### Messages Not Sending

| Symptom | Cause | Solution |
|---------|-------|----------|
| `ERR_NOT_LOGGED_IN` | No active session | Ensure `CometChat.login()` completed successfully |
| Message stuck in "sending" | Network issue | Check internet connection; SDK auto-retries |
| Recipient not receiving | Wrong `uid` | Verify recipient `uid` exists in your app |

### Debug Mode

Enable debug logging to troubleshoot issues:

```javascript
const appSetting = new CometChat.AppSettingsBuilder()
  .setRegion(region)
  .enableLogs(true)  // Enable debug logs
  .build();
```

### Still Having Issues?

- Check the [Error Reference](/errors)
- Search [Community Forums](https://forum.cometchat.com)
- Contact [Support](https://help.cometchat.com)
```

---

## Marketing vs Technical Language

### ❌ Bad: Marketing Copy
```markdown
## Why CometChat?

CometChat is the industry-leading, enterprise-grade chat solution that 
empowers businesses to deliver best-in-class messaging experiences. Our 
cutting-edge technology future-proofs your communication roadmap.
```

### ✅ Good: Technical Description
```markdown
## CometChat Overview

CometChat provides real-time messaging infrastructure with:

- **SDKs** for Web, iOS, Android, React Native, and Flutter
- **UI Kits** with pre-built, customizable components
- **REST APIs** for server-side operations
- **Webhooks** for event-driven integrations

### Architecture

```
Your App → CometChat SDK → CometChat Cloud → Recipient SDK → Recipient App
```

Messages are delivered in real-time via WebSocket connections, with 
automatic fallback to long-polling when WebSocket is unavailable.
```
