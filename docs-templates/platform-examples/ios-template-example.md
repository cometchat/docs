# iOS (Swift/UIKit) Platform Template Example

This is a complete, filled-in example of the component page template using iOS/Swift syntax. It demonstrates all iOS-specific patterns including imports, closure syntax with `[weak self]`, UIKit types, struct-based styling, and RequestBuilder patterns.

The example uses `CometChatConversations` as the reference component.

---

## Complete iOS Component Page Example

```mdx
---
title: "Conversations"
description: "Display and manage all chat conversations for the logged-in user"
---

The `CometChatConversations` component displays a list of all conversations (one-on-one and group chats) for the currently logged-in user. It shows the last message, unread count, typing indicators, and user presence in real-time.

<Frame>
  <img src="/images/conversations-hero.png" />
</Frame>

<!-- ============================================================ -->
<!-- AI AGENT COMPONENT SPEC SECTION                               -->
<!-- ============================================================ -->

<Accordion title="AI Agent Component Spec">
```json
{
  "component": "CometChatConversations",
  "package": "CometChatUIKitSwift",
  "import": "import CometChatUIKitSwift\nimport CometChatSDK",
  "description": "Displays a list of all conversations for the logged-in user with real-time updates",
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
      "onSelection": "([Conversation]) -> Void",
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
    "sound": {
      "disableSoundForMessages": { "type": "Bool", "default": false }
    },
    "selection": {
      "selectionMode": { "type": "SelectionMode", "default": ".none" }
    },
    "viewSlots": {
      "listItemView": "(Conversation) -> UIView",
      "subtitleView": "(Conversation) -> UIView",
      "tailView": "(Conversation) -> UIView",
      "emptyStateView": "() -> UIView",
      "errorStateView": "() -> UIView",
      "loadingStateView": "() -> UIView"
    },
    "formatting": {
      "datePattern": "(Conversation) -> String"
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
    "description": "Conversations typically navigates to Messages when a conversation is selected",
    "components": ["CometChatConversations", "CometChatMessages"],
    "flow": "User taps conversation → onItemClick fires → Navigate to CometChatMessages with user/group"
  },
  "types": {
    "Conversation": {
      "conversationId": "String?",
      "conversationType": "ConversationType",
      "conversationWith": "AppEntity?",
      "lastMessage": "BaseMessage?",
      "unreadMessageCount": "Int"
    },
    "ConversationType": {
      "user": "One-on-one conversation",
      "group": "Group conversation",
      "both": "All conversation types"
    }
  }
}
```
</Accordion>

---

<!-- ============================================================ -->
<!-- WHERE IT FITS SECTION                                         -->
<!-- ============================================================ -->

## Where It Fits

`CometChatConversations` serves as the main entry point for chat functionality. It displays all conversations and navigates to `CometChatMessages` when a conversation is selected.

```swift
import UIKit
import CometChatUIKitSwift
import CometChatSDK

class ChatListViewController: UIViewController {
    
    private var conversationsController: CometChatConversations!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupConversations()
    }
    
    private func setupConversations() {
        conversationsController = CometChatConversations()
        
        // Handle conversation selection - navigate to messages
        conversationsController.set(onItemClick: { [weak self] conversation, indexPath in
            self?.openMessages(for: conversation)
        })
        
        navigationController?.pushViewController(conversationsController, animated: true)
    }
    
    private func openMessages(for conversation: Conversation) {
        let messagesVC = CometChatMessages()
        
        if let user = conversation.conversationWith as? User {
            messagesVC.set(user: user)
        } else if let group = conversation.conversationWith as? Group {
            messagesVC.set(group: group)
        }
        
        navigationController?.pushViewController(messagesVC, animated: true)
    }
}
```

<Frame>
  <img src="/images/conversations-context.png" />
</Frame>

---

<!-- ============================================================ -->
<!-- MINIMAL RENDER SECTION                                        -->
<!-- ============================================================ -->

## Minimal Render

```swift
import CometChatUIKitSwift

let conversations = CometChatConversations()
navigationController?.pushViewController(conversations, animated: true)
```

<Frame>
  <img src="/images/conversations-default.png" />
</Frame>

---

<!-- ============================================================ -->
<!-- FILTERING SECTION                                             -->
<!-- ============================================================ -->

## Filtering

Use `ConversationRequest.ConversationRequestBuilder` to filter which conversations appear in the list. The builder pattern allows chaining multiple filter conditions.

```swift
import CometChatUIKitSwift
import CometChatSDK

// Create a custom request builder
let requestBuilder = ConversationRequest.ConversationRequestBuilder(limit: 30)
    .set(conversationType: .both)

let conversations = CometChatConversations(conversationRequestBuilder: requestBuilder)
```

### Filter Recipes

| Recipe | Code |
|--------|------|
| Show only one-on-one chats | `.set(conversationType: .user)` |
| Show only group chats | `.set(conversationType: .group)` |
| Filter by tags | `.withTags(true).set(tags: ["support", "sales"])` |
| Limit results | `ConversationRequestBuilder(limit: 20)` |
| Include user/group tags | `.withUserAndGroupTags(true)` |

---

<!-- ============================================================ -->
<!-- ACTIONS AND EVENTS SECTION                                    -->
<!-- ============================================================ -->

## Actions and Events

### Callback Props

#### onItemClick

Fires when a user taps on a conversation. Use this to navigate to the messages screen.

```swift
import CometChatUIKitSwift
import CometChatSDK

let conversations = CometChatConversations()

conversations.set(onItemClick: { [weak self] conversation, indexPath in
    guard let self = self else { return }
    
    let messagesVC = CometChatMessages()
    
    if let user = conversation.conversationWith as? User {
        messagesVC.set(user: user)
    } else if let group = conversation.conversationWith as? Group {
        messagesVC.set(group: group)
    }
    
    self.navigationController?.pushViewController(messagesVC, animated: true)
})
```

#### onItemLongClick

Fires when a user long-presses on a conversation. Use this to show additional options like delete or mute.

```swift
import CometChatUIKitSwift
import CometChatSDK

let conversations = CometChatConversations()

conversations.set(onItemLongClick: { [weak self] conversation, indexPath in
    guard let self = self else { return }
    
    let alert = UIAlertController(title: "Options", message: nil, preferredStyle: .actionSheet)
    
    alert.addAction(UIAlertAction(title: "Delete", style: .destructive) { [weak self] _ in
        self?.deleteConversation(conversation)
    })
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
    self.present(alert, animated: true)
})
```

#### onError

Fires when an error occurs while loading conversations.

```swift
import CometChatUIKitSwift

let conversations = CometChatConversations()

conversations.set(onError: { error in
    print("Error loading conversations: \(error.errorDescription)")
})
```

#### onEmpty

Fires when the conversation list is empty.

```swift
import CometChatUIKitSwift

let conversations = CometChatConversations()

conversations.set(onEmpty: {
    print("No conversations found")
})
```

#### onLoad

Fires when conversations are successfully loaded.

```swift
import CometChatUIKitSwift
import CometChatSDK

let conversations = CometChatConversations()

conversations.set(onLoad: { conversations in
    print("Loaded \(conversations.count) conversations")
})
```

### Actions Reference

| Method | Description | Example |
|--------|-------------|---------|
| `set(onItemClick:)` | Triggered when a conversation is tapped | Navigate to messages |
| `set(onItemLongClick:)` | Triggered on long press | Show options menu |
| `set(onBack:)` | Triggered when back button is pressed | Custom navigation |
| `set(onSelection:)` | Triggered in selection mode | Multi-select conversations |
| `set(onError:)` | Triggered when an error occurs | Show error alert |
| `set(onEmpty:)` | Triggered when list is empty | Show empty state |
| `set(onLoad:)` | Triggered when conversations load | Analytics tracking |

### Global UI Events

| Event | Fires when | Payload |
|-------|------------|---------|
| `ccConversationDelete` | A conversation is deleted | `Conversation` |

### SDK Events (Real-Time, Automatic)

| SDK Listener | Internal behavior |
|--------------|-------------------|
| `onMessageReceived` | Updates last message and moves conversation to top |
| `onMessageEdited` | Updates last message preview if edited message is latest |
| `onMessageDeleted` | Updates last message preview if deleted message was latest |
| `onTypingStarted` | Shows typing indicator for the conversation |
| `onTypingEnded` | Hides typing indicator for the conversation |
| `onUserOnline` | Updates online status indicator for user conversations |
| `onUserOffline` | Updates offline status indicator for user conversations |
| `onGroupMemberJoined` | Updates group member count |
| `onGroupMemberLeft` | Updates group member count |

---

<!-- ============================================================ -->
<!-- CUSTOM VIEW SLOTS SECTION                                     -->
<!-- ============================================================ -->

## Custom View Slots

| Slot | Signature | Replaces |
|------|-----------|----------|
| `listItemView` | `(Conversation) -> UIView` | Entire conversation row |
| `subtitleView` | `(Conversation) -> UIView` | Subtitle area below name |
| `tailView` | `(Conversation) -> UIView` | Right side (time, badge) |
| `emptyStateView` | `() -> UIView` | Empty state display |
| `errorStateView` | `() -> UIView` | Error state display |
| `loadingStateView` | `() -> UIView` | Loading state display |

### listItemView

Replace the entire conversation row with a custom design.

Default:
<Frame>
  <img src="/images/conversations-listitem-default.png" />
</Frame>

Customized:
<Frame>
  <img src="/images/conversations-listitem-custom.png" />
</Frame>

```swift
import UIKit
import CometChatUIKitSwift
import CometChatSDK

let conversations = CometChatConversations()

conversations.set(listItemView: { conversation in
    let customView = CustomConversationCell()
    customView.configure(with: conversation)
    return customView
})

// CustomConversationCell.swift
class CustomConversationCell: UIView {
    
    private let avatarView = CometChatAvatar(image: UIImage())
    private let nameLabel = UILabel()
    private let messageLabel = UILabel()
    private let timeLabel = UILabel()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupUI() {
        nameLabel.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        messageLabel.font = UIFont.systemFont(ofSize: 14)
        messageLabel.textColor = UIColor.secondaryLabel
        timeLabel.font = UIFont.systemFont(ofSize: 12)
        timeLabel.textColor = UIColor.tertiaryLabel
        
        // Add subviews and constraints...
    }
    
    func configure(with conversation: Conversation) {
        if let user = conversation.conversationWith as? User {
            nameLabel.text = user.name
            avatarView.setAvatar(avatarUrl: user.avatar, with: user.name ?? "")
        } else if let group = conversation.conversationWith as? Group {
            nameLabel.text = group.name
            avatarView.setAvatar(avatarUrl: group.icon, with: group.name ?? "")
        }
        
        if let textMessage = conversation.lastMessage as? TextMessage {
            messageLabel.text = textMessage.text
        }
    }
}
```

### subtitleView

Customize just the subtitle area below the conversation name.

Default:
<Frame>
  <img src="/images/conversations-subtitle-default.png" />
</Frame>

Customized:
<Frame>
  <img src="/images/conversations-subtitle-custom.png" />
</Frame>

```swift
import UIKit
import CometChatUIKitSwift
import CometChatSDK

let conversations = CometChatConversations()

conversations.set(subtitleView: { conversation in
    let label = UILabel()
    label.font = UIFont.systemFont(ofSize: 13)
    label.textColor = UIColor.secondaryLabel
    
    if let textMessage = conversation.lastMessage as? TextMessage {
        label.text = textMessage.text
    } else if conversation.lastMessage is MediaMessage {
        label.text = "📷 Photo"
    } else {
        label.text = "No messages yet"
    }
    
    return label
})
```

---

<!-- ============================================================ -->
<!-- STYLING SECTION                                               -->
<!-- ============================================================ -->

## Styling

### Style Hierarchy

1. Global styles (`CometChatConversation.style`) apply to all instances
2. Instance styles override global for specific instances

### Global Level Styling

```swift
import UIKit
import CometChatUIKitSwift

// Apply global styles that affect all CometChatConversations instances
CometChatConversation.style.backgroundColor = UIColor.systemBackground
CometChatConversation.style.titleFont = UIFont.systemFont(ofSize: 17, weight: .bold)
CometChatConversation.style.titleColor = UIColor.label
CometChatConversation.style.listItemTitleTextColor = UIColor.label
CometChatConversation.style.listItemSubTitleTextColor = UIColor.secondaryLabel

// Custom avatar style
let avatarStyle = AvatarStyle()
avatarStyle.backgroundColor = UIColor(red: 0.41, green: 0.32, blue: 0.84, alpha: 1.0)
avatarStyle.cornerRadius = 8
CometChatConversation.style.avatarStyle = avatarStyle

// Custom badge style for unread count
let badgeStyle = BadgeStyle()
badgeStyle.backgroundColor = UIColor.systemRed
badgeStyle.cornerRadius = CometChatCornerStyle(cornerRadius: 10)
CometChatConversation.style.badgeStyle = badgeStyle
```

### Instance Level Styling

```swift
import UIKit
import CometChatUIKitSwift

// Create a custom style for a specific instance
var customStyle = ConversationsStyle()
customStyle.backgroundColor = UIColor(red: 0.95, green: 0.95, blue: 0.97, alpha: 1.0)
customStyle.titleColor = UIColor(red: 0.2, green: 0.2, blue: 0.2, alpha: 1.0)
customStyle.listItemBackground = UIColor.white
customStyle.listItemCornerRadius = CometChatCornerStyle(cornerRadius: 12)

let conversations = CometChatConversations()
conversations.style = customStyle
```

<Frame>
  <img src="/images/conversations-styled.png" />
</Frame>

### Key Style Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `backgroundColor` | `UIColor` | `CometChatTheme.backgroundColor01` | Background color of the list |
| `titleFont` | `UIFont?` | `CometChatTypography.setFont(size: 17, weight: .bold)` | Font for the navigation title |
| `titleColor` | `UIColor?` | `CometChatTheme.textColorPrimary` | Color for the navigation title |
| `listItemTitleTextColor` | `UIColor` | `CometChatTheme.textColorPrimary` | Color for conversation names |
| `listItemTitleFont` | `UIFont` | `CometChatTypography.Heading4.medium` | Font for conversation names |
| `listItemSubTitleTextColor` | `UIColor` | `CometChatTheme.textColorSecondary` | Color for last message preview |
| `listItemSubTitleFont` | `UIFont` | `CometChatTypography.Body.regular` | Font for last message preview |
| `listItemBackground` | `UIColor` | `.clear` | Background color for list items |
| `listItemCornerRadius` | `CometChatCornerStyle` | `CometChatCornerStyle(cornerRadius: 0)` | Corner radius for list items |
| `borderWidth` | `CGFloat` | `0` | Border width for the component |
| `borderColor` | `UIColor` | `.clear` | Border color for the component |

### Customization Matrix

| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
| Background color | Style | `backgroundColor` | `UIColor.systemBackground` |
| Title appearance | Style | `titleFont`, `titleColor` | `UIFont.boldSystemFont(ofSize: 18)` |
| List item look | Style | `listItemBackground` | `UIColor(white: 0.95, alpha: 1.0)` |
| Unread badge | Style | `badgeStyle` | `BadgeStyle()` with custom colors |
| Avatar appearance | Style | `avatarStyle` | `AvatarStyle()` with custom radius |
| Hide search | Property | `hideSearch` | `conversations.hideSearch = true` |
| Hide receipts | Property | `hideReceipts` | `conversations.hideReceipts = true` |
| Custom row | View Slot | `set(listItemView:)` | See Custom View Slots section |

---

<!-- ============================================================ -->
<!-- PROPS SECTION                                                 -->
<!-- ============================================================ -->

## Props

All props are optional. Sorted alphabetically.

### conversationRequestBuilder

Custom request builder for filtering which conversations appear.

| | |
|---|---|
| Type | `ConversationRequest.ConversationRequestBuilder?` |
| Default | `nil` |

### disableSoundForMessages

Disables notification sounds for new messages.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### hideBackButton

Hides the back button in the navigation bar.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### hideDeleteConversationOption

Hides the delete option in conversation actions.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### hideGroupType

Hides the public/private group type icons.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### hideNavigationBar

Hides the entire navigation bar.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### hideReceipts

Hides read/delivered receipt indicators.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### hideSearch

Hides the search bar.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### hideUserStatus

Hides online/offline status indicators.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### selectionMode

Sets the selection mode for multi-select functionality.

| | |
|---|---|
| Type | `SelectionMode` |
| Default | `.none` |

---

<!-- ============================================================ -->
<!-- EVENTS SECTION                                                -->
<!-- ============================================================ -->

## Events

| Event | Payload | Fires when |
|-------|---------|------------|
| `ccConversationDelete` | `Conversation` | A conversation is deleted from the list |

---

<!-- ============================================================ -->
<!-- DATE TIME FORMATTER SECTION                                   -->
<!-- ============================================================ -->

## Date Time Formatter

Customize how timestamps appear in the conversation list using the `datePattern` callback.

### Global Level Formatting

```swift
import CometChatUIKitSwift

// Set a global date pattern for all conversations instances
CometChatConversations.datePattern = { conversation in
    guard let sentAt = conversation.lastMessage?.sentAt else { return "" }
    
    let date = Date(timeIntervalSince1970: TimeInterval(sentAt))
    let formatter = DateFormatter()
    
    if Calendar.current.isDateInToday(date) {
        formatter.dateFormat = "h:mm a"
    } else if Calendar.current.isDateInYesterday(date) {
        return "Yesterday"
    } else {
        formatter.dateFormat = "MMM d"
    }
    
    return formatter.string(from: date)
}
```

### Instance Level Formatting

```swift
import CometChatUIKitSwift

let conversations = CometChatConversations()

conversations.set(datePattern: { conversation in
    guard let sentAt = conversation.lastMessage?.sentAt else { return "" }
    
    let date = Date(timeIntervalSince1970: TimeInterval(sentAt))
    let formatter = DateFormatter()
    
    if Calendar.current.isDateInToday(date) {
        formatter.dateFormat = "HH:mm"  // 24-hour format
    } else if Calendar.current.isDateInYesterday(date) {
        return "Yesterday"
    } else if Calendar.current.isDate(date, equalTo: Date(), toGranularity: .weekOfYear) {
        formatter.dateFormat = "EEEE"  // Day name
    } else {
        formatter.dateFormat = "dd/MM/yy"
    }
    
    return formatter.string(from: date)
})
```

### Available Formatters

| Formatter | Purpose | Default Format |
|-----------|---------|----------------|
| `datePattern` | Format for all timestamps | `h:mm a` for today, `MMM d` for older |

### Common Customizations

```swift
import CometChatUIKitSwift

let conversations = CometChatConversations()

// 24-hour time format
conversations.set(datePattern: { conversation in
    guard let sentAt = conversation.lastMessage?.sentAt else { return "" }
    let date = Date(timeIntervalSince1970: TimeInterval(sentAt))
    let formatter = DateFormatter()
    formatter.dateFormat = "HH:mm"
    return formatter.string(from: date)
})

// Relative time (e.g., "2h ago")
conversations.set(datePattern: { conversation in
    guard let sentAt = conversation.lastMessage?.sentAt else { return "" }
    let date = Date(timeIntervalSince1970: TimeInterval(sentAt))
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .abbreviated
    return formatter.localizedString(for: date, relativeTo: Date())
})
```

---

<!-- ============================================================ -->
<!-- MENTION CONFIGURATION SECTION                                 -->
<!-- ============================================================ -->

## Mention Configuration

Configure how @all mentions appear in conversation list items. When a message contains an @all mention, the conversation subtitle displays the mention with a customizable label.

### setMentionAllLabel

Sets a custom label for @all mentions displayed in conversation list items.

```swift
@discardableResult
public func setMentionAllLabel(_ id: String, _ label: String) -> Self
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `String` | The identifier for the @all mention (typically "all") |
| `label` | `String` | The display text shown to users when @all is mentioned |

```swift
import CometChatUIKitSwift

let conversations = CometChatConversations()

// Set a custom label for @all mentions
conversations.setMentionAllLabel("all", "Everyone")
```

```swift
import UIKit
import CometChatUIKitSwift
import CometChatSDK

class MentionConfiguredViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let conversations = CometChatConversations()
            .setMentionAllLabel("all", "Team Members")
            .set(onItemClick: { [weak self] conversation, indexPath in
                self?.openMessages(for: conversation)
            })
        
        navigationController?.pushViewController(conversations, animated: true)
    }
    
    private func openMessages(for conversation: Conversation) {
        let messagesVC = CometChatMessages()
        
        if let user = conversation.conversationWith as? User {
            messagesVC.set(user: user)
        } else if let group = conversation.conversationWith as? Group {
            messagesVC.set(group: group)
        }
        
        navigationController?.pushViewController(messagesVC, animated: true)
    }
}
```

---

<!-- ============================================================ -->
<!-- TROUBLESHOOTING SECTION                                       -->
<!-- ============================================================ -->

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Empty conversation list | Ensure user is logged in and has existing conversations |
| Conversations not updating in real-time | Check that CometChat SDK is properly initialized and connected |
| Navigation not working | Verify `navigationController` is not nil; embed in UINavigationController |
| Custom views not appearing | Ensure custom view has proper constraints and non-zero frame |
| Typing indicator not showing | Verify `hideTypingIndicator` is not set to true |

---

<!-- ============================================================ -->
<!-- RELATED COMPONENTS SECTION                                    -->
<!-- ============================================================ -->

## Related Components

- [Messages](/ui-kit/ios/messages) - Display messages in a conversation
- [Users](/ui-kit/ios/users) - List all users to start new conversations
- [Groups](/ui-kit/ios/groups) - List all groups
- [Message Composer](/ui-kit/ios/message-composer) - Send messages in a conversation
- [Conversation With Messages](/ui-kit/ios/conversation-with-messages) - Combined conversations and messages view
```

---

## iOS-Specific Patterns Reference

### Import Patterns

Always include both imports when using CometChat types:

```swift
import CometChatUIKitSwift  // UI components
import CometChatSDK         // SDK types (User, Group, Conversation, etc.)
```

### Closure Syntax with [weak self]

Always use `[weak self]` in closures that reference `self` to prevent retain cycles:

```swift
// ✅ Correct - uses [weak self]
conversations.set(onItemClick: { [weak self] conversation, indexPath in
    guard let self = self else { return }
    self.openMessages(for: conversation)
})

// ❌ Incorrect - can cause memory leaks
conversations.set(onItemClick: { conversation, indexPath in
    self.openMessages(for: conversation)  // Strong reference to self
})
```

### UIKit Type Prefixes

iOS uses UIKit types with `UI` prefix:

| Type | Usage |
|------|-------|
| `UIColor` | Colors (e.g., `UIColor.systemBackground`) |
| `UIFont` | Fonts (e.g., `UIFont.systemFont(ofSize: 16)`) |
| `UIImage` | Images (e.g., `UIImage(systemName: "message")`) |
| `UIView` | Views (e.g., custom view slots return `UIView`) |
| `UIViewController` | View controllers (e.g., `CometChatConversations`) |

### Struct-Based Style System

iOS uses struct-based styles for customization:

```swift
// Create a style struct
var style = ConversationsStyle()
style.backgroundColor = UIColor.systemBackground
style.titleColor = UIColor.label

// Apply to component
let conversations = CometChatConversations()
conversations.style = style

// Or use global styles
CometChatConversation.style.backgroundColor = UIColor.systemBackground
```

### RequestBuilder Pattern

iOS uses the builder pattern for filtering:

```swift
let requestBuilder = ConversationRequest.ConversationRequestBuilder(limit: 30)
    .set(conversationType: .both)
    .withTags(true)
    .set(tags: ["support"])

let conversations = CometChatConversations(conversationRequestBuilder: requestBuilder)
```

### Method Chaining

iOS components support fluent method chaining:

```swift
let conversations = CometChatConversations()
    .setMentionAllLabel("all", "Everyone")
    .set(onItemClick: { [weak self] conversation, indexPath in
        self?.handleTap(conversation)
    })
    .set(onError: { error in
        print("Error: \(error.errorDescription)")
    })
```
