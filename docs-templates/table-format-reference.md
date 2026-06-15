# Table Format Reference Guide

This document provides comprehensive reference for all table formats used in UI Kit component documentation. Each table format includes the exact column structure, descriptions of what goes in each column, complete examples with realistic data, and any special formatting rules.

---

## Table of Contents

1. [Filter Recipes Table](#1-filter-recipes-table)
2. [Global UI Events Table](#2-global-ui-events-table)
3. [SDK Events Table](#3-sdk-events-table)
4. [View Slots Table](#4-view-slots-table)
5. [Style Properties Table](#5-style-properties-table)
6. [Customization Matrix Table](#6-customization-matrix-table)
7. [Props Table](#7-props-table)
8. [Events Table](#8-events-table)
9. [Actions Reference Table](#9-actions-reference-table)
10. [Troubleshooting Table](#10-troubleshooting-table)
11. [Empty State Fallback Patterns](#11-empty-state-fallback-patterns)

---

## 1. Filter Recipes Table

### Column Structure

```markdown
| Recipe | Code |
|--------|------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| Recipe | A short, descriptive name for the filtering scenario (e.g., "Show only users", "Filter by tags"). Use sentence case. |
| Code | The actual code snippet to achieve the filter. Wrap in backticks for inline code formatting. |

### Complete Example

```markdown
| Recipe | Code |
|--------|------|
| Show only users | `.set(conversationType: .user)` |
| Show only groups | `.set(conversationType: .group)` |
| Filter by tags | `.set(tags: ["support", "vip"])` |
| Limit results | `.set(limit: 20)` |
| Hide blocked users | `.set(hideBlockedUsers: true)` |
| Search by keyword | `.set(searchKeyword: "john")` |
```

### Rendered Example

| Recipe | Code |
|--------|------|
| Show only users | `.set(conversationType: .user)` |
| Show only groups | `.set(conversationType: .group)` |
| Filter by tags | `.set(tags: ["support", "vip"])` |
| Limit results | `.set(limit: 20)` |
| Hide blocked users | `.set(hideBlockedUsers: true)` |
| Search by keyword | `.set(searchKeyword: "john")` |

### Formatting Rules

- Recipe names should be concise and action-oriented
- Code snippets should show only the relevant builder method call
- Use platform-specific syntax (Swift for iOS, Kotlin for Android, etc.)
- Include 4-6 common filtering scenarios per component
- Order recipes from most common to least common use cases

---

## 2. Global UI Events Table

### Column Structure

```markdown
| Event | Fires when | Payload |
|-------|------------|---------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| Event | The event name/identifier. Wrap in backticks. Use the exact event constant or enum value. |
| Fires when | A brief description of the trigger condition. Use present tense (e.g., "User taps...", "Selection changes..."). |
| Payload | The data type passed with the event. Wrap in backticks. Use platform-native type names. |

### Complete Example

```markdown
| Event | Fires when | Payload |
|-------|------------|---------|
| `ccConversationSelected` | User taps on a conversation in the list | `Conversation` |
| `ccConversationDeleted` | User deletes a conversation via swipe action | `Conversation` |
| `ccConversationMuted` | User mutes/unmutes a conversation | `Conversation` |
| `ccMessageSent` | A new message is successfully sent | `BaseMessage` |
| `ccMessageEdited` | User edits an existing message | `BaseMessage` |
| `ccMessageDeleted` | User deletes a message | `BaseMessage` |
```

### Rendered Example

| Event | Fires when | Payload |
|-------|------------|---------|
| `ccConversationSelected` | User taps on a conversation in the list | `Conversation` |
| `ccConversationDeleted` | User deletes a conversation via swipe action | `Conversation` |
| `ccConversationMuted` | User mutes/unmutes a conversation | `Conversation` |
| `ccMessageSent` | A new message is successfully sent | `BaseMessage` |
| `ccMessageEdited` | User edits an existing message | `BaseMessage` |
| `ccMessageDeleted` | User deletes a message | `BaseMessage` |

### Formatting Rules

- Event names should use the exact constant/enum value from the SDK
- "Fires when" descriptions should be concise (under 10 words)
- Payload types should be the actual SDK type, not generic descriptions
- List events in logical grouping order (selection, modification, deletion)
- Use `Void` or `None` if the event has no payload

---

## 3. SDK Events Table

### Column Structure

```markdown
| SDK Listener | Internal behavior |
|--------------|-------------------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| SDK Listener | The SDK listener/delegate method name. Wrap in backticks. Use the exact method signature. |
| Internal behavior | Description of what the component does when this event fires. Use present tense. |

### Complete Example

```markdown
| SDK Listener | Internal behavior |
|--------------|-------------------|
| `onMessageReceived` | Adds the new message to the list and scrolls to bottom if user is at bottom |
| `onMessageEdited` | Updates the edited message in place and refreshes the cell |
| `onMessageDeleted` | Removes the message from the list or shows "deleted" placeholder |
| `onTypingStarted` | Shows typing indicator for the user who started typing |
| `onTypingEnded` | Hides typing indicator for the user who stopped typing |
| `onUserOnline` | Updates the user's online status indicator to green |
| `onUserOffline` | Updates the user's online status indicator to gray |
| `onMessageRead` | Updates read receipts (double blue ticks) for the message |
```

### Rendered Example

| SDK Listener | Internal behavior |
|--------------|-------------------|
| `onMessageReceived` | Adds the new message to the list and scrolls to bottom if user is at bottom |
| `onMessageEdited` | Updates the edited message in place and refreshes the cell |
| `onMessageDeleted` | Removes the message from the list or shows "deleted" placeholder |
| `onTypingStarted` | Shows typing indicator for the user who started typing |
| `onTypingEnded` | Hides typing indicator for the user who stopped typing |
| `onUserOnline` | Updates the user's online status indicator to green |
| `onUserOffline` | Updates the user's online status indicator to gray |
| `onMessageRead` | Updates read receipts (double blue ticks) for the message |

### Formatting Rules

- Use the exact SDK listener/delegate method name
- Internal behavior should explain the UI update, not the technical implementation
- Keep descriptions under 15 words
- Group related listeners together (message events, typing events, presence events)
- Focus on user-visible behavior changes

---

## 4. View Slots Table

### Column Structure

```markdown
| Slot | Signature | Replaces |
|------|-----------|----------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| Slot | The slot property name. Wrap in backticks. Use the exact property name from the component. |
| Signature | The type signature for the custom view closure/callback. Wrap in backticks. |
| Replaces | Description of what default UI element this slot replaces. Be specific about the location. |

### Complete Example

```markdown
| Slot | Signature | Replaces |
|------|-----------|----------|
| `listItemView` | `(Conversation) -> UIView` | Entire conversation row |
| `avatarView` | `(Conversation) -> UIView` | User/group avatar on the left |
| `titleView` | `(Conversation) -> UIView` | Conversation name text |
| `subtitleView` | `(Conversation) -> UIView` | Last message preview text |
| `tailView` | `(Conversation) -> UIView` | Timestamp and unread badge on the right |
| `menuView` | `(Conversation) -> UIView` | Swipe action menu items |
| `emptyStateView` | `() -> UIView` | Placeholder shown when list is empty |
| `errorStateView` | `(Error) -> UIView` | Error message shown on fetch failure |
| `loadingStateView` | `() -> UIView` | Loading spinner during initial fetch |
```

### Rendered Example

| Slot | Signature | Replaces |
|------|-----------|----------|
| `listItemView` | `(Conversation) -> UIView` | Entire conversation row |
| `avatarView` | `(Conversation) -> UIView` | User/group avatar on the left |
| `titleView` | `(Conversation) -> UIView` | Conversation name text |
| `subtitleView` | `(Conversation) -> UIView` | Last message preview text |
| `tailView` | `(Conversation) -> UIView` | Timestamp and unread badge on the right |
| `menuView` | `(Conversation) -> UIView` | Swipe action menu items |
| `emptyStateView` | `() -> UIView` | Placeholder shown when list is empty |
| `errorStateView` | `(Error) -> UIView` | Error message shown on fetch failure |
| `loadingStateView` | `() -> UIView` | Loading spinner during initial fetch |

### Formatting Rules

- Slot names should match the exact property name in the API
- Signatures should use platform-native type syntax
- "Replaces" should clearly identify the visual element being replaced
- Order slots from most commonly customized to least
- Include state views (empty, error, loading) when applicable

---

## 5. Style Properties Table

### Column Structure

```markdown
| Property | Type | Default | Description |
|----------|------|---------|-------------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| Property | The style property name. Wrap in backticks. Use exact property name. |
| Type | The platform-native type. Wrap in backticks. (e.g., `UIColor`, `UIFont`, `CGFloat`) |
| Default | The default value. Wrap in backticks. Use theme references where applicable. |
| Description | Brief explanation of what this property controls. Keep under 10 words. |

### Complete Example

```markdown
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `backgroundColor` | `UIColor` | `CometChatTheme.backgroundColor01` | Background color of the component |
| `titleFont` | `UIFont` | `CometChatTypography.Heading.bold` | Font for the title text |
| `titleColor` | `UIColor` | `CometChatTheme.textColorPrimary` | Color for the title text |
| `subtitleFont` | `UIFont` | `CometChatTypography.Body.regular` | Font for the subtitle text |
| `subtitleColor` | `UIColor` | `CometChatTheme.textColorSecondary` | Color for the subtitle text |
| `separatorColor` | `UIColor` | `CometChatTheme.borderColorLight` | Color of row separators |
| `cornerRadius` | `CometChatCornerStyle` | `CometChatCornerStyle(cornerRadius: 0)` | Corner radius of the component |
| `borderWidth` | `CGFloat` | `0` | Border width around the component |
| `borderColor` | `UIColor` | `.clear` | Border color of the component |
```

### Rendered Example

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `backgroundColor` | `UIColor` | `CometChatTheme.backgroundColor01` | Background color of the component |
| `titleFont` | `UIFont` | `CometChatTypography.Heading.bold` | Font for the title text |
| `titleColor` | `UIColor` | `CometChatTheme.textColorPrimary` | Color for the title text |
| `subtitleFont` | `UIFont` | `CometChatTypography.Body.regular` | Font for the subtitle text |
| `subtitleColor` | `UIColor` | `CometChatTheme.textColorSecondary` | Color for the subtitle text |
| `separatorColor` | `UIColor` | `CometChatTheme.borderColorLight` | Color of row separators |
| `cornerRadius` | `CometChatCornerStyle` | `CometChatCornerStyle(cornerRadius: 0)` | Corner radius of the component |
| `borderWidth` | `CGFloat` | `0` | Border width around the component |
| `borderColor` | `UIColor` | `.clear` | Border color of the component |

### Formatting Rules

- Group related properties together (colors, fonts, dimensions)
- Use theme constants for defaults when available
- Types should be platform-specific (UIColor for iOS, Color for Android)
- Descriptions should be concise and focus on visual effect
- Include all commonly customized properties (8-12 properties typical)

---

## 6. Customization Matrix Table

### Column Structure

```markdown
| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| What to change | The visual aspect or behavior to customize. Use plain language. |
| Where | The category of customization: Style, Property, View Slot, or Callback. |
| Property/API | The specific property or method to use. Wrap in backticks. |
| Example | A brief code snippet or value example. Wrap in backticks. |

### Complete Example

```markdown
| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
| Background color | Style | `backgroundColor` | `.systemBackground` |
| Title appearance | Style | `titleFont`, `titleColor` | `.boldSystemFont(ofSize: 18)` |
| Subtitle appearance | Style | `subtitleFont`, `subtitleColor` | `.systemGray` |
| Hide search bar | Property | `hideSearch` | `component.hideSearch = true` |
| Hide separator lines | Property | `hideSeparator` | `component.hideSeparator = true` |
| Custom avatar | View Slot | `set(avatarView:)` | See Custom View Slots section |
| Custom list item | View Slot | `set(listItemView:)` | See Custom View Slots section |
| Handle selection | Callback | `set(onItemClick:)` | `{ conversation in ... }` |
| Handle long press | Callback | `set(onItemLongClick:)` | `{ conversation in ... }` |
```

### Rendered Example

| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
| Background color | Style | `backgroundColor` | `.systemBackground` |
| Title appearance | Style | `titleFont`, `titleColor` | `.boldSystemFont(ofSize: 18)` |
| Subtitle appearance | Style | `subtitleFont`, `subtitleColor` | `.systemGray` |
| Hide search bar | Property | `hideSearch` | `component.hideSearch = true` |
| Hide separator lines | Property | `hideSeparator` | `component.hideSeparator = true` |
| Custom avatar | View Slot | `set(avatarView:)` | See Custom View Slots section |
| Custom list item | View Slot | `set(listItemView:)` | See Custom View Slots section |
| Handle selection | Callback | `set(onItemClick:)` | `{ conversation in ... }` |
| Handle long press | Callback | `set(onItemLongClick:)` | `{ conversation in ... }` |

### Formatting Rules

- "What to change" should be user-focused, not technical
- "Where" should be one of: Style, Property, View Slot, Callback
- Group by "Where" category for easier scanning
- Examples should be brief but illustrative
- Reference other sections for complex customizations

---

## 7. Props Table

### Column Structure

The Props table uses a unique two-column format with Type and Default as row labels:

```markdown
| | |
|---|---|
| Type | `[TypeName]` |
| Default | `[default-value]` |
```

### Column Descriptions

| Row Label | Description |
|-----------|-------------|
| Type | The platform-native type of the property. Wrap in backticks. |
| Default | The default value. Wrap in backticks. Use `nil`, `false`, `0`, or actual values. |

### Complete Example

For each prop, create a heading followed by a description and the table:

```markdown
### conversationsRequestBuilder

Configures the request used to fetch conversations. Use this to filter or customize the conversation list.

| | |
|---|---|
| Type | `ConversationsRequest.ConversationsRequestBuilder` |
| Default | `nil` |

### hideSearch

Controls visibility of the search bar at the top of the list.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### selectionMode

Determines how items can be selected in the list.

| | |
|---|---|
| Type | `SelectionMode` |
| Default | `.none` |

### emptyStateText

Text displayed when the conversation list is empty.

| | |
|---|---|
| Type | `String` |
| Default | `"No conversations yet"` |
```

### Rendered Example

### conversationsRequestBuilder

Configures the request used to fetch conversations. Use this to filter or customize the conversation list.

| | |
|---|---|
| Type | `ConversationsRequest.ConversationsRequestBuilder` |
| Default | `nil` |

### hideSearch

Controls visibility of the search bar at the top of the list.

| | |
|---|---|
| Type | `Bool` |
| Default | `false` |

### selectionMode

Determines how items can be selected in the list.

| | |
|---|---|
| Type | `SelectionMode` |
| Default | `.none` |

### emptyStateText

Text displayed when the conversation list is empty.

| | |
|---|---|
| Type | `String` |
| Default | `"No conversations yet"` |

### Formatting Rules

- Props must be sorted alphabetically by name
- Each prop gets its own H3 heading
- Include a 1-2 sentence description before the table
- Use platform-native types (not generic types)
- Default values should be exact (not "default" or "system default")
- Use `nil` for optional properties with no default

---

## 8. Events Table

### Column Structure

```markdown
| Event | Payload | Fires when |
|-------|---------|------------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| Event | The event name/identifier. Wrap in backticks. Must match AI Agent Component Spec. |
| Payload | The data type passed with the event. Wrap in backticks. |
| Fires when | Brief description of the trigger condition. Use present tense. |

### Complete Example

```markdown
| Event | Payload | Fires when |
|-------|---------|------------|
| `ccConversationSelected` | `Conversation` | User taps on a conversation |
| `ccConversationDeleted` | `Conversation` | User deletes a conversation |
| `ccConversationMuted` | `Conversation` | User mutes or unmutes a conversation |
| `ccGroupMemberAdded` | `[GroupMember]` | New members are added to a group |
| `ccGroupMemberRemoved` | `GroupMember` | A member is removed from a group |
| `ccGroupMemberBanned` | `GroupMember` | A member is banned from a group |
```

### Rendered Example

| Event | Payload | Fires when |
|-------|---------|------------|
| `ccConversationSelected` | `Conversation` | User taps on a conversation |
| `ccConversationDeleted` | `Conversation` | User deletes a conversation |
| `ccConversationMuted` | `Conversation` | User mutes or unmutes a conversation |
| `ccGroupMemberAdded` | `[GroupMember]` | New members are added to a group |
| `ccGroupMemberRemoved` | `GroupMember` | A member is removed from a group |
| `ccGroupMemberBanned` | `GroupMember` | A member is banned from a group |

### Formatting Rules

- Events listed must exactly match the AI Agent Component Spec
- Use consistent event naming convention (ccComponentAction)
- Payload types should be SDK types, not primitives
- "Fires when" should be under 8 words
- Order events by frequency of use

---

## 9. Actions Reference Table

### Column Structure

```markdown
| Method | Description | Example |
|--------|-------------|---------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| Method | The setter method name. Wrap in backticks. Include parentheses and parameter label. |
| Description | Brief explanation of what the callback does. Keep under 10 words. |
| Example | A minimal code snippet showing usage. Wrap in backticks. |

### Complete Example

```markdown
| Method | Description | Example |
|--------|-------------|---------|
| `set(onItemClick:)` | Called when user taps an item | `{ conversation in navigate(to: conversation) }` |
| `set(onItemLongClick:)` | Called when user long-presses an item | `{ conversation in showOptions(for: conversation) }` |
| `set(onSelection:)` | Called when selection changes | `{ conversations in updateCount(conversations.count) }` |
| `set(onError:)` | Called when an error occurs | `{ error in showAlert(error.localizedDescription) }` |
| `set(onBack:)` | Called when back button is tapped | `{ navigationController?.popViewController(animated: true) }` |
| `set(onEmpty:)` | Called when list becomes empty | `{ showEmptyState() }` |
```

### Rendered Example

| Method | Description | Example |
|--------|-------------|---------|
| `set(onItemClick:)` | Called when user taps an item | `{ conversation in navigate(to: conversation) }` |
| `set(onItemLongClick:)` | Called when user long-presses an item | `{ conversation in showOptions(for: conversation) }` |
| `set(onSelection:)` | Called when selection changes | `{ conversations in updateCount(conversations.count) }` |
| `set(onError:)` | Called when an error occurs | `{ error in showAlert(error.localizedDescription) }` |
| `set(onBack:)` | Called when back button is tapped | `{ navigationController?.popViewController(animated: true) }` |
| `set(onEmpty:)` | Called when list becomes empty | `{ showEmptyState() }` |

### Formatting Rules

- Include this table only when component has 3+ callback props
- Method names should include the full setter signature
- Descriptions should start with "Called when..."
- Examples should be realistic but concise
- Order by importance/frequency of use

---

## 10. Troubleshooting Table

### Column Structure

```markdown
| Issue | Solution |
|-------|----------|
```

### Column Descriptions

| Column | Description |
|--------|-------------|
| Issue | A brief description of the problem. Use user-facing language. |
| Solution | The fix or workaround. Be specific and actionable. |

### Complete Example

```markdown
| Issue | Solution |
|-------|----------|
| Empty list shows even with data | Ensure user is logged in with `CometChat.login()` before rendering the component |
| List not updating in real-time | Verify `CometChat.addMessageListener()` is called and not removed prematurely |
| Navigation not working on tap | Check that `navigationController` is not nil; embed in UINavigationController |
| Custom views not appearing | Ensure custom view has proper Auto Layout constraints and non-zero frame |
| Styling not applied | Apply styles before adding component to view hierarchy |
| Search not filtering results | Verify `hideSearch` is not set to `true` and search delegate is connected |
| Slow performance with large lists | Use `set(limit:)` on request builder to paginate results |
| Avatar images not loading | Check network connectivity and ensure avatar URLs are valid HTTPS |
```

### Rendered Example

| Issue | Solution |
|-------|----------|
| Empty list shows even with data | Ensure user is logged in with `CometChat.login()` before rendering the component |
| List not updating in real-time | Verify `CometChat.addMessageListener()` is called and not removed prematurely |
| Navigation not working on tap | Check that `navigationController` is not nil; embed in UINavigationController |
| Custom views not appearing | Ensure custom view has proper Auto Layout constraints and non-zero frame |
| Styling not applied | Apply styles before adding component to view hierarchy |
| Search not filtering results | Verify `hideSearch` is not set to `true` and search delegate is connected |
| Slow performance with large lists | Use `set(limit:)` on request builder to paginate results |
| Avatar images not loading | Check network connectivity and ensure avatar URLs are valid HTTPS |

### Formatting Rules

- Include 4-8 common issues per component
- Issues should be symptoms users would search for
- Solutions should be specific and actionable
- Include code snippets in solutions when helpful
- Order by frequency of occurrence

---

## 11. Empty State Fallback Patterns

When a component lacks certain features, use these exact fallback text patterns:

### No Global UI Events

Use when the component does not emit any global UI events:

```markdown
The component does not emit global UI events.
```

### No SDK Listeners

Use when the component does not listen to any real-time SDK events:

```markdown
The component does not listen to real-time SDK events.
```

### No Events

Use when the component has no events in the Events section:

```markdown
The component does not emit global events.
```

### Usage Context

These fallback patterns should be used in place of empty tables. For example:

**Instead of:**

```markdown
### Global UI Events

| Event | Fires when | Payload |
|-------|------------|---------|
```

**Use:**

```markdown
### Global UI Events

The component does not emit global UI events.
```

### Formatting Rules for Empty States

- Use the exact text as specified above
- Do not include empty tables
- Place the fallback text directly under the section heading
- Do not add additional explanation or apology
- Maintain consistent formatting with other sections

---

## Quick Reference Summary

| Table Type | Columns | Primary Use |
|------------|---------|-------------|
| Filter Recipes | Recipe, Code | Filtering section |
| Global UI Events | Event, Fires when, Payload | Actions and Events section |
| SDK Events | SDK Listener, Internal behavior | Actions and Events section |
| View Slots | Slot, Signature, Replaces | Custom View Slots section |
| Style Properties | Property, Type, Default, Description | Styling section |
| Customization Matrix | What to change, Where, Property/API, Example | Styling section |
| Props | (Type row), (Default row) | Props section |
| Events | Event, Payload, Fires when | Events section |
| Actions Reference | Method, Description, Example | Actions and Events section |
| Troubleshooting | Issue, Solution | Troubleshooting section |

---

## Validation Checklist

Before publishing documentation, verify:

- [ ] All tables use the correct column structure
- [ ] Code snippets are wrapped in backticks
- [ ] Platform-native types are used consistently
- [ ] Events match the AI Agent Component Spec
- [ ] Props are sorted alphabetically
- [ ] Empty state fallback text is used where applicable
- [ ] Tables have consistent formatting (spacing, alignment)
- [ ] Examples use realistic, working code
