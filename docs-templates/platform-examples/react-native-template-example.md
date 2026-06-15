# React Native (TypeScript) Platform Template Example

This is a complete, filled-in example of the component page template using React Native/TypeScript syntax. It demonstrates all React Native-specific patterns including imports, TypeScript/JSX callback syntax, React Native types (ColorValue, TextStyle, ViewStyle), StyleSheet.create() styling, useEffect cleanup patterns, and object configuration builder patterns.

The example uses `CometChatConversations` as the reference component.

---

## Complete React Native Component Page Example

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
  "package": "@cometchat/chat-uikit-react-native",
  "import": "import { CometChatConversations } from '@cometchat/chat-uikit-react-native';",
  "description": "Displays a list of all conversations for the logged-in user with real-time updates",
  "inherits": "React.FC",
  "primaryOutput": {
    "callback": "onItemPress",
    "type": "(conversation: CometChat.Conversation) => void"
  },
  "props": {
    "data": {
      "conversationsRequestBuilder": {
        "type": "CometChat.ConversationsRequestBuilder",
        "default": "undefined",
        "note": "Custom request builder for filtering conversations"
      }
    },
    "callbacks": {
      "onItemPress": "(conversation: CometChat.Conversation) => void",
      "onItemLongPress": "(conversation: CometChat.Conversation) => void",
      "onBack": "() => void",
      "onSelection": "(conversations: CometChat.Conversation[]) => void",
      "onError": "(error: CometChat.CometChatException) => void",
      "onEmpty": "() => void",
      "onLoad": "(conversations: CometChat.Conversation[]) => void"
    },
    "visibility": {
      "hideSearch": { "type": "boolean", "default": false },
      "hideReceipts": { "type": "boolean", "default": false },
      "hideUserStatus": { "type": "boolean", "default": false },
      "hideGroupType": { "type": "boolean", "default": false },
      "hideDeleteConversationOption": { "type": "boolean", "default": false },
      "hideBackButton": { "type": "boolean", "default": false }
    },
    "sound": {
      "disableSoundForMessages": { "type": "boolean", "default": false }
    },
    "selection": {
      "selectionMode": { "type": "SelectionMode", "default": "SelectionMode.none" }
    },
    "viewSlots": {
      "ListItemView": "(conversation: CometChat.Conversation) => JSX.Element",
      "SubtitleView": "(conversation: CometChat.Conversation) => JSX.Element",
      "TailView": "(conversation: CometChat.Conversation) => JSX.Element",
      "EmptyStateView": "() => JSX.Element",
      "ErrorStateView": "(error: CometChat.CometChatException) => JSX.Element",
      "LoadingStateView": "() => JSX.Element"
    },
    "formatting": {
      "datePattern": "(conversation: CometChat.Conversation) => string"
    }
  },
  "events": [
    {
      "name": "ccConversationDelete",
      "payload": "CometChat.Conversation",
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
    "flow": "User taps conversation → onItemPress fires → Navigate to CometChatMessages with user/group"
  },
  "types": {
    "Conversation": {
      "conversationId": "string",
      "conversationType": "string",
      "conversationWith": "CometChat.User | CometChat.Group",
      "lastMessage": "CometChat.BaseMessage",
      "unreadMessageCount": "number"
    },
    "ConversationType": {
      "user": "CometChat.CONVERSATION_TYPE.USER",
      "group": "CometChat.CONVERSATION_TYPE.GROUP"
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

```tsx
import React from 'react';
import { View } from 'react-native';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import { CometChatConversations, CometChatMessages } from '@cometchat/chat-uikit-react-native';
import { useNavigation } from '@react-navigation/native';

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleItemPress = (conversation: CometChat.Conversation) => {
    const conversationWith = conversation.getConversationWith();
    
    if (conversationWith instanceof CometChat.User) {
      navigation.navigate('Messages', { user: conversationWith });
    } else if (conversationWith instanceof CometChat.Group) {
      navigation.navigate('Messages', { group: conversationWith });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CometChatConversations
        onItemPress={handleItemPress}
      />
    </View>
  );
};

export default ChatListScreen;
```

<Frame>
  <img src="/images/conversations-context.png" />
</Frame>

---

<!-- ============================================================ -->
<!-- MINIMAL RENDER SECTION                                        -->
<!-- ============================================================ -->

## Minimal Render

```tsx
import React from 'react';
import { View } from 'react-native';
import { CometChatConversations } from '@cometchat/chat-uikit-react-native';

const MinimalConversationsScreen: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <CometChatConversations />
    </View>
  );
};

export default MinimalConversationsScreen;
```

<Frame>
  <img src="/images/conversations-default.png" />
</Frame>

---

<!-- ============================================================ -->
<!-- FILTERING SECTION                                             -->
<!-- ============================================================ -->

## Filtering

Use `CometChat.ConversationsRequestBuilder` to filter which conversations appear in the list. The builder pattern uses method chaining for configuration.

```tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import { CometChatConversations } from '@cometchat/chat-uikit-react-native';

const FilteredConversationsScreen: React.FC = () => {
  // Create a custom request builder using useMemo for performance
  const requestBuilder = useMemo(() => {
    return new CometChat.ConversationsRequestBuilder()
      .setLimit(30)
      .setConversationType(CometChat.CONVERSATION_TYPE.USER);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CometChatConversations
        conversationsRequestBuilder={requestBuilder}
      />
    </View>
  );
};

export default FilteredConversationsScreen;
```

### Filter Recipes

| Recipe | Code |
|--------|------|
| Show only one-on-one chats | `.setConversationType(CometChat.CONVERSATION_TYPE.USER)` |
| Show only group chats | `.setConversationType(CometChat.CONVERSATION_TYPE.GROUP)` |
| Filter by tags | `.setTags(['support', 'sales']).withTags(true)` |
| Limit results | `.setLimit(20)` |
| Include user/group tags | `.withUserAndGroupTags(true)` |

---

<!-- ============================================================ -->
<!-- ACTIONS AND EVENTS SECTION                                    -->
<!-- ============================================================ -->

## Actions and Events

### Callback Props

#### onItemPress

Fires when a user taps on a conversation. Use this to navigate to the messages screen.

```tsx
import React from 'react';
import { View } from 'react-native';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import { CometChatConversations } from '@cometchat/chat-uikit-react-native';
import { useNavigation } from '@react-navigation/native';

const ConversationsWithTapHandler: React.FC = () => {
  const navigation = useNavigation();

  const handleItemPress = (conversation: CometChat.Conversation) => {
    const conversationWith = conversation.getConversationWith();
    
    if (conversationWith instanceof CometChat.User) {
      navigation.navigate('Messages', { user: conversationWith });
    } else if (conversationWith instanceof CometChat.Group) {
      navigation.navigate('Messages', { group: conversationWith });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CometChatConversations
        onItemPress={handleItemPress}
      />
    </View>
  );
};

export default ConversationsWithTapHandler;
```

#### onItemLongPress

Fires when a user long-presses on a conversation. Use this to show additional options like delete or mute.

```tsx
import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import { CometChatConversations } from '@cometchat/chat-uikit-react-native';

const ConversationsWithLongPress: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<CometChat.Conversation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleItemLongPress = (conversation: CometChat.Conversation) => {
    setSelectedConversation(conversation);
    setModalVisible(true);
  };

  const handleDelete = () => {
    if (selectedConversation) {
      // Delete logic
      console.log('Deleting conversation:', selectedConversation.getConversationId());
    }
    setModalVisible(false);
  };

  const handleMute = () => {
    if (selectedConversation) {
      // Mute logic
      console.log('Muting conversation:', selectedConversation.getConversationId());
    }
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <CometChatConversations
        onItemLongPress={handleItemLongPress}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.option} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={handleMute}>
              <Text>Mute</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={() => setModalVisible(false)}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  deleteText: {
    color: 'red',
  },
});

export default ConversationsWithLongPress;
```