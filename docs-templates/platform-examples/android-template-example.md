# Android (Kotlin) Platform Template Example

This is a complete, filled-in example of the component page template using Android/Kotlin syntax. It demonstrates all Android-specific patterns including imports, Kotlin lambda/SAM interface callbacks, Android types (Color, Typeface), XML styles + programmatic styling, and lifecycle-aware component patterns.

The example uses `CometChatConversations` as the reference component.

---

## Complete Android Component Page Example

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
  "package": "com.cometchat.chatuikit.conversations",
  "import": "import com.cometchat.chatuikit.conversations.CometChatConversations\nimport com.cometchat.chat.models.Conversation",
  "description": "Displays a list of all conversations for the logged-in user with real-time updates",
  "inherits": "FrameLayout",
  "primaryOutput": {
    "callback": "setOnItemClick",
    "type": "(View, Int, Conversation) -> Unit"
  },
  "props": {
    "data": {
      "conversationsRequestBuilder": {
        "type": "ConversationsRequest.ConversationsRequestBuilder?",
        "default": "null",
        "note": "Custom request builder for filtering conversations"
      }
    },
    "callbacks": {
      "setOnItemClick": "(View, Int, Conversation) -> Unit",
      "setOnItemLongClick": "(View, Int, Conversation) -> Unit",
      "setOnBackButtonPressed": "() -> Unit",
      "setOnSelection": "(List<Conversation>) -> Unit",
      "setOnError": "(CometChatException) -> Unit",
      "setOnEmpty": "() -> Unit",
      "setOnLoad": "(List<Conversation>) -> Unit"
    },
    "visibility": {
      "hideSearch": { "type": "Boolean", "default": false },
      "hideReceipts": { "type": "Boolean", "default": false },
      "hideUserStatus": { "type": "Boolean", "default": false },
      "hideGroupType": { "type": "Boolean", "default": false },
      "hideDeleteConversationOption": { "type": "Boolean", "default": false },
      "hideBackButton": { "type": "Boolean", "default": false }
    },
    "sound": {
      "disableSoundForMessages": { "type": "Boolean", "default": false }
    },
    "selection": {
      "selectionMode": { "type": "SelectionMode", "default": "SelectionMode.NONE" }
    },
    "viewSlots": {
      "setListItemView": "(Context, Conversation) -> View",
      "setSubtitleView": "(Context, Conversation) -> View",
      "setTailView": "(Context, Conversation) -> View",
      "setEmptyStateView": "(Context) -> View",
      "setErrorStateView": "(Context) -> View",
      "setLoadingStateView": "(Context) -> View"
    },
    "formatting": {
      "setDatePattern": "(Conversation) -> String"
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
    "components": ["CometChatConversations", "CometChatMessageList", "CometChatMessageComposer"],
    "flow": "User taps conversation → setOnItemClick fires → Navigate to MessageActivity with user/group"
  },
  "types": {
    "Conversation": {
      "conversationId": "String?",
      "conversationType": "String",
      "conversationWith": "AppEntity?",
      "lastMessage": "BaseMessage?",
      "unreadMessageCount": "Int"
    },
    "ConversationType": {
      "user": "CometChatConstants.CONVERSATION_TYPE_USER",
      "group": "CometChatConstants.CONVERSATION_TYPE_GROUP"
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

`CometChatConversations` serves as the main entry point for chat functionality. It displays all conversations and navigates to a message screen when a conversation is selected.

```kotlin
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.cometchat.chat.constants.CometChatConstants
import com.cometchat.chat.models.Conversation
import com.cometchat.chat.models.Group
import com.cometchat.chat.models.User
import com.cometchat.chatuikit.conversations.CometChatConversations

class ConversationActivity : AppCompatActivity() {

    private lateinit var conversationsView: CometChatConversations

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_conversation)
        
        conversationsView = findViewById(R.id.conversation_view)
        
        // Handle conversation selection - navigate to messages
        conversationsView.setOnItemClick { view, position, conversation ->
            openMessages(conversation)
        }
    }

    private fun openMessages(conversation: Conversation) {
        val intent = Intent(this, MessageActivity::class.java).apply {
            when (conversation.conversationType) {
                CometChatConstants.CONVERSATION_TYPE_GROUP -> {
                    val group = conversation.conversationWith as Group
                    putExtra("guid", group.guid)
                }
                else -> {
                    val user = conversation.conversationWith as User
                    putExtra("uid", user.uid)
                }
            }
        }
        startActivity(intent)
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

### XML Layout

```xml
<com.cometchat.chatuikit.conversations.CometChatConversations
    android:id="@+id/conversation_view"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

### Kotlin Activity

```kotlin
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)
```

<Frame>
  <img src="/images/conversations-default.png" />
</Frame>

---

<!-- ============================================================ -->
<!-- FILTERING SECTION                                             -->
<!-- ============================================================ -->

## Filtering

Use `ConversationsRequest.ConversationsRequestBuilder` to filter which conversations appear in the list. The builder pattern allows chaining multiple filter conditions.

```kotlin
import com.cometchat.chat.core.ConversationsRequest
import com.cometchat.chatuikit.conversations.CometChatConversations

// Create a custom request builder
val requestBuilder = ConversationsRequest.ConversationsRequestBuilder()
    .setLimit(30)
    .setConversationType(CometChatConstants.CONVERSATION_TYPE_USER)
    .build()

val conversations: CometChatConversations = findViewById(R.id.conversation_view)
conversations.setConversationsRequestBuilder(requestBuilder)
```

### Filter Recipes

| Recipe | Code |
|--------|------|
| Show only one-on-one chats | `.setConversationType(CometChatConstants.CONVERSATION_TYPE_USER)` |
| Show only group chats | `.setConversationType(CometChatConstants.CONVERSATION_TYPE_GROUP)` |
| Filter by tags | `.withTags(true).setTags(listOf("support", "sales"))` |
| Limit results | `.setLimit(20)` |
| Include user/group tags | `.withUserAndGroupTags(true)` |

---

<!-- ============================================================ -->
<!-- ACTIONS AND EVENTS SECTION                                    -->
<!-- ============================================================ -->

## Actions and Events

### Callback Props

#### setOnItemClick

Fires when a user taps on a conversation. Use this to navigate to the messages screen.

```kotlin
import android.content.Intent
import com.cometchat.chat.constants.CometChatConstants
import com.cometchat.chat.models.Group
import com.cometchat.chat.models.User
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations.setOnItemClick { view, position, conversation ->
    val intent = Intent(this, MessageActivity::class.java).apply {
        when (conversation.conversationType) {
            CometChatConstants.CONVERSATION_TYPE_GROUP -> {
                val group = conversation.conversationWith as Group
                putExtra("guid", group.guid)
            }
            else -> {
                val user = conversation.conversationWith as User
                putExtra("uid", user.uid)
            }
        }
    }
    startActivity(intent)
}
```

#### setOnItemLongClick

Fires when a user long-presses on a conversation. Use this to show additional options like delete or mute.

```kotlin
import android.app.AlertDialog
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations.setOnItemLongClick { view, position, conversation ->
    AlertDialog.Builder(this)
        .setTitle("Options")
        .setItems(arrayOf("Delete", "Mute")) { dialog, which ->
            when (which) {
                0 -> deleteConversation(conversation)
                1 -> muteConversation(conversation)
            }
        }
        .setNegativeButton("Cancel", null)
        .show()
}
```

#### setOnError

Fires when an error occurs while loading conversations.

```kotlin
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations.setOnError { exception ->
    Log.e("Conversations", "Error loading: ${exception.message}")
}
```

#### setOnEmpty

Fires when the conversation list is empty.

```kotlin
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations.setOnEmpty {
    Log.d("Conversations", "No conversations found")
}
```

#### setOnLoad

Fires when conversations are successfully loaded.

```kotlin
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations.setOnLoad { conversationList ->
    Log.d("Conversations", "Loaded ${conversationList.size} conversations")
}
```

### Actions Reference

| Method | Description | Example |
|--------|-------------|---------|
| `setOnItemClick` | Triggered when a conversation is tapped | Navigate to messages |
| `setOnItemLongClick` | Triggered on long press | Show options menu |
| `setOnBackButtonPressed` | Triggered when back button is pressed | Custom navigation |
| `setOnSelection` | Triggered in selection mode | Multi-select conversations |
| `setOnError` | Triggered when an error occurs | Show error toast |
| `setOnEmpty` | Triggered when list is empty | Show empty state |
| `setOnLoad` | Triggered when conversations load | Analytics tracking |

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
| `setListItemView` | `(Context, Conversation) -> View` | Entire conversation row |
| `setSubtitleView` | `(Context, Conversation) -> View` | Subtitle area below name |
| `setTailView` | `(Context, Conversation) -> View` | Right side (time, badge) |
| `setEmptyStateView` | `(Context) -> View` | Empty state display |
| `setErrorStateView` | `(Context) -> View` | Error state display |
| `setLoadingStateView` | `(Context) -> View` | Loading state display |

### setListItemView

Replace the entire conversation row with a custom design.

Default:
<Frame>
  <img src="/images/conversations-listitem-default.png" />
</Frame>

Customized:
<Frame>
  <img src="/images/conversations-listitem-custom.png" />
</Frame>

```kotlin
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.widget.TextView
import com.cometchat.chat.models.Conversation
import com.cometchat.chat.models.TextMessage
import com.cometchat.chat.models.User
import com.cometchat.chat.models.Group
import com.cometchat.chatuikit.conversations.CometChatConversations
import com.cometchat.chatuikit.shared.views.cometchatavatar.CometChatAvatar

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations.setListItemView { context, conversation ->
    val view = LayoutInflater.from(context)
        .inflate(R.layout.custom_conversation_item, null)
    
    val avatar: CometChatAvatar = view.findViewById(R.id.custom_avatar)
    val nameText: TextView = view.findViewById(R.id.name_text)
    val messageText: TextView = view.findViewById(R.id.message_text)
    val timeText: TextView = view.findViewById(R.id.time_text)
    
    when (val entity = conversation.conversationWith) {
        is User -> {
            nameText.text = entity.name
            avatar.setAvatar(entity.name, entity.avatar)
        }
        is Group -> {
            nameText.text = entity.name
            avatar.setAvatar(entity.name, entity.icon)
        }
    }
    
    (conversation.lastMessage as? TextMessage)?.let { textMessage ->
        messageText.text = textMessage.text
    }
    
    view
}
```

### setSubtitleView

Customize just the subtitle area below the conversation name.

Default:
<Frame>
  <img src="/images/conversations-subtitle-default.png" />
</Frame>

Customized:
<Frame>
  <img src="/images/conversations-subtitle-custom.png" />
</Frame>

```kotlin
import android.widget.TextView
import com.cometchat.chat.models.MediaMessage
import com.cometchat.chat.models.TextMessage
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations.setSubtitleView { context, conversation ->
    TextView(context).apply {
        textSize = 13f
        setTextColor(context.getColor(R.color.secondary_text))
        
        text = when (val lastMessage = conversation.lastMessage) {
            is TextMessage -> lastMessage.text
            is MediaMessage -> "📷 Photo"
            else -> "No messages yet"
        }
    }
}
```

---

<!-- ============================================================ -->
<!-- STYLING SECTION                                               -->
<!-- ============================================================ -->

## Styling

### Style Hierarchy

1. XML styles (defined in `styles.xml`) apply as base styles
2. Programmatic styles override XML for specific instances

### XML Styling

Define styles in your `res/values/styles.xml`:

```xml
<!-- res/values/styles.xml -->
<resources>
    <style name="CustomConversationsStyle" parent="CometChatConversationsStyle">
        <item name="cometchat_background">@color/background_primary</item>
        <item name="cometchat_title_text_color">@color/text_primary</item>
        <item name="cometchat_title_text_appearance">@style/TextAppearance.Title.Bold</item>
        <item name="cometchat_list_item_background">@color/white</item>
        <item name="cometchat_list_item_title_text_color">@color/text_primary</item>
        <item name="cometchat_list_item_subtitle_text_color">@color/text_secondary</item>
    </style>
    
    <style name="CustomAvatarStyle" parent="CometChatAvatarStyle">
        <item name="cometchat_avatar_background">@color/purple_500</item>
        <item name="cometchat_avatar_corner_radius">8dp</item>
    </style>
    
    <style name="CustomBadgeStyle" parent="CometChatBadgeStyle">
        <item name="cometchat_badge_background">@color/red_500</item>
        <item name="cometchat_badge_corner_radius">10dp</item>
    </style>
</resources>
```

Apply in XML layout:

```xml
<com.cometchat.chatuikit.conversations.CometChatConversations
    android:id="@+id/conversation_view"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    style="@style/CustomConversationsStyle" />
```

### Programmatic Styling

```kotlin
import android.graphics.Color
import android.graphics.Typeface
import com.cometchat.chatuikit.conversations.CometChatConversations
import com.cometchat.chatuikit.conversations.ConversationsStyle
import com.cometchat.chatuikit.shared.models.AvatarStyle
import com.cometchat.chatuikit.shared.models.BadgeStyle

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

// Create a custom style
val customStyle = ConversationsStyle().apply {
    background = Color.parseColor("#F5F5F7")
    titleColor = Color.parseColor("#333333")
    titleFont = Typeface.create("sans-serif-medium", Typeface.BOLD)
    listItemBackground = Color.WHITE
    listItemTitleColor = Color.parseColor("#333333")
    listItemTitleFont = Typeface.create("sans-serif", Typeface.NORMAL)
    listItemSubtitleColor = Color.parseColor("#666666")
    listItemCornerRadius = 12f
}

// Apply custom avatar style
val avatarStyle = AvatarStyle().apply {
    backgroundColor = Color.parseColor("#6851D6")
    cornerRadius = 8f
}
customStyle.avatarStyle = avatarStyle

// Apply custom badge style
val badgeStyle = BadgeStyle().apply {
    backgroundColor = Color.RED
    cornerRadius = 10f
}
customStyle.badgeStyle = badgeStyle

conversations.setStyle(customStyle)
```

<Frame>
  <img src="/images/conversations-styled.png" />
</Frame>

### Key Style Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `background` | `Int` (Color) | `CometChatTheme.backgroundColor01` | Background color of the list |
| `titleFont` | `Typeface?` | `Typeface.DEFAULT_BOLD` | Font for the navigation title |
| `titleColor` | `Int` (Color) | `CometChatTheme.textColorPrimary` | Color for the navigation title |
| `listItemTitleColor` | `Int` (Color) | `CometChatTheme.textColorPrimary` | Color for conversation names |
| `listItemTitleFont` | `Typeface` | `Typeface.DEFAULT` | Font for conversation names |
| `listItemSubtitleColor` | `Int` (Color) | `CometChatTheme.textColorSecondary` | Color for last message preview |
| `listItemSubtitleFont` | `Typeface` | `Typeface.DEFAULT` | Font for last message preview |
| `listItemBackground` | `Int` (Color) | `Color.TRANSPARENT` | Background color for list items |
| `listItemCornerRadius` | `Float` | `0f` | Corner radius for list items |
| `borderWidth` | `Float` | `0f` | Border width for the component |
| `borderColor` | `Int` (Color) | `Color.TRANSPARENT` | Border color for the component |

### Customization Matrix

| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
| Background color | Style | `background` | `Color.parseColor("#FFFFFF")` |
| Title appearance | Style | `titleFont`, `titleColor` | `Typeface.DEFAULT_BOLD` |
| List item look | Style | `listItemBackground` | `Color.parseColor("#F5F5F5")` |
| Unread badge | Style | `badgeStyle` | `BadgeStyle()` with custom colors |
| Avatar appearance | Style | `avatarStyle` | `AvatarStyle()` with custom radius |
| Hide search | Property | `hideSearch()` | `conversations.hideSearch(true)` |
| Hide receipts | Property | `hideReceipts()` | `conversations.hideReceipts(true)` |
| Custom row | View Slot | `setListItemView` | See Custom View Slots section |

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
| Type | `ConversationsRequest.ConversationsRequestBuilder?` |
| Default | `null` |

### disableSoundForMessages

Disables notification sounds for new messages.

| | |
|---|---|
| Type | `Boolean` |
| Default | `false` |

### hideBackButton

Hides the back button in the toolbar.

| | |
|---|---|
| Type | `Boolean` |
| Default | `false` |

### hideDeleteConversationOption

Hides the delete option in conversation actions.

| | |
|---|---|
| Type | `Boolean` |
| Default | `false` |

### hideGroupType

Hides the public/private group type icons.

| | |
|---|---|
| Type | `Boolean` |
| Default | `false` |

### hideReceipts

Hides read/delivered receipt indicators.

| | |
|---|---|
| Type | `Boolean` |
| Default | `false` |

### hideSearch

Hides the search bar.

| | |
|---|---|
| Type | `Boolean` |
| Default | `false` |

### hideUserStatus

Hides online/offline status indicators.

| | |
|---|---|
| Type | `Boolean` |
| Default | `false` |

### selectionMode

Sets the selection mode for multi-select functionality.

| | |
|---|---|
| Type | `SelectionMode` |
| Default | `SelectionMode.NONE` |

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

Customize how timestamps appear in the conversation list using the `setDatePattern` callback.

### Instance Level Formatting

```kotlin
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations.setDatePattern { conversation ->
    val sentAt = conversation.lastMessage?.sentAt ?: return@setDatePattern ""
    
    val date = Date(sentAt * 1000L)
    val calendar = Calendar.getInstance()
    val today = Calendar.getInstance()
    calendar.time = date
    
    when {
        isSameDay(calendar, today) -> {
            SimpleDateFormat("h:mm a", Locale.getDefault()).format(date)
        }
        isYesterday(calendar, today) -> {
            "Yesterday"
        }
        isSameWeek(calendar, today) -> {
            SimpleDateFormat("EEEE", Locale.getDefault()).format(date)
        }
        else -> {
            SimpleDateFormat("MMM d", Locale.getDefault()).format(date)
        }
    }
}

private fun isSameDay(cal1: Calendar, cal2: Calendar): Boolean {
    return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
           cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
}

private fun isYesterday(cal1: Calendar, cal2: Calendar): Boolean {
    val yesterday = cal2.clone() as Calendar
    yesterday.add(Calendar.DAY_OF_YEAR, -1)
    return isSameDay(cal1, yesterday)
}

private fun isSameWeek(cal1: Calendar, cal2: Calendar): Boolean {
    return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
           cal1.get(Calendar.WEEK_OF_YEAR) == cal2.get(Calendar.WEEK_OF_YEAR)
}
```

### Available Formatters

| Formatter | Purpose | Default Format |
|-----------|---------|----------------|
| `setDatePattern` | Format for all timestamps | `h:mm a` for today, `MMM d` for older |

### Common Customizations

```kotlin
import android.text.format.DateUtils
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

// 24-hour time format
conversations.setDatePattern { conversation ->
    val sentAt = conversation.lastMessage?.sentAt ?: return@setDatePattern ""
    val date = Date(sentAt * 1000L)
    SimpleDateFormat("HH:mm", Locale.getDefault()).format(date)
}

// Relative time (e.g., "2h ago")
conversations.setDatePattern { conversation ->
    val sentAt = conversation.lastMessage?.sentAt ?: return@setDatePattern ""
    DateUtils.getRelativeTimeSpanString(
        sentAt * 1000L,
        System.currentTimeMillis(),
        DateUtils.MINUTE_IN_MILLIS
    ).toString()
}
```

---

<!-- ============================================================ -->
<!-- MENTION CONFIGURATION SECTION                                 -->
<!-- ============================================================ -->

## Mention Configuration

Configure how @all mentions appear in conversation list items. When a message contains an @all mention, the conversation subtitle displays the mention with a customizable label.

### setMentionAllLabel

Sets a custom label for @all mentions displayed in conversation list items.

```kotlin
fun setMentionAllLabel(id: String, label: String): CometChatConversations
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `String` | The identifier for the @all mention (typically "all") |
| `label` | `String` | The display text shown to users when @all is mentioned |

```kotlin
import com.cometchat.chatuikit.conversations.CometChatConversations

val conversations: CometChatConversations = findViewById(R.id.conversation_view)

// Set a custom label for @all mentions
conversations.setMentionAllLabel("all", "Everyone")
```

```kotlin
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.cometchat.chat.constants.CometChatConstants
import com.cometchat.chat.models.Group
import com.cometchat.chat.models.User
import com.cometchat.chatuikit.conversations.CometChatConversations

class MentionConfiguredActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_conversation)

        val conversations: CometChatConversations = findViewById(R.id.conversation_view)
        
        conversations
            .setMentionAllLabel("all", "Team Members")
            .setOnItemClick { view, position, conversation ->
                openMessages(conversation)
            }
    }

    private fun openMessages(conversation: com.cometchat.chat.models.Conversation) {
        val intent = Intent(this, MessageActivity::class.java).apply {
            when (conversation.conversationType) {
                CometChatConstants.CONVERSATION_TYPE_GROUP -> {
                    val group = conversation.conversationWith as Group
                    putExtra("guid", group.guid)
                }
                else -> {
                    val user = conversation.conversationWith as User
                    putExtra("uid", user.uid)
                }
            }
        }
        startActivity(intent)
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
| Component not rendering | Verify Activity extends `AppCompatActivity` or `ComponentActivity` for lifecycle support |
| Custom views not appearing | Ensure custom view has proper `LayoutParams` and non-zero dimensions |
| Typing indicator not showing | Verify `hideTypingIndicator` is not set to true |

---

<!-- ============================================================ -->
<!-- RELATED COMPONENTS SECTION                                    -->
<!-- ============================================================ -->

## Related Components

- [Message List](/ui-kit/android/message-list) - Display messages in a conversation
- [Users](/ui-kit/android/users) - List all users to start new conversations
- [Groups](/ui-kit/android/groups) - List all groups
- [Message Composer](/ui-kit/android/message-composer) - Send messages in a conversation
- [Message Header](/ui-kit/android/message-header) - Display conversation header with user/group info
```

---

## Android-Specific Patterns Reference

### Import Patterns

Android uses package-based imports:

```kotlin
// UI Kit components
import com.cometchat.chatuikit.conversations.CometChatConversations
import com.cometchat.chatuikit.messagelist.CometChatMessageList
import com.cometchat.chatuikit.messagecomposer.CometChatMessageComposer
import com.cometchat.chatuikit.messageheader.CometChatMessageHeader

// SDK types
import com.cometchat.chat.models.User
import com.cometchat.chat.models.Group
import com.cometchat.chat.models.Conversation
import com.cometchat.chat.models.BaseMessage
import com.cometchat.chat.models.TextMessage
import com.cometchat.chat.constants.CometChatConstants
import com.cometchat.chat.core.CometChat
import com.cometchat.chat.exceptions.CometChatException

// UI Kit initialization
import com.cometchat.chatuikit.shared.cometchatuikit.CometChatUIKit
import com.cometchat.chatuikit.shared.cometchatuikit.UIKitSettings
```

### Kotlin Lambda / SAM Interface Callback Syntax

Android uses Kotlin lambdas or SAM (Single Abstract Method) interfaces for callbacks:

```kotlin
// ✅ Kotlin lambda syntax (preferred)
conversations.setOnItemClick { view, position, conversation ->
    openMessages(conversation)
}

// ✅ SAM interface syntax (alternative)
conversations.setOnItemClick(object : OnItemClick<Conversation> {
    override fun onItemClick(view: View, position: Int, conversation: Conversation) {
        openMessages(conversation)
    }
})

// ✅ Method reference (when signature matches)
conversations.setOnItemClick(this::handleItemClick)
```

### Android Type Conventions

Android uses standard Android/Kotlin types without prefixes:

| Type | Usage |
|------|-------|
| `Color` (Int) | Colors (e.g., `Color.parseColor("#FFFFFF")`, `Color.RED`) |
| `Typeface` | Fonts (e.g., `Typeface.DEFAULT_BOLD`, `Typeface.create("sans-serif", Typeface.NORMAL)`) |
| `Drawable` | Images (e.g., `ContextCompat.getDrawable(context, R.drawable.icon)`) |
| `View` | Views (e.g., custom view slots return `View`) |
| `Context` | Context (e.g., `Activity`, `Fragment.requireContext()`) |

### XML Styles + Programmatic Styling

Android supports both XML-based and programmatic styling:

```xml
<!-- XML Style Definition (res/values/styles.xml) -->
<style name="CustomConversationsStyle" parent="CometChatConversationsStyle">
    <item name="cometchat_background">@color/background</item>
    <item name="cometchat_title_text_color">@color/text_primary</item>
</style>
```

```kotlin
// Programmatic Style
val style = ConversationsStyle().apply {
    background = Color.WHITE
    titleColor = Color.BLACK
}
conversations.setStyle(style)
```

### Lifecycle-Aware Component Patterns

Android components must be used within lifecycle-aware contexts:

```kotlin
// ✅ Correct - Activity with lifecycle support
class ConversationActivity : AppCompatActivity() {
    private lateinit var conversations: CometChatConversations
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_conversation)
        conversations = findViewById(R.id.conversation_view)
    }
}

// ✅ Correct - Fragment with lifecycle support
class ConversationFragment : Fragment() {
    private var _binding: FragmentConversationBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentConversationBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        binding.conversationView.setOnItemClick { _, _, conversation ->
            // Use viewLifecycleOwner for lifecycle-aware operations
            viewLifecycleOwner.lifecycleScope.launch {
                openMessages(conversation)
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

### Builder Pattern with .setParam() Methods

Android uses the builder pattern for request configuration:

```kotlin
// ConversationsRequest Builder
val requestBuilder = ConversationsRequest.ConversationsRequestBuilder()
    .setLimit(30)
    .setConversationType(CometChatConstants.CONVERSATION_TYPE_USER)
    .withTags(true)
    .setTags(listOf("support", "sales"))
    .build()

conversations.setConversationsRequestBuilder(requestBuilder)

// UIKitSettings Builder
val uiKitSettings = UIKitSettings.UIKitSettingsBuilder()
    .setRegion("us")
    .setAppId("APP_ID")
    .setAuthKey("AUTH_KEY")
    .subscribePresenceForAllUsers()
    .build()

CometChatUIKit.init(context, uiKitSettings, object : CometChat.CallbackListener<String?>() {
    override fun onSuccess(success: String?) {
        // Initialization successful
    }
    
    override fun onError(e: CometChatException?) {
        // Handle error
    }
})
```

### Method Chaining

Android components support fluent method chaining:

```kotlin
val conversations: CometChatConversations = findViewById(R.id.conversation_view)

conversations
    .setMentionAllLabel("all", "Everyone")
    .hideSearch(true)
    .hideReceipts(false)
    .setOnItemClick { view, position, conversation ->
        handleTap(conversation)
    }
    .setOnError { exception ->
        Log.e("Conversations", "Error: ${exception.message}")
    }
```

### XML Layout Integration

Android components can be declared in XML layouts:

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <com.cometchat.chatuikit.conversations.CometChatConversations
        android:id="@+id/conversation_view"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        style="@style/CustomConversationsStyle" />

</androidx.constraintlayout.widget.ConstraintLayout>
```
