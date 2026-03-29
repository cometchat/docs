# Flutter (Dart) Platform Template Example

This is a complete, filled-in example of the component page template using Flutter/Dart syntax. It demonstrates all Flutter-specific patterns including imports, Dart callback syntax, Flutter types (Color, TextStyle), ThemeData + widget parameter styling, and named parameter builder patterns.

The example uses `CometChatConversations` as the reference component.

---

## Complete Flutter Component Page Example

```mdx
---
title: "Conversations"
description: "Display and manage all chat conversations for the logged-in user"
---

The `CometChatConversations` widget displays a list of all conversations (one-on-one and group chats) for the currently logged-in user. It shows the last message, unread count, typing indicators, and user presence in real-time.

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
  "package": "cometchat_uikit",
  "import": "import 'package:cometchat_uikit/cometchat_uikit.dart';",
  "description": "Displays a list of all conversations for the logged-in user with real-time updates",
  "inherits": "StatefulWidget",
  "primaryOutput": {
    "callback": "onItemTap",
    "type": "Function(Conversation)?"
  },
  "props": {
    "data": {
      "conversationsRequestBuilder": {
        "type": "ConversationsRequestBuilder?",
        "default": "null",
        "note": "Custom request builder for filtering conversations"
      }
    },
    "callbacks": {
      "onItemTap": "Function(Conversation)?",
      "onItemLongPress": "Function(Conversation)?",
      "onBack": "VoidCallback?",
      "onSelection": "Function(List<Conversation>)?",
      "onError": "Function(CometChatException)?",
      "onEmpty": "VoidCallback?",
      "onLoad": "Function(List<Conversation>)?"
    },
    "visibility": {
      "hideSearch": { "type": "bool", "default": false },
      "hideReceipts": { "type": "bool", "default": false },
      "hideUserStatus": { "type": "bool", "default": false },
      "hideGroupType": { "type": "bool", "default": false },
      "hideDeleteConversationOption": { "type": "bool", "default": false },
      "hideBackButton": { "type": "bool", "default": false }
    },
    "sound": {
      "disableSoundForMessages": { "type": "bool", "default": false }
    },
    "selection": {
      "selectionMode": { "type": "SelectionMode", "default": "SelectionMode.none" }
    },
    "viewSlots": {
      "listItemBuilder": "Widget Function(BuildContext, Conversation)?",
      "subtitleBuilder": "Widget Function(BuildContext, Conversation)?",
      "tailBuilder": "Widget Function(BuildContext, Conversation)?",
      "emptyStateBuilder": "Widget Function(BuildContext)?",
      "errorStateBuilder": "Widget Function(BuildContext, CometChatException)?",
      "loadingStateBuilder": "Widget Function(BuildContext)?"
    },
    "formatting": {
      "datePattern": "String Function(Conversation)?"
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
    "flow": "User taps conversation → onItemTap fires → Navigate to CometChatMessages with user/group"
  },
  "types": {
    "Conversation": {
      "conversationId": "String?",
      "conversationType": "String",
      "conversationWith": "AppEntity?",
      "lastMessage": "BaseMessage?",
      "unreadMessageCount": "int"
    },
    "ConversationType": {
      "user": "CometChatConversationType.user",
      "group": "CometChatConversationType.group"
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

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CometChatConversations(
        // Handle conversation selection - navigate to messages
        onItemTap: (conversation) {
          _openMessages(context, conversation);
        },
      ),
    );
  }

  void _openMessages(BuildContext context, Conversation conversation) {
    final conversationWith = conversation.conversationWith;
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          if (conversationWith is User) {
            return CometChatMessages(user: conversationWith);
          } else if (conversationWith is Group) {
            return CometChatMessages(group: conversationWith);
          }
          return const SizedBox.shrink();
        },
      ),
    );
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

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class MinimalConversationsScreen extends StatelessWidget {
  const MinimalConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: CometChatConversations(),
    );
  }
}
```

<Frame>
  <img src="/images/conversations-default.png" />
</Frame>

---

<!-- ============================================================ -->
<!-- FILTERING SECTION                                             -->
<!-- ============================================================ -->

## Filtering

Use `ConversationsRequestBuilder` to filter which conversations appear in the list. The builder pattern uses named parameters for configuration.

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class FilteredConversationsScreen extends StatelessWidget {
  const FilteredConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Create a custom request builder
    final requestBuilder = ConversationsRequestBuilder()
      ..limit = 30
      ..conversationType = CometChatConversationType.user;

    return Scaffold(
      body: CometChatConversations(
        conversationsRequestBuilder: requestBuilder,
      ),
    );
  }
}
```

### Filter Recipes

| Recipe | Code |
|--------|------|
| Show only one-on-one chats | `..conversationType = CometChatConversationType.user` |
| Show only group chats | `..conversationType = CometChatConversationType.group` |
| Filter by tags | `..withTags = true` then `..tags = ['support', 'sales']` |
| Limit results | `..limit = 20` |
| Include user/group tags | `..withUserAndGroupTags = true` |

---

<!-- ============================================================ -->
<!-- ACTIONS AND EVENTS SECTION                                    -->
<!-- ============================================================ -->

## Actions and Events

### Callback Props

#### onItemTap

Fires when a user taps on a conversation. Use this to navigate to the messages screen.

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class ConversationsWithTapHandler extends StatelessWidget {
  const ConversationsWithTapHandler({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CometChatConversations(
        onItemTap: (conversation) {
          final conversationWith = conversation.conversationWith;
          
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) {
                if (conversationWith is User) {
                  return CometChatMessages(user: conversationWith);
                } else if (conversationWith is Group) {
                  return CometChatMessages(group: conversationWith);
                }
                return const SizedBox.shrink();
              },
            ),
          );
        },
      ),
    );
  }
}
```

#### onItemLongPress

Fires when a user long-presses on a conversation. Use this to show additional options like delete or mute.

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class ConversationsWithLongPress extends StatelessWidget {
  const ConversationsWithLongPress({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CometChatConversations(
        onItemLongPress: (conversation) {
          showModalBottomSheet(
            context: context,
            builder: (context) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const Icon(Icons.delete, color: Colors.red),
                  title: const Text('Delete'),
                  onTap: () {
                    Navigator.pop(context);
                    _deleteConversation(conversation);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.notifications_off),
                  title: const Text('Mute'),
                  onTap: () {
                    Navigator.pop(context);
                    _muteConversation(conversation);
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _deleteConversation(Conversation conversation) {
    // Delete logic
  }

  void _muteConversation(Conversation conversation) {
    // Mute logic
  }
}
```

#### onError

Fires when an error occurs while loading conversations.

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

CometChatConversations(
  onError: (exception) {
    debugPrint('Error loading conversations: ${exception.message}');
  },
)
```

#### onEmpty

Fires when the conversation list is empty.

```dart
import 'package:cometchat_uikit/cometchat_uikit.dart';

CometChatConversations(
  onEmpty: () {
    debugPrint('No conversations found');
  },
)
```

#### onLoad

Fires when conversations are successfully loaded.

```dart
import 'package:cometchat_uikit/cometchat_uikit.dart';

CometChatConversations(
  onLoad: (conversations) {
    debugPrint('Loaded ${conversations.length} conversations');
  },
)
```

### Actions Reference

| Method | Description | Example |
|--------|-------------|---------|
| `onItemTap` | Triggered when a conversation is tapped | Navigate to messages |
| `onItemLongPress` | Triggered on long press | Show options menu |
| `onBack` | Triggered when back button is pressed | Custom navigation |
| `onSelection` | Triggered in selection mode | Multi-select conversations |
| `onError` | Triggered when an error occurs | Show error snackbar |
| `onEmpty` | Triggered when list is empty | Show empty state |
| `onLoad` | Triggered when conversations load | Analytics tracking |

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
| `listItemBuilder` | `Widget Function(BuildContext, Conversation)?` | Entire conversation row |
| `subtitleBuilder` | `Widget Function(BuildContext, Conversation)?` | Subtitle area below name |
| `tailBuilder` | `Widget Function(BuildContext, Conversation)?` | Right side (time, badge) |
| `emptyStateBuilder` | `Widget Function(BuildContext)?` | Empty state display |
| `errorStateBuilder` | `Widget Function(BuildContext, CometChatException)?` | Error state display |
| `loadingStateBuilder` | `Widget Function(BuildContext)?` | Loading state display |

### listItemBuilder

Replace the entire conversation row with a custom design.

Default:
<Frame>
  <img src="/images/conversations-listitem-default.png" />
</Frame>

Customized:
<Frame>
  <img src="/images/conversations-listitem-custom.png" />
</Frame>

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class CustomListItemConversations extends StatelessWidget {
  const CustomListItemConversations({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CometChatConversations(
        listItemBuilder: (context, conversation) {
          return CustomConversationTile(conversation: conversation);
        },
      ),
    );
  }
}

class CustomConversationTile extends StatelessWidget {
  final Conversation conversation;

  const CustomConversationTile({
    super.key,
    required this.conversation,
  });

  @override
  Widget build(BuildContext context) {
    final conversationWith = conversation.conversationWith;
    String name = '';
    String? avatarUrl;

    if (conversationWith is User) {
      name = conversationWith.name ?? '';
      avatarUrl = conversationWith.avatar;
    } else if (conversationWith is Group) {
      name = conversationWith.name ?? '';
      avatarUrl = conversationWith.icon;
    }

    String lastMessageText = '';
    final lastMessage = conversation.lastMessage;
    if (lastMessage is TextMessage) {
      lastMessageText = lastMessage.text;
    }

    return ListTile(
      leading: CometChatAvatar(
        name: name,
        image: avatarUrl,
      ),
      title: Text(
        name,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        lastMessageText,
        style: TextStyle(
          fontSize: 14,
          color: Colors.grey[600],
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      trailing: conversation.unreadMessageCount > 0
          ? Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
              child: Text(
                '${conversation.unreadMessageCount}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                ),
              ),
            )
          : null,
    );
  }
}
```

### subtitleBuilder

Customize just the subtitle area below the conversation name.

Default:
<Frame>
  <img src="/images/conversations-subtitle-default.png" />
</Frame>

Customized:
<Frame>
  <img src="/images/conversations-subtitle-custom.png" />
</Frame>

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

CometChatConversations(
  subtitleBuilder: (context, conversation) {
    final lastMessage = conversation.lastMessage;
    String subtitleText;

    if (lastMessage is TextMessage) {
      subtitleText = lastMessage.text;
    } else if (lastMessage is MediaMessage) {
      subtitleText = '📷 Photo';
    } else {
      subtitleText = 'No messages yet';
    }

    return Text(
      subtitleText,
      style: TextStyle(
        fontSize: 13,
        color: Colors.grey[600],
      ),
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );
  },
)
```

---

<!-- ============================================================ -->
<!-- STYLING SECTION                                               -->
<!-- ============================================================ -->

## Styling

### Style Hierarchy

1. ThemeData styles (via `CometChatTheme`) apply to all instances
2. Widget parameter styles override theme for specific instances

### Global Level Styling (ThemeData)

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Define custom theme
    final customTheme = CometChatTheme(
      palette: Palette(
        primary: PaletteModel(
          light: const Color(0xFF6851D6),
          dark: const Color(0xFF6851D6),
        ),
        background: PaletteModel(
          light: Colors.white,
          dark: const Color(0xFF1A1A1A),
        ),
      ),
      typography: Typography(
        heading: const TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.bold,
        ),
        body: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.normal,
        ),
      ),
    );

    return CometChatThemeProvider(
      theme: customTheme,
      child: MaterialApp(
        home: const ChatListScreen(),
      ),
    );
  }
}
```

### Instance Level Styling (Widget Parameters)

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class StyledConversationsScreen extends StatelessWidget {
  const StyledConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Create a custom style for a specific instance
    final customStyle = ConversationsStyle(
      backgroundColor: const Color(0xFFF5F5F7),
      titleStyle: const TextStyle(
        color: Color(0xFF333333),
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
      listItemTitleStyle: const TextStyle(
        color: Color(0xFF333333),
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
      listItemSubtitleStyle: TextStyle(
        color: Colors.grey[600],
        fontSize: 14,
      ),
      listItemBackgroundColor: Colors.white,
      listItemBorderRadius: BorderRadius.circular(12),
    );

    // Create custom avatar style
    final avatarStyle = AvatarStyle(
      backgroundColor: const Color(0xFF6851D6),
      borderRadius: BorderRadius.circular(8),
    );

    // Create custom badge style
    final badgeStyle = BadgeStyle(
      backgroundColor: Colors.red,
      borderRadius: BorderRadius.circular(10),
    );

    return Scaffold(
      body: CometChatConversations(
        style: customStyle,
        avatarStyle: avatarStyle,
        badgeStyle: badgeStyle,
      ),
    );
  }
}
```

<Frame>
  <img src="/images/conversations-styled.png" />
</Frame>

### Key Style Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `backgroundColor` | `Color?` | `CometChatTheme.backgroundColor01` | Background color of the list |
| `titleStyle` | `TextStyle?` | `CometChatTypography.heading` | Style for the app bar title |
| `listItemTitleStyle` | `TextStyle?` | `CometChatTypography.heading4` | Style for conversation names |
| `listItemSubtitleStyle` | `TextStyle?` | `CometChatTypography.body` | Style for last message preview |
| `listItemBackgroundColor` | `Color?` | `Colors.transparent` | Background color for list items |
| `listItemBorderRadius` | `BorderRadius?` | `BorderRadius.zero` | Corner radius for list items |
| `border` | `Border?` | `null` | Border for the component |
| `borderRadius` | `BorderRadius?` | `null` | Corner radius for the component |

### Customization Matrix

| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
| Background color | Style | `backgroundColor` | `Colors.white` |
| Title appearance | Style | `titleStyle` | `TextStyle(fontWeight: FontWeight.bold)` |
| List item look | Style | `listItemBackgroundColor` | `Color(0xFFF5F5F5)` |
| Unread badge | Widget param | `badgeStyle` | `BadgeStyle(backgroundColor: Colors.red)` |
| Avatar appearance | Widget param | `avatarStyle` | `AvatarStyle(borderRadius: BorderRadius.circular(8))` |
| Hide search | Widget param | `hideSearch` | `hideSearch: true` |
| Hide receipts | Widget param | `hideReceipts` | `hideReceipts: true` |
| Custom row | Builder | `listItemBuilder` | See Custom View Slots section |

---

<!-- ============================================================ -->
<!-- PROPS SECTION                                                 -->
<!-- ============================================================ -->

## Props

All props are optional. Sorted alphabetically.

### conversationsRequestBuilder

Custom request builder for filtering which conversations appear.

| | |
|---|---|
| Type | `ConversationsRequestBuilder?` |
| Default | `null` |

### disableSoundForMessages

Disables notification sounds for new messages.

| | |
|---|---|
| Type | `bool` |
| Default | `false` |

### hideBackButton

Hides the back button in the app bar.

| | |
|---|---|
| Type | `bool` |
| Default | `false` |

### hideDeleteConversationOption

Hides the delete option in conversation actions.

| | |
|---|---|
| Type | `bool` |
| Default | `false` |

### hideGroupType

Hides the public/private group type icons.

| | |
|---|---|
| Type | `bool` |
| Default | `false` |

### hideReceipts

Hides read/delivered receipt indicators.

| | |
|---|---|
| Type | `bool` |
| Default | `false` |

### hideSearch

Hides the search bar.

| | |
|---|---|
| Type | `bool` |
| Default | `false` |

### hideUserStatus

Hides online/offline status indicators.

| | |
|---|---|
| Type | `bool` |
| Default | `false` |

### selectionMode

Sets the selection mode for multi-select functionality.

| | |
|---|---|
| Type | `SelectionMode` |
| Default | `SelectionMode.none` |

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

### Instance Level Formatting

```dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class DateFormattedConversations extends StatelessWidget {
  const DateFormattedConversations({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CometChatConversations(
        datePattern: (conversation) {
          final sentAt = conversation.lastMessage?.sentAt;
          if (sentAt == null) return '';

          final date = DateTime.fromMillisecondsSinceEpoch(sentAt * 1000);
          final now = DateTime.now();
          final today = DateTime(now.year, now.month, now.day);
          final yesterday = today.subtract(const Duration(days: 1));
          final messageDate = DateTime(date.year, date.month, date.day);

          if (messageDate == today) {
            return DateFormat('h:mm a').format(date);
          } else if (messageDate == yesterday) {
            return 'Yesterday';
          } else if (now.difference(date).inDays < 7) {
            return DateFormat('EEEE').format(date);
          } else {
            return DateFormat('MMM d').format(date);
          }
        },
      ),
    );
  }
}
```

### Available Formatters

| Formatter | Purpose | Default Format |
|-----------|---------|----------------|
| `datePattern` | Format for all timestamps | `h:mm a` for today, `MMM d` for older |

### Common Customizations

```dart
import 'package:intl/intl.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

// 24-hour time format
CometChatConversations(
  datePattern: (conversation) {
    final sentAt = conversation.lastMessage?.sentAt;
    if (sentAt == null) return '';
    final date = DateTime.fromMillisecondsSinceEpoch(sentAt * 1000);
    return DateFormat('HH:mm').format(date);
  },
)

// Relative time (e.g., "2h ago")
CometChatConversations(
  datePattern: (conversation) {
    final sentAt = conversation.lastMessage?.sentAt;
    if (sentAt == null) return '';
    
    final date = DateTime.fromMillisecondsSinceEpoch(sentAt * 1000);
    final difference = DateTime.now().difference(date);
    
    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  },
)
```

---

<!-- ============================================================ -->
<!-- MENTION CONFIGURATION SECTION                                 -->
<!-- ============================================================ -->

## Mention Configuration

Configure how @all mentions appear in conversation list items. When a message contains an @all mention, the conversation subtitle displays the mention with a customizable label.

### setMentionAllLabel

Sets a custom label for @all mentions displayed in conversation list items.

```dart
CometChatConversations setMentionAllLabel(String id, String label)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `String` | The identifier for the @all mention (typically "all") |
| `label` | `String` | The display text shown to users when @all is mentioned |

```dart
import 'package:cometchat_uikit/cometchat_uikit.dart';

CometChatConversations(
  mentionAllLabel: MentionLabel(id: 'all', label: 'Everyone'),
)
```

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class MentionConfiguredScreen extends StatelessWidget {
  const MentionConfiguredScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CometChatConversations(
        mentionAllLabel: MentionLabel(id: 'all', label: 'Team Members'),
        onItemTap: (conversation) {
          _openMessages(context, conversation);
        },
      ),
    );
  }

  void _openMessages(BuildContext context, Conversation conversation) {
    final conversationWith = conversation.conversationWith;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          if (conversationWith is User) {
            return CometChatMessages(user: conversationWith);
          } else if (conversationWith is Group) {
            return CometChatMessages(group: conversationWith);
          }
          return const SizedBox.shrink();
        },
      ),
    );
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
| Widget not rendering | Verify `CometChatUIKit.init()` was called before using widgets |
| Custom builders not appearing | Ensure builder functions return valid Widget instances |
| Typing indicator not showing | Verify `hideTypingIndicator` is not set to true |

---

<!-- ============================================================ -->
<!-- RELATED COMPONENTS SECTION                                    -->
<!-- ============================================================ -->

## Related Components

- [Messages](/ui-kit/flutter/messages) - Display messages in a conversation
- [Users](/ui-kit/flutter/users) - List all users to start new conversations
- [Groups](/ui-kit/flutter/groups) - List all groups
- [Message Composer](/ui-kit/flutter/message-composer) - Send messages in a conversation
- [Conversation With Messages](/ui-kit/flutter/conversation-with-messages) - Combined conversations and messages view
```

---

## Flutter-Specific Patterns Reference

### Import Patterns

Flutter uses package-based imports with a single unified import:

```dart
// Primary import - includes all UI Kit components and SDK types
import 'package:cometchat_uikit/cometchat_uikit.dart';

// Additional Flutter imports as needed
import 'package:flutter/material.dart';

// For date formatting
import 'package:intl/intl.dart';
```

### Dart Callback Syntax

Flutter uses Dart function types for callbacks. Both arrow syntax and block syntax are supported:

```dart
// ✅ Arrow syntax (for single expressions)
CometChatConversations(
  onItemTap: (conversation) => _openMessages(conversation),
)

// ✅ Block syntax (for multiple statements)
CometChatConversations(
  onItemTap: (conversation) {
    debugPrint('Tapped: ${conversation.conversationId}');
    _openMessages(conversation);
  },
)

// ✅ Method reference (when signature matches)
CometChatConversations(
  onItemTap: _handleItemTap,
)

// ✅ Nullable callback with null check
CometChatConversations(
  onItemTap: shouldHandleTap ? (conversation) => _openMessages(conversation) : null,
)
```

### Flutter Type Conventions

Flutter uses standard Dart/Flutter types without prefixes:

| Type | Usage |
|------|-------|
| `Color` | Colors (e.g., `Colors.white`, `Color(0xFF6851D6)`) |
| `TextStyle` | Text styling (e.g., `TextStyle(fontSize: 16, fontWeight: FontWeight.bold)`) |
| `Widget` | UI components (e.g., builders return `Widget`) |
| `BuildContext` | Build context (e.g., passed to builder functions) |
| `BorderRadius` | Corner radius (e.g., `BorderRadius.circular(12)`) |
| `EdgeInsets` | Padding/margin (e.g., `EdgeInsets.all(16)`) |

### ThemeData + Widget Parameter Styling

Flutter supports both theme-based and widget parameter styling:

```dart
// Theme-based styling (global)
CometChatThemeProvider(
  theme: CometChatTheme(
    palette: Palette(
      primary: PaletteModel(
        light: const Color(0xFF6851D6),
        dark: const Color(0xFF6851D6),
      ),
    ),
  ),
  child: CometChatConversations(),
)

// Widget parameter styling (instance-level)
CometChatConversations(
  style: ConversationsStyle(
    backgroundColor: Colors.white,
    titleStyle: const TextStyle(fontWeight: FontWeight.bold),
  ),
  avatarStyle: AvatarStyle(
    backgroundColor: const Color(0xFF6851D6),
  ),
)
```

### Named Parameter Builder Patterns

Flutter uses named parameters with cascade notation for builders:

```dart
// ConversationsRequestBuilder with cascade notation
final requestBuilder = ConversationsRequestBuilder()
  ..limit = 30
  ..conversationType = CometChatConversationType.user
  ..withTags = true
  ..tags = ['support', 'sales'];

CometChatConversations(
  conversationsRequestBuilder: requestBuilder,
)

// UIKitSettings with named parameters
final uiKitSettings = UIKitSettings(
  appId: 'APP_ID',
  authKey: 'AUTH_KEY',
  region: 'us',
  subscribePresenceForAllUsers: true,
);

await CometChatUIKit.init(
  uiKitSettings: uiKitSettings,
  onSuccess: (message) {
    debugPrint('Initialization successful');
  },
  onError: (exception) {
    debugPrint('Error: ${exception.message}');
  },
);
```

### StatefulWidget / StatelessWidget Patterns

Flutter components can be used in both stateful and stateless widgets:

```dart
// ✅ StatelessWidget (preferred for simple cases)
class ConversationsScreen extends StatelessWidget {
  const ConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CometChatConversations(
        onItemTap: (conversation) => _openMessages(context, conversation),
      ),
    );
  }

  void _openMessages(BuildContext context, Conversation conversation) {
    // Navigation logic
  }
}

// ✅ StatefulWidget (when local state is needed)
class ConversationsScreenStateful extends StatefulWidget {
  const ConversationsScreenStateful({super.key});

  @override
  State<ConversationsScreenStateful> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreenStateful> {
  List<Conversation> _selectedConversations = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CometChatConversations(
        selectionMode: SelectionMode.multiple,
        onSelection: (conversations) {
          setState(() {
            _selectedConversations = conversations;
          });
        },
      ),
      floatingActionButton: _selectedConversations.isNotEmpty
          ? FloatingActionButton(
              onPressed: _deleteSelected,
              child: const Icon(Icons.delete),
            )
          : null,
    );
  }

  void _deleteSelected() {
    // Delete logic
  }
}
```

### Widget Composition

Flutter uses widget composition for building complex UIs:

```dart
import 'package:flutter/material.dart';
import 'package:cometchat_uikit/cometchat_uikit.dart';

class ChatApp extends StatelessWidget {
  const ChatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: CometChatThemeProvider(
        theme: CometChatTheme.light(),
        child: const ConversationsScreen(),
      ),
    );
  }
}

class ConversationsScreen extends StatelessWidget {
  const ConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chats'),
      ),
      body: CometChatConversations(
        onItemTap: (conversation) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => MessagesScreen(conversation: conversation),
            ),
          );
        },
      ),
    );
  }
}

class MessagesScreen extends StatelessWidget {
  final Conversation conversation;

  const MessagesScreen({
    super.key,
    required this.conversation,
  });

  @override
  Widget build(BuildContext context) {
    final conversationWith = conversation.conversationWith;

    if (conversationWith is User) {
      return CometChatMessages(user: conversationWith);
    } else if (conversationWith is Group) {
      return CometChatMessages(group: conversationWith);
    }

    return const Scaffold(
      body: Center(child: Text('Invalid conversation')),
    );
  }
}
```

### Memory Management (Automatic)

Flutter/Dart uses automatic garbage collection, so no manual memory management is required:

```dart
// ✅ No need for weak references or dispose patterns for callbacks
CometChatConversations(
  onItemTap: (conversation) {
    // Dart GC handles memory automatically
    _openMessages(conversation);
  },
)

// ✅ For StatefulWidget, dispose is only needed for controllers/streams you create
class _MyWidgetState extends State<MyWidget> {
  late final StreamSubscription _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = someStream.listen((data) {
      // Handle data
    });
  }

  @override
  void dispose() {
    _subscription.cancel(); // Clean up your own subscriptions
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CometChatConversations(
      onItemTap: (conversation) => _openMessages(conversation),
    );
  }
}
```
