# AI Agent Component Spec JSON Schema Reference

This document defines the JSON schema for AI Agent Component Specs used in CometChat UI Kit documentation. The AI Agent Component Spec provides machine-readable metadata about UI components, enabling AI agents and developer tools to programmatically understand component capabilities.

## Overview

Every component documentation page should include an AI Agent Component Spec wrapped in an Accordion component at the top of the page. This spec provides structured metadata that can be parsed by AI agents, code generators, and documentation tools.

```mdx
<Accordion title="AI Agent Component Spec">
```json
{
  "component": "ComponentName",
  "package": "PackageName",
  "import": "import statement",
  "description": "Brief component description"
}
```
</Accordion>
```

---

## Required Fields

All AI Agent Component Specs MUST include these four fields:

### `component`

The component class/struct name as it appears in code.

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | Yes |
| Description | The exact name of the component class or struct |

**Examples:**
```json
"component": "CometChatConversations"
```
```json
"component": "CometChatMessages"
```
```json
"component": "CometChatSearch"
```

**Validation Rules:**
- Must be a non-empty string
- Should match the actual class/struct name in the codebase
- Use PascalCase naming convention

---

### `package`

The package or module name where the component is located.

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | Yes |
| Description | The package/module identifier for importing the component |

**Platform-Specific Examples:**

| Platform | Example |
|----------|---------|
| iOS | `"CometChatUIKitSwift"` |
| Android | `"com.cometchat.chatuikit"` |
| Flutter | `"cometchat_uikit"` |
| React Native | `"@cometchat/chat-uikit-react-native"` |
| React | `"@cometchat/chat-uikit-react"` |

**Validation Rules:**
- Must be a non-empty string
- Should be a valid package identifier for the target platform

---

### `import`

The complete import statement(s) required to use the component.

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | Yes |
| Description | Full import statement(s) needed to use the component |

**Platform-Specific Examples:**

**iOS (Swift):**
```json
"import": "import CometChatUIKitSwift"
```

**iOS (with SDK):**
```json
"import": "import CometChatUIKitSwift\nimport CometChatSDK"
```

**Android (Kotlin):**
```json
"import": "import com.cometchat.chatuikit.conversations.CometChatConversations"
```

**Flutter (Dart):**
```json
"import": "import 'package:cometchat_uikit/cometchat_uikit.dart';"
```

**React Native (TypeScript):**
```json
"import": "import { CometChatConversations } from '@cometchat/chat-uikit-react-native';"
```

**Validation Rules:**
- Must be a non-empty string
- Should be syntactically valid for the target platform
- Use `\n` for multiple import statements

---

### `description`

A brief description of what the component does.

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | Yes |
| Description | One to two sentence description of the component's purpose |

**Examples:**
```json
"description": "Displays a list of all conversations for the logged-in user with real-time updates."
```
```json
"description": "A search interface for finding conversations and messages across the app."
```
```json
"description": "Renders the message list and composer for a one-on-one or group chat."
```

**Validation Rules:**
- Must be a non-empty string
- Should be concise (1-2 sentences)
- Should clearly explain the component's primary purpose

---

## Optional Fields

These fields provide additional metadata when applicable to the component:

### `inherits`

The parent class or component that this component extends.

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | No |
| Description | Parent class/component name if the component uses inheritance |

**Examples:**
```json
"inherits": "UIViewController"
```
```json
"inherits": "CometChatListBase"
```

**When to Include:**
- When the component extends a platform base class (e.g., `UIViewController`, `Fragment`)
- When the component extends another CometChat component

---

### `primaryOutput`

The main callback that produces the component's primary output.

| Property | Value |
|----------|-------|
| Type | `object` |
| Required | No |
| Description | Describes the primary callback and its type signature |

**Structure:**
```json
"primaryOutput": {
  "callback": "callbackName",
  "type": "type signature"
}
```

**Examples:**

**iOS:**
```json
"primaryOutput": {
  "callback": "onItemClick",
  "type": "(Conversation, IndexPath) -> Void"
}
```

**Android:**
```json
"primaryOutput": {
  "callback": "setOnItemClick",
  "type": "(Conversation) -> Unit"
}
```

**React:**
```json
"primaryOutput": {
  "callback": "onItemClick",
  "type": "(conversation: CometChat.Conversation) => void"
}
```

**When to Include:**
- When the component has a primary action callback (e.g., item selection)
- When developers need to wire the component to navigation or other components

---

### `props`

Categorized properties that configure the component's behavior and appearance.

| Property | Value |
|----------|-------|
| Type | `object` |
| Required | No |
| Description | Component properties organized by category |

**Structure:**
```json
"props": {
  "data": { ... },
  "callbacks": { ... },
  "visibility": { ... },
  "sound": { ... },
  "selection": { ... },
  "viewSlots": { ... },
  "formatting": { ... }
}
```

See [Prop Categories](#prop-categories) for detailed documentation of each category.

---

### `events`

Global UI events that the component emits.

| Property | Value |
|----------|-------|
| Type | `array` |
| Required | No |
| Description | List of events the component can emit |

**Structure:**
```json
"events": [
  {
    "name": "eventName",
    "payload": "PayloadType",
    "description": "When this event fires"
  }
]
```

**Event Object Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | The event identifier |
| `payload` | `string` | Yes | The type of data passed with the event |
| `description` | `string` | Yes | When/why the event fires |

**Example:**
```json
"events": [
  {
    "name": "ccConversationDelete",
    "payload": "Conversation",
    "description": "Fires when a conversation is deleted"
  },
  {
    "name": "ccMessageSent",
    "payload": "BaseMessage",
    "description": "Fires when a message is successfully sent"
  }
]
```

**When to Include:**
- When the component emits global events that can be subscribed to from anywhere
- Omit if the component only uses callback props (not global events)

---

### `sdkListeners`

SDK event listeners that the component subscribes to internally.

| Property | Value |
|----------|-------|
| Type | `array` |
| Required | No |
| Description | List of CometChat SDK listeners the component uses |

**Example:**
```json
"sdkListeners": [
  "onMessageReceived",
  "onTypingStarted",
  "onTypingEnded",
  "onUserOnline",
  "onUserOffline"
]
```

**When to Include:**
- When the component listens to real-time SDK events
- Helps developers understand what real-time updates the component handles automatically

---

### `compositionExample`

Describes how the component fits into a larger component composition.

| Property | Value |
|----------|-------|
| Type | `object` |
| Required | No |
| Description | Shows how to wire the component with related components |

**Structure:**
```json
"compositionExample": {
  "description": "Brief description of the composition",
  "components": ["Component1", "Component2"],
  "flow": "Description of data/navigation flow"
}
```

**Example:**
```json
"compositionExample": {
  "description": "Conversations list navigating to Messages",
  "components": ["CometChatConversations", "CometChatMessages"],
  "flow": "User taps conversation → onItemClick fires → Navigate to CometChatMessages with user/group"
}
```

**When to Include:**
- When the component is typically used with other components
- When there's a common wiring pattern developers should follow

---

### `types`

Custom type definitions used by the component.

| Property | Value |
|----------|-------|
| Type | `object` |
| Required | No |
| Description | Definitions of custom types referenced in the spec |

**Structure:**
```json
"types": {
  "TypeName": {
    "field1": "type",
    "field2": "type"
  }
}
```

**Example:**
```json
"types": {
  "ConversationsStyle": {
    "backgroundColor": "UIColor",
    "titleFont": "UIFont",
    "titleColor": "UIColor",
    "listItemBackground": "UIColor"
  },
  "SearchFilter": {
    "messages": "Bool",
    "conversations": "Bool",
    "groups": "Bool"
  }
}
```

**When to Include:**
- When the component uses custom types that aren't standard platform types
- When style objects or configuration objects need documentation

---

## Prop Categories

When a `props` object is present, properties MUST be organized into these categories:

### `data`

Properties that provide or configure the component's data source.

| Category | Purpose |
|----------|---------|
| `data` | Data source configuration, request builders, initial data |

**Structure:**
```json
"data": {
  "propName": {
    "type": "TypeName",
    "default": "defaultValue",
    "note": "Optional additional information"
  }
}
```

**Examples:**
```json
"data": {
  "conversationRequestBuilder": {
    "type": "ConversationRequest.ConversationRequestBuilder",
    "default": "nil",
    "note": "Custom request builder for filtering conversations"
  },
  "user": {
    "type": "User?",
    "default": "nil",
    "note": "Restrict to a specific user's conversation"
  },
  "group": {
    "type": "Group?",
    "default": "nil",
    "note": "Restrict to a specific group's conversation"
  }
}
```

---

### `callbacks`

Function properties that fire when specific events occur.

| Category | Purpose |
|----------|---------|
| `callbacks` | Event handlers, action callbacks, lifecycle hooks |

**Structure:**
```json
"callbacks": {
  "callbackName": "type signature"
}
```

**Examples:**
```json
"callbacks": {
  "onItemClick": "(Conversation, IndexPath) -> Void",
  "onItemLongClick": "(Conversation, IndexPath) -> Void",
  "onBack": "() -> Void",
  "onError": "(CometChatException) -> Void",
  "onEmpty": "() -> Void",
  "onLoad": "([Conversation]) -> Void"
}
```

---

### `visibility`

Boolean properties that show or hide UI elements.

| Category | Purpose |
|----------|---------|
| `visibility` | Toggle visibility of component sub-elements |

**Structure:**
```json
"visibility": {
  "hidePropName": {
    "type": "Bool",
    "default": false
  }
}
```

**Examples:**
```json
"visibility": {
  "hideSearch": { "type": "Bool", "default": false },
  "hideReceipts": { "type": "Bool", "default": false },
  "hideUserStatus": { "type": "Bool", "default": false },
  "hideGroupType": { "type": "Bool", "default": false },
  "hideNavigationBar": { "type": "Bool", "default": false },
  "hideBackButton": { "type": "Bool", "default": false }
}
```

---

### `sound`

Properties that configure audio feedback.

| Category | Purpose |
|----------|---------|
| `sound` | Sound effects, audio notifications, mute settings |

**Structure:**
```json
"sound": {
  "soundPropName": {
    "type": "TypeName",
    "default": "defaultValue"
  }
}
```

**Examples:**
```json
"sound": {
  "enableSoundForMessages": { "type": "Bool", "default": true },
  "customSoundForMessages": { "type": "URL?", "default": "nil" },
  "disableSoundForCalls": { "type": "Bool", "default": false }
}
```

---

### `selection`

Properties that configure selection behavior.

| Category | Purpose |
|----------|---------|
| `selection` | Selection mode, multi-select, selection callbacks |

**Structure:**
```json
"selection": {
  "selectionPropName": {
    "type": "TypeName",
    "default": "defaultValue"
  }
}
```

**Examples:**
```json
"selection": {
  "selectionMode": { "type": "SelectionMode", "default": ".none" },
  "onSelection": { "type": "([Conversation]) -> Void", "default": "nil" },
  "selectionLimit": { "type": "Int?", "default": "nil" }
}
```

---

### `viewSlots`

Customization points where developers can inject custom UI.

| Category | Purpose |
|----------|---------|
| `viewSlots` | Custom view injection points, view builders |

**Structure:**
```json
"viewSlots": {
  "slotName": "type signature"
}
```

**Examples:**
```json
"viewSlots": {
  "listItemView": "(Conversation) -> UIView",
  "subtitleView": "(Conversation) -> UIView",
  "tailView": "(Conversation) -> UIView",
  "emptyStateView": "UIView",
  "errorStateView": "UIView",
  "loadingStateView": "UIView"
}
```

---

### `formatting`

Properties that configure text and date formatting.

| Category | Purpose |
|----------|---------|
| `formatting` | Date formatters, text formatters, number formatters |

**Structure:**
```json
"formatting": {
  "formatterPropName": {
    "type": "TypeName",
    "default": "defaultValue"
  }
}
```

**Examples:**
```json
"formatting": {
  "datePattern": { "type": "(Conversation) -> String", "default": "nil" },
  "textFormatters": { "type": "[CometChatTextFormatter]", "default": "[]" },
  "mentionAllLabel": { "type": "(String, String) -> Self", "default": "nil" }
}
```

---

## Complete Example

Here's a complete AI Agent Component Spec for a Conversations component:

```json
{
  "component": "CometChatConversations",
  "package": "CometChatUIKitSwift",
  "import": "import CometChatUIKitSwift\nimport CometChatSDK",
  "description": "Displays a list of all conversations for the logged-in user with real-time updates for messages, typing indicators, and presence.",
  "inherits": "UIViewController",
  "primaryOutput": {
    "callback": "onItemClick",
    "type": "(Conversation, IndexPath) -> Void"
  },
  "props": {
    "data": {
      "conversationRequestBuilder": {
        "type": "ConversationRequest.ConversationRequestBuilder?",
        "default": "nil",
        "note": "Custom request builder for filtering conversations"
      }
    },
    "callbacks": {
      "onItemClick": "(Conversation, IndexPath) -> Void",
      "onItemLongClick": "(Conversation, IndexPath) -> Void",
      "onBack": "() -> Void",
      "onError": "(CometChatException) -> Void",
      "onEmpty": "() -> Void",
      "onLoad": "([Conversation]) -> Void"
    },
    "visibility": {
      "hideSearch": { "type": "Bool", "default": false },
      "hideReceipts": { "type": "Bool", "default": false },
      "hideUserStatus": { "type": "Bool", "default": false },
      "hideGroupType": { "type": "Bool", "default": false },
      "hideDeleteConversationOption": { "type": "Bool", "default": false },
      "hideNavigationBar": { "type": "Bool", "default": false },
      "hideBackButton": { "type": "Bool", "default": false }
    },
    "viewSlots": {
      "listItemView": "(Conversation) -> UIView",
      "subtitleView": "(Conversation) -> UIView",
      "emptyStateView": "UIView",
      "errorStateView": "UIView",
      "loadingStateView": "UIView"
    },
    "formatting": {
      "datePattern": "(Conversation) -> String",
      "mentionAllLabel": "(String, String) -> Self"
    }
  },
  "events": [
    {
      "name": "ccConversationDelete",
      "payload": "Conversation",
      "description": "Fires when a conversation is deleted"
    }
  ],
  "sdkListeners": [
    "onMessageReceived",
    "onMessageEdited",
    "onMessageDeleted",
    "onTypingStarted",
    "onTypingEnded",
    "onUserOnline",
    "onUserOffline",
    "onGroupMemberJoined",
    "onGroupMemberLeft"
  ],
  "compositionExample": {
    "description": "Conversations list navigating to Messages",
    "components": ["CometChatConversations", "CometChatMessages"],
    "flow": "User taps conversation → onItemClick fires → Navigate to CometChatMessages with user/group"
  },
  "types": {
    "ConversationsStyle": {
      "backgroundColor": "UIColor",
      "titleFont": "UIFont",
      "titleColor": "UIColor",
      "listItemTitleTextColor": "UIColor",
      "listItemTitleFont": "UIFont",
      "listItemSubTitleTextColor": "UIColor",
      "listItemSubTitleFont": "UIFont"
    }
  }
}
```

---

## Validation Rules Summary

### Required Field Validation

| Field | Rule |
|-------|------|
| `component` | Non-empty string, PascalCase |
| `package` | Non-empty string, valid package identifier |
| `import` | Non-empty string, valid import syntax |
| `description` | Non-empty string, 1-2 sentences |

### Optional Field Validation

| Field | Rule |
|-------|------|
| `inherits` | String if present |
| `primaryOutput` | Object with `callback` and `type` strings |
| `props` | Object with valid category keys only |
| `events` | Array of objects with `name`, `payload`, `description` |
| `sdkListeners` | Array of strings |
| `compositionExample` | Object with `description`, `components`, `flow` |
| `types` | Object with type definitions |

### Props Category Validation

| Category | Valid Keys |
|----------|------------|
| `data` | Any prop name with `type`, `default`, optional `note` |
| `callbacks` | Any callback name with type signature string |
| `visibility` | Any `hide*` prop with `type: Bool`, `default` |
| `sound` | Any sound-related prop with `type`, `default` |
| `selection` | Any selection-related prop with `type`, `default` |
| `viewSlots` | Any slot name with type signature string |
| `formatting` | Any formatter prop with `type`, `default` |

### Event Object Validation

| Field | Rule |
|-------|------|
| `name` | Required, non-empty string |
| `payload` | Required, non-empty string (type name) |
| `description` | Required, non-empty string |

---

## Usage in Documentation

### Accordion Wrapper

All AI Agent Component Specs MUST be wrapped in an Accordion component:

```mdx
<Accordion title="AI Agent Component Spec">
```json
{
  "component": "ComponentName",
  ...
}
```
</Accordion>
```

### Placement

The AI Agent Component Spec Accordion MUST appear:
- At the top of the component documentation page
- After the frontmatter and introductory paragraph
- Before the "Prerequisites" or "Where It Fits" section

### Consistency with Documentation

The AI Agent Component Spec MUST be consistent with the rest of the documentation:
- Events listed in `events` must match the Events section table
- Callbacks in `props.callbacks` must match the Actions Reference table
- View slots in `props.viewSlots` must match the Custom View Slots section
- SDK listeners in `sdkListeners` must match the SDK Events table

---

## Platform Adaptation Notes

When adapting this schema for different platforms, adjust type signatures accordingly:

| Concept | iOS (Swift) | Android (Kotlin) | Flutter (Dart) | React Native (TS) |
|---------|-------------|------------------|----------------|-------------------|
| Closure | `(T) -> Void` | `(T) -> Unit` | `void Function(T)` | `(t: T) => void` |
| Optional | `T?` | `T?` | `T?` | `T \| undefined` |
| Color | `UIColor` | `Color` | `Color` | `ColorValue` |
| Font | `UIFont` | `Typeface` | `TextStyle` | `TextStyle` |
| View | `UIView` | `View` | `Widget` | `ReactNode` |
