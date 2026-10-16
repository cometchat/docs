---
title: Flutter UI Kit Quickstart
framework: flutter
prerequisites:
  - "Flutter 3.38.9+ (Dart 3.10.8+)"
  - "Android minSdk 26, iOS 15.1"
  - "CometChat App ID, Auth Key, and Region from app.cometchat.com"
last_verified: "2026-10-16"
packages:
  - registry: pub
    name: "cometchat_chat_uikit"
    version: "6.2.0"
---

# Flutter UI Kit Quickstart

Install the CometChat Flutter UI Kit v6, initialize it, log a user in, and show a conversation list that opens a chat screen (header, message list, composer) with threaded replies.

Source: https://www.cometchat.com/docs/ui-kit/flutter/getting-started

## 1. Add the dependency

```yaml
# pubspec.yaml → dependencies:   (then run: flutter pub get)
  cometchat_chat_uikit: ^6.2.0
```

That is the only CometChat package you need. `cometchat_sdk` and `cometchat_calls_sdk` come in transitively, and the SDK types (`User`, `Group`, `BaseMessage`) are re-exported by the kit import. Do not add `flutter_chat_ui_kit` or `cometchat_calls_uikit`: they are older packages that do not work with v6.

Platform floors (set by `cometchat_calls_sdk`, which the kit always pulls in, even without calling): Android `minSdk = 26` in `android/app/build.gradle.kts`; iOS `platform :ios, '15.1'` in `ios/Podfile`, then `pod install`.

## 2. Initialize, log in, render

```dart
// lib/main.dart
import 'package:cometchat_chat_uikit/cometchat_chat_uikit.dart';
import 'package:flutter/material.dart';

const appId = String.fromEnvironment('COMETCHAT_APP_ID');
const region = String.fromEnvironment('COMETCHAT_REGION');
const authKey = String.fromEnvironment('COMETCHAT_AUTH_KEY'); // dev only
const uid = String.fromEnvironment('COMETCHAT_UID', defaultValue: 'cometchat-uid-1');

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        localizationsDelegates: Translations.localizationsDelegates,
        supportedLocales: Translations.supportedLocales,
        home: const ChatGate(),
      );
}

class ChatGate extends StatefulWidget {
  const ChatGate({super.key});
  @override
  State<ChatGate> createState() => _ChatGateState();
}

class _ChatGateState extends State<ChatGate> {
  bool _ready = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final settings = (UIKitSettingsBuilder()
          ..subscriptionType = CometChatSubscriptionType.allUsers
          ..autoEstablishSocketConnection = true
          ..appId = appId
          ..region = region
          ..authKey = authKey)
        .build();

    // init must succeed before login; no CometChat widget renders before login succeeds.
    CometChatUIKit.init(
      uiKitSettings: settings,
      onSuccess: (_) => CometChatUIKit.login(
        uid,
        onSuccess: (_) => mounted ? setState(() => _ready = true) : null,
        onError: (e) => mounted ? setState(() => _error = e.message) : null,
      ),
      onError: (e) => mounted ? setState(() => _error = e.message) : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) return Scaffold(body: Center(child: Text('CometChat error: $_error')));
    if (!_ready) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    return Scaffold(
      body: SafeArea(
        child: CometChatConversations(
          hideSearch: true,
          onItemTap: (conversation) {
            final entity = conversation.conversationWith;
            Navigator.push(context, MaterialPageRoute(
              builder: (_) => MessageScreen(
                user: entity is User ? entity : null,
                group: entity is Group ? entity : null,
              ),
            ));
          },
        ),
      ),
    );
  }
}

class MessageScreen extends StatelessWidget {
  const MessageScreen({super.key, this.user, this.group});
  final User? user;
  final Group? group;

  @override
  Widget build(BuildContext context) => Scaffold(       // keyboard-safe by default
        body: SafeArea(
          child: Column(children: [
            CometChatMessageHeader(user: user, group: group, onBack: () => Navigator.pop(context)),
            Expanded(
              child: CometChatMessageList(
                user: user,
                group: group,
                onThreadRepliesClick: (BaseMessage message, BuildContext context,
                    {CometChatMessageTemplate? template}) {
                  Navigator.push(context, MaterialPageRoute(
                    builder: (_) => ThreadScreen(parentMessage: message, user: user, group: group),
                  ));
                },
              ),
            ),
            CometChatMessageComposer(user: user, group: group),
          ]),
        ),
      );
}

class ThreadScreen extends StatelessWidget {
  const ThreadScreen({super.key, required this.parentMessage, this.user, this.group});
  final BaseMessage parentMessage;
  final User? user;
  final Group? group;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Thread')),        // the thread header has no back button
        body: SafeArea(
          child: Column(children: [
            CometChatThreadedHeader(
              parentMessage: parentMessage,
              loggedInUser: CometChatUIKit.loggedInUser!,
            ),
            Expanded(
              child: CometChatMessageList(
                  user: user, group: group, parentMessageId: parentMessage.id),
            ),
            CometChatMessageComposer(
                user: user, group: group, parentMessageId: parentMessage.id),
          ]),
        ),
      );
}
```

Run with credentials passed at build time (never commit them):

```bash
flutter run --dart-define=COMETCHAT_APP_ID=your_app_id \
            --dart-define=COMETCHAT_REGION=us \
            --dart-define=COMETCHAT_AUTH_KEY=your_auth_key
```

## Common pitfalls

- **v5 widgets.** `CometChatConversationsWithMessages`, `CometChatUsersWithMessages`, `CometChatMessages` and `CometChatUI` were removed in v6. Build the screens from `CometChatConversations` + `CometChatMessageHeader` + `CometChatMessageList` + `CometChatMessageComposer` as above. Do not mix a v5 `cometchat_chat_uikit` with v6 code.
- **Platform floor too low.** Android `minSdk` below 26 fails the manifest merge; iOS below 15.1 fails `pod install`. Older docs that say 24 / 13.0 are wrong for 6.2.0.
- **Rendering before login.** Any `CometChat*` widget built before `login` succeeds shows an empty or broken screen. An auth error is usually the wrong Region.
- **Auth Key in production.** It is dev only. Mint an auth token on your server and call `CometChatUIKit.loginWithAuthToken(token, onSuccess: ..., onError: ...)`.
- **Inventing a UID.** `login()` needs an existing user. New apps include `cometchat-uid-1` to `cometchat-uid-5`.
- **Thread widget name and params.** It is `CometChatThreadedHeader(parentMessage:, loggedInUser:)`, not `CometChatThreadHeader`, and it has no `onBack`.
- **`onThreadRepliesClick` with one argument.** The callback takes `(BaseMessage, BuildContext, {CometChatMessageTemplate? template})`; a one-argument closure does not compile.
- **Thread list/composer without `user`/`group`.** `parentMessageId` alone means replies never send.
- **Message list not in `Expanded`.** It needs a bounded height, or you get an unbounded-height error or a collapsed list.
- **Localization class.** Flutter v6 uses `Translations` (as in `MaterialApp` above); there is no `CometChatLocalize` in 6.2.0.
- **Calls.** Calling is off by default. To enable it set `..enableCalls = true` on `UIKitSettingsBuilder`, set `navigatorKey: CallNavigationContext.navigatorKey` on `MaterialApp`, import `package:cometchat_chat_uikit/cometchat_calls_uikit.dart` for call widgets, and add camera/microphone permissions. Do not mount `CometChatIncomingCall` yourself; the kit shows it.

## What to read next

- Components: https://www.cometchat.com/docs/ui-kit/flutter/components-overview
- Theme: https://www.cometchat.com/docs/ui-kit/flutter/theme-introduction
- Methods: https://www.cometchat.com/docs/ui-kit/flutter/methods
- Calling: https://www.cometchat.com/docs/ui-kit/flutter/call-features
