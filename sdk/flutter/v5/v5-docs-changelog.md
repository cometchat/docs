# Flutter SDK v5 Documentation Changelog

This file tracks all changes made to the v5 documentation.

---

## Changes Log

### Date: March 26, 2026

#### SDK Changes - Deprecated Methods Removed
- [x] Removed `markAsUnread()` method from `cometchat.dart` (use `markMessageAsUnread()`)
- [x] Removed `receaverUid` parameter from `startTyping()` and `endTyping()` - `receiverUid` is now required
- [x] Removed `fetchPushPreferences()`, `updatePushPreferences()`, `resetPushPreferences()` from `cometchat_notifications.dart`
- [x] Removed `PushPreferences` class from `push_preferences.dart` (use `NotificationPreferences`)

#### Documentation Updates - Deprecation Warnings Removed
- [x] Updated `typing-indicators.mdx` - removed deprecation warnings for `receaverUid`
- [x] Updated `delivery-read-receipts.mdx` - removed deprecation warning for `markAsUnread()`
- [x] Updated `upgrading-from-v4-guide.mdx`:
  - Removed `lastReadMessageId` type change section (was already int)
  - Changed "Deprecations" section to "Method Migrations" (methods are now removed, not deprecated)
  - Updated migration checklist

#### Initial Setup
- [x] Copied all v4 docs to `docs/sdk/flutter/v5/` folder (64 files)
- [x] Created this changelog file

---

## Completed Updates

### 1. delivery-read-receipts.mdx ✅
- [x] Updated `markAsUnread()` to `markMessageAsUnread()` with deprecation notice
- [x] Added `markConversationAsDelivered()` method documentation
- [x] Added `markConversationAsRead()` method documentation
- [x] Updated Enhanced Messaging Status feature list

### 2. send-message.mdx ✅
- [x] Added "Send Multiple Media Files" section with code examples
- [x] Added "File Size and Count Validation" section with error handling

### 3. retrieve-conversations.mdx ✅
- [x] Added `userTags` filter documentation
- [x] Added `groupTags` filter documentation
- [x] Added `hideAgentic` filter documentation
- [x] Added `onlyAgentic` filter documentation
- [x] Updated `lastReadMessageId` description to note int type

### 4. retrieve-users.mdx ✅
- [x] Added `searchIn` parameter documentation
- [x] Added `sortBy` parameter documentation
- [x] Added `sortByOrder` parameter documentation
- [x] Added combined example for all new parameters

### 5. create-group.mdx ✅
- [x] Added `createGroupWithMembers()` method documentation
- [x] Added `isBannedFromGroup` property to Group Class table

### 6. retrieve-group-members.mdx ✅
- [x] Added status filter (`CometChatUserStatus.online/offline`) documentation

### 7. additional-message-filtering.mdx ✅
- [x] Added "Direct Page Navigation" section with `setPage()` method
- [x] Updated default limit note (50 → 30)
- [x] Added `attachmentTypes` filter documentation
- [x] Added `hideQuotedMessages` filter documentation

### 8. typing-indicators.mdx ✅
- [x] Updated code examples to use `receiverUid` instead of `receaverUid`
- [x] Added deprecation notices for `receaverUid` parameter

### 9. upgrading-from-v4-guide.mdx ✅ (NEW)
- [x] Created comprehensive migration guide
- [x] Documented breaking changes (lastReadMessageId type, default limit)
- [x] Documented all deprecations
- [x] Documented all new features
- [x] Added migration checklist

---

## Summary of Changes

| File | Changes Made |
|------|--------------|
| delivery-read-receipts.mdx | 4 updates, removed deprecation warning |
| send-message.mdx | 2 new sections |
| retrieve-conversations.mdx | 5 updates |
| retrieve-users.mdx | 4 new parameters |
| create-group.mdx | 2 additions |
| retrieve-group-members.mdx | 1 new filter |
| additional-message-filtering.mdx | 4 updates |
| typing-indicators.mdx | Removed deprecation notices (methods now removed) |
| upgrading-from-v4-guide.mdx | Updated for removed methods |

---

## SDK Changes (v5)

### Removed Methods
- `markAsUnread()` - use `markMessageAsUnread()` instead
- `receaverUid` parameter - use `receiverUid` (now required)
- `fetchPushPreferences()` - use `fetchPreferences()` instead
- `updatePushPreferences()` - use `updatePreferences()` instead
- `resetPushPreferences()` - use `resetPreferences()` instead
- `PushPreferences` class - use `NotificationPreferences` instead

---

## Features Documented

### New Methods
- `markMessageAsUnread()` - replaces deprecated `markAsUnread()`
- `markConversationAsDelivered()` - mark entire conversation as delivered
- `markConversationAsRead()` - mark entire conversation as read
- `createGroupWithMembers()` - create group with members in one step

### New Filters/Parameters
- `userTags` - filter conversations by user tags
- `groupTags` - filter conversations by group tags
- `hideAgentic` - hide AI-driven conversations
- `onlyAgentic` - show only AI-driven conversations
- `searchIn` - specify user fields to search
- `sortBy` - sort users by field
- `sortByOrder` - sort order (asc/desc)
- `status` - filter group members by online/offline
- `page` - direct page navigation
- `attachmentTypes` - filter by attachment types
- `hideQuotedMessages` - exclude quoted messages

### New Capabilities
- Multiple media files in single message
- File size/count validation
- `isBannedFromGroup` property in Group class

### Breaking Changes Documented
- Default limit: 50 → 30
- Removed deprecated methods (see SDK Changes section above)

---

## Navigation Configuration

### docs.json Updated ✅
- Added v5 version entry to Flutter SDK dropdown
- v5 is now the first/default version shown
- All v5 doc paths point to `sdk/flutter/v5/` folder
- Includes `upgrading-from-v4-guide` in Resources section
