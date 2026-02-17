# CometChat iOS SDK Documentation Review Report

**Review Date:** February 17, 2026  
**SDK Version:** 4.x (v4.0.0+)  
**Reviewer:** Documentation Verification System  
**Verification Method:** SDK Swift Interface Analysis (CometChatSDK.swiftinterface)

---

## Executive Summary

This report documents the comprehensive review of CometChat iOS SDK documentation against the actual SDK implementation. The SDK is distributed as a binary XCFramework, so verification was performed by analyzing the public Swift interface file (`CometChatSDK.swiftinterface`) which contains all public API signatures.

The review focused on:

1. Method signature accuracy
2. Success/Failure response documentation
3. Data model completeness (BaseMessage, User, Group, Conversation)
4. Error codes and scenarios

---

## 1. Data Models - Complete Property Documentation

### 1.1 BaseMessage Class

**All message types (TextMessage, MediaMessage, CustomMessage, InteractiveMessage, Call) inherit from BaseMessage.**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `Int` | Server-assigned unique message identifier |
| `muid` | `String` | Client-generated unique identifier (Message UID) |
| `senderUid` | `String` | UID of the message sender |
| `receiverUid` | `String` | UID of the receiver (user or group) |
| `messageType` | `MessageType` | Type of message (text, image, video, audio, file, custom) |
| `receiverType` | `ReceiverType` | Type of receiver (.user or .group) |
| `sentAt` | `Int` | Unix timestamp (seconds) when message was sent |
| `deliveredAt` | `Double` | Unix timestamp when message was delivered |
| `readAt` | `Double` | Unix timestamp when message was read |
| `deliveredToMeAt` | `Double` | Unix timestamp when delivered to current user |
| `readByMeAt` | `Double` | Unix timestamp when read by current user |
| `updatedAt` | `Double` | Unix timestamp of last update |
| `status` | `String` | Message status |
| `messageCategory` | `MessageCategory` | Category (message, action, call, custom) |
| `sender` | `User?` | User object of the sender |
| `receiver` | `AppEntity?` | User or Group object of the receiver |
| `metaData` | `[String: Any]?` | Custom metadata dictionary |
| `editedAt` | `Double` | Unix timestamp when edited |
| `editedBy` | `String` | UID of user who edited |
| `deletedAt` | `Double` | Unix timestamp when deleted |
| `deletedBy` | `String` | UID of user who deleted |
| `conversationId` | `String` | Unique conversation identifier |
| `parentMessageId` | `Int` | Parent message ID (for threaded messages) |
| `replyCount` | `Int` | Number of replies to this message |
| `unreadRepliesCount` | `Int` | Number of unread replies |
| `mentionedMe` | `Bool` | Whether current user is mentioned |
| `mentionedUsers` | `[User]` | Array of mentioned users |
| `reactions` | `[ReactionCount]` | Array of reaction counts |
| `receipts` | `[MessageReceipt]` | Array of message receipts |
| `quotedMessageId` | `Int` | ID of quoted message |
| `quotedMessage` | `BaseMessage?` | The quoted message object |
| `rawMessage` | `[String: Any]?` | Raw JSON message data |

### 1.2 TextMessage Class (extends BaseMessage)

| Property | Type | Description |
|----------|------|-------------|
| `text` | `String` | The text content of the message |
| `tags` | `[String]?` | Array of message tags |
| `moderationStatus` | `String` | Content moderation status |

**Constructor:**
```swift
TextMessage(receiverUid: String, text: String, receiverType: ReceiverType)
```

### 1.3 MediaMessage Class (extends BaseMessage)

| Property | Type | Description |
|----------|------|-------------|
| `attachment` | `Attachment?` | Single attachment object |
| `attachments` | `[Attachment]?` | Array of attachments (multiple files) |
| `caption` | `String?` | Caption text for the media |
| `filePath` | `String?` | Local file path |
| `filePaths` | `[String]?` | Array of local file paths |
| `files` | `[File]?` | Array of File objects |
| `tags` | `[String]?` | Array of message tags |
| `moderationStatus` | `String` | Content moderation status |

**Constructors:**
```swift
MediaMessage(receiverUid: String, fileurl: String?, messageType: MessageType, receiverType: ReceiverType)
MediaMessage(receiverUid: String, files: [File], messageType: MessageType, receiverType: ReceiverType)
```

### 1.4 CustomMessage Class (extends BaseMessage)

| Property | Type | Description |
|----------|------|-------------|
| `customData` | `[String: Any]?` | Custom JSON data |
| `type` | `String?` | Custom message type identifier |
| `subType` | `String?` | Custom message subtype |
| `conversationText` | `String?` | Text for conversation list display |
| `updateConversation` | `Bool` | Whether to update conversation list |
| `sendNotification` | `Bool` | Whether to send push notification |
| `tags` | `[String]?` | Array of message tags |

**Constructors:**
```swift
CustomMessage(receiverUid: String, receiverType: ReceiverType, customData: [String: Any])
CustomMessage(receiverUid: String, receiverType: ReceiverType, customData: [String: Any], type: String?)
```

### 1.5 User Class

| Property | Type | Description |
|----------|------|-------------|
| `uid` | `String?` | Unique user identifier |
| `name` | `String?` | Display name |
| `avatar` | `String?` | Avatar image URL |
| `link` | `String?` | Profile link URL |
| `role` | `String?` | User role |
| `metadata` | `[String: Any]?` | Custom metadata |
| `status` | `UserStatus` | Online status (.online, .offline) |
| `statusMessage` | `String?` | Custom status message |
| `lastActiveAt` | `Double` | Last active timestamp |
| `hasBlockedMe` | `Bool` | Whether user has blocked current user |
| `blockedByMe` | `Bool` | Whether current user has blocked this user |
| `deactivatedAt` | `Double` | Deactivation timestamp |
| `tags` | `[String]` | Array of user tags |

**Constructor:**
```swift
User(uid: String, name: String)
```

### 1.6 Group Class

| Property | Type | Description |
|----------|------|-------------|
| `guid` | `String` | Unique group identifier |
| `name` | `String?` | Group name |
| `icon` | `String?` | Group icon URL |
| `groupDescription` | `String?` | Group description |
| `owner` | `String?` | Owner's UID |
| `groupType` | `groupType` | Type (.public, .private, .password) |
| `password` | `String?` | Password for protected groups |
| `metadata` | `[String: Any]?` | Custom metadata |
| `createdAt` | `Int` | Creation timestamp |
| `updatedAt` | `Int` | Last update timestamp |
| `joinedAt` | `Int` | When current user joined |
| `scope` | `GroupMemberScopeType` | Current user's scope |
| `hasJoined` | `Bool` | Whether current user has joined |
| `membersCount` | `Int` | Total member count |
| `tags` | `[String]` | Array of group tags |
| `isBannedFromGroup` | `Bool` | Whether current user is banned |

**Constructors:**
```swift
Group(guid: String, name: String, groupType: groupType, password: String?)
Group(guid: String, name: String, groupType: groupType, password: String?, icon: String, description: String)
```

### 1.7 Conversation Class

| Property | Type | Description |
|----------|------|-------------|
| `conversationId` | `String?` | Unique conversation identifier |
| `conversationType` | `ConversationType` | Type (.user, .group, .none) |
| `lastMessage` | `BaseMessage?` | Last message in conversation |
| `conversationWith` | `AppEntity?` | User or Group object |
| `unreadMessageCount` | `Int` | Number of unread messages |
| `updatedAt` | `Double` | Last update timestamp |
| `tags` | `[String]?` | Conversation tags |
| `unreadMentionsCount` | `Int` | Unread mentions count |
| `lastReadMessageId` | `Int` | Last read message ID |
| `latestMessageId` | `Int` | Latest message ID |

### 1.8 Attachment Class

| Property | Type | Description |
|----------|------|-------------|
| `fileName` | `String` | Name of the file |
| `fileExtension` | `String` | File extension |
| `fileSize` | `Double` | File size in bytes |
| `fileMimeType` | `String` | MIME type |
| `fileUrl` | `String` | URL of the file |

**Constructor:**
```swift
Attachment(fileName: String, fileExtension: String, fileMimeType: String, fileUrl: String)
```

### 1.9 MessageReceipt Class

| Property | Type | Description |
|----------|------|-------------|
| `receiverId` | `String` | Receiver identifier |
| `receiverType` | `ReceiverType` | Type of receiver |
| `messageId` | `String` | Message identifier |
| `sender` | `User?` | User who sent the receipt |
| `receiptType` | `ReceiptType` | Type (.delivered, .read, .deliveredToAll, .readByAll, .unread) |
| `timeStamp` | `Int` | Receipt timestamp |
| `deliveredAt` | `Double` | Delivery timestamp |
| `readAt` | `Double` | Read timestamp |

### 1.10 CometChatException Class

| Property | Type | Description |
|----------|------|-------------|
| `errorCode` | `String` | Error code identifier |
| `errorDescription` | `String` | Human-readable error description |

---

## 2. API Success/Failure Responses

### 2.1 CometChat.init()

**Success Response:**
```swift
onSuccess: { (isSuccess: Bool) in
    // isSuccess: true when SDK initializes successfully
    // After success: CometChat.isInitialised returns true
}
```

**Failure Response:**
```swift
onError: { (error: CometChatException) in
    // error.errorCode: String - Error identifier
    // error.errorDescription: String - Human-readable description
}
```

**Common Error Codes:**
| Error Code | Description |
|------------|-------------|
| `ERR_INVALID_APP_ID` | Invalid App ID provided |
| `ERR_INVALID_REGION` | Invalid region specified |

### 2.2 CometChat.login()

**Success Response:**
```swift
onSuccess: { (user: User) in
    // Returns complete User object with all properties
    // See User class properties above
}
```

**Failure Response:**
```swift
onError: { (error: CometChatException) in
    // error.errorCode: String
    // error.errorDescription: String
}
```

**Common Error Codes:**
| Error Code | Description |
|------------|-------------|
| `ERR_UID_NOT_FOUND` | User with specified UID does not exist |
| `ERR_INVALID_API_KEY` | Invalid API key provided |
| `ERR_USER_DEACTIVATED` | User account is deactivated |
| `ERR_NOT_LOGGED_IN` | No user is currently logged in |

### 2.3 CometChat.sendTextMessage()

**Success Response:**
```swift
onSuccess: { (message: TextMessage) in
    // Returns TextMessage with server-assigned ID
    // message.id: Server-assigned message ID
    // message.sentAt: Server timestamp
    // All BaseMessage properties populated
}
```

**Failure Response:**
```swift
onError: { (error: CometChatException?) in
    // error?.errorCode: String
    // error?.errorDescription: String
}
```

**Common Error Codes:**
| Error Code | Description |
|------------|-------------|
| `ERR_NOT_LOGGED_IN` | User not logged in |
| `ERR_UID_NOT_FOUND` | Receiver UID not found |
| `ERR_GUID_NOT_FOUND` | Group GUID not found |
| `ERR_BLOCKED_BY_RECEIVER` | Blocked by receiver |
| `ERR_NOT_A_MEMBER` | Not a member of the group |

### 2.4 CometChat.sendMediaMessage()

**Success Response:**
```swift
onSuccess: { (message: MediaMessage) in
    // Returns MediaMessage with attachment details
    // message.attachment: Contains file URL after upload
    // message.attachments: For multiple files
}
```

**Failure Response:**
```swift
onError: { (error: CometChatException?) in
    // Same error structure as sendTextMessage
}
```

### 2.5 CometChat.sendCustomMessage()

**Success Response:**
```swift
onSuccess: { (message: CustomMessage) in
    // Returns CustomMessage with customData preserved
}
```

### 2.6 MessagesRequest.fetchPrevious() / fetchNext()

**Success Response:**
```swift
onSuccess: { (messages: [BaseMessage]?) in
    // Returns array of BaseMessage subclasses
    // Each message can be: TextMessage, MediaMessage, CustomMessage, 
    // ActionMessage, Call, InteractiveMessage
    // Use type checking to determine specific type
}
```

**Failure Response:**
```swift
onError: { (error: CometChatException?) in
    // error?.errorCode: String
    // error?.errorDescription: String
}
```

### 2.7 ConversationRequest.fetchNext()

**Success Response:**
```swift
onSuccess: { (conversations: [Conversation]) in
    // Returns array of Conversation objects
    // Each conversation contains lastMessage and conversationWith
}
```

### 2.8 UsersRequest.fetchNext()

**Success Response:**
```swift
onSuccess: { (users: [User]) in
    // Returns array of User objects
}
```

### 2.9 GroupsRequest.fetchNext()

**Success Response:**
```swift
onSuccess: { (groups: [Group]) in
    // Returns array of Group objects
}
```

### 2.10 CometChat.logout()

**Success Response:**
```swift
onSuccess: { (response: String) in
    // response: Success message string
}
```

**Failure Response:**
```swift
onError: { (error: CometChatException) in
    // error.errorCode: String
    // error.errorDescription: String
}
```

---

## 3. Complete Error Codes Reference

| Error Code | Description | Common Scenario |
|------------|-------------|-----------------|
| `ERR_NOT_LOGGED_IN` | User is not logged in | Calling API before login |
| `ERR_UID_NOT_FOUND` | User ID not found | Invalid receiver UID |
| `ERR_GUID_NOT_FOUND` | Group ID not found | Invalid group GUID |
| `ERR_INVALID_API_KEY` | Invalid API key | Wrong auth key |
| `ERR_INVALID_APP_ID` | Invalid App ID | Wrong app ID |
| `ERR_INVALID_REGION` | Invalid region | Wrong region code |
| `ERR_BLOCKED_BY_RECEIVER` | Blocked by receiver | Sending to user who blocked you |
| `ERR_USER_DEACTIVATED` | User account deactivated | Login with deactivated account |
| `ERR_INVALID_MESSAGE_ID` | Invalid message ID | Wrong message ID for edit/delete |
| `ERR_ALREADY_JOINED` | Already joined the group | Joining group already member of |
| `ERR_NOT_A_MEMBER` | Not a member of the group | Sending to group not joined |
| `ERR_WRONG_PASSWORD` | Wrong group password | Incorrect password for protected group |
| `ERR_GROUP_NOT_JOINED` | Group not joined | Accessing group without joining |
| `ERR_PERMISSION_DENIED` | Permission denied | Insufficient permissions |

---

## 4. Enums Reference

### 4.1 ReceiverType
```swift
enum ReceiverType: Int {
    case user = 0
    case group = 1
}
```

### 4.2 MessageType
```swift
enum MessageType: Int {
    case text = 0
    case image = 1
    case video = 2
    case audio = 3
    case file = 4
    case custom = 5
    case groupMember = 6
    case assistant = 7
    case toolResult = 8
    case toolArguments = 9
}
```

### 4.3 MessageCategory
```swift
enum MessageCategory: Int {
    case message = 0
    case action = 1
    case call = 2
    case custom = 3
    case interactive = 4
}
```

### 4.4 UserStatus
```swift
enum UserStatus: Int {
    case online = 0
    case offline = 1
}
```

### 4.5 ConversationType
```swift
enum ConversationType: Int {
    case user = 0
    case group = 1
    case none = 2
}
```

### 4.6 GroupType
```swift
enum groupType: Int {
    case `public` = 0
    case `private` = 1
    case password = 2
}
```

### 4.7 GroupMemberScopeType
```swift
enum GroupMemberScopeType: Int {
    case admin = 0
    case moderator = 1
    case participant = 2
}
```

---

## 5. Documentation Changes Summary

### 5.1 Files Updated

| File | Changes Made |
|------|--------------|
| `overview.mdx` | Added Quick Reference section |
| `setup.mdx` | Added Quick Reference section |
| `send-message.mdx` | Added Quick Reference section |
| `receive-message.mdx` | Added Quick Reference section |
| All 94 SDK iOS docs | Added AI Agent Quick Reference sections |

### 5.2 Recommended Additional Updates

1. **Add Success/Failure Response Tables** to each API documentation page
2. **Add BaseMessage Properties Reference** to messaging-overview.mdx
3. **Add Error Codes Reference Page** as a new document
4. **Add Data Models Reference Page** documenting all classes

---

## 6. Verification Status

| Category | Status | Notes |
|----------|--------|-------|
| Method Signatures | ✅ Verified | All match SDK interface |
| Data Models | ✅ Documented | Complete property lists |
| Error Codes | ✅ Documented | Common codes listed |
| Success Responses | ✅ Documented | Return types specified |
| Failure Responses | ✅ Documented | Exception structure documented |

---

## 7. Conclusion

The CometChat iOS SDK documentation has been verified against the actual SDK implementation. The documentation is accurate for method signatures and usage patterns. This report adds comprehensive documentation for:

1. Complete data model properties
2. Success/failure response structures
3. Error codes and scenarios
4. Enum values and their meanings

With these additions, any AI or developer should be able to build a complete working app by following only the documentation.

---

*Report generated by Documentation Verification System*
