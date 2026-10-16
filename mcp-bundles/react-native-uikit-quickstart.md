---
title: React Native UI Kit Quickstart
framework: react-native
prerequisites:
  - "Node.js 18+"
  - "React Native 0.77+ (bare CLI) or Expo with a development build (Expo Go cannot load the kit's native modules)"
  - "CometChat App ID, Region and Auth Key from app.cometchat.com (Auth Key is for development only)"
last_verified: "2026-10-16"
packages:
  - registry: npm
    name: "@cometchat/chat-uikit-react-native"
    version: "5.5.2"
  - registry: npm
    name: "@cometchat/chat-sdk-react-native"
    version: "4.1.0"
  - registry: npm
    name: "@cometchat/calls-sdk-react-native"
    version: "5.0.6"
---

# React Native UI Kit Quickstart

Install the CometChat React Native UI Kit v5, initialize, log in, and show a conversation list that opens a chat screen. React Native is not React: the web kit's `UIKitSettingsBuilder`, `login("uid")` and `onItemClick` do not exist here.

Source: https://www.cometchat.com/docs/ui-kit/react-native/react-native-cli-integration

## 1. Install

```bash
npm install @cometchat/chat-uikit-react-native@5.5.2 @cometchat/chat-sdk-react-native@4.1.0
# Required native peers, plus the navigation used in step 5
npm install @react-native-clipboard/clipboard react-native-gesture-handler react-native-svg \
  react-native-video react-native-localize react-native-safe-area-context \
  @react-native-async-storage/async-storage@^2.1.2 \
  @react-navigation/native @react-navigation/native-stack react-native-screens
npm install punycode   # Expo only: the kit's markdown parser imports it and Metro does not provide it
```

Optional calling. Installing the package turns calling on (there is no `setCallingEnabled` here):

```bash
npm install @cometchat/calls-sdk-react-native@5.0.6 react-native-background-timer@^2.4.1 \
  react-native-performance@^5.1.2 react-native-url-polyfill@^2.0.0 react-native-webrtc@^124.0.7
```

## 2. Configure native projects

- **Bare RN, iOS:** inside your app target in `ios/Podfile` add `pod 'SPTPersistentCache', :modular_headers => true` and `pod 'DVAssetLoaderDelegate', :modular_headers => true`, then `cd ios && pod install`. Without them `pod install` fails.
- **Bare RN:** `import "react-native-gesture-handler";` must be the first line of `index.js` (otherwise release builds crash).
- **Android** `minSdkVersion` 24+. iOS deployment target 13.0+ if you add calling.
- **Expo:** use a development build (`npx expo run:ios` / `run:android`); declare camera/mic permissions in `app.json`, since prebuild overwrites `ios/` and `android/`.
- After adding any native module, rebuild the app. A Metro reload is not enough.

## 3. Initialize and 4. Log in

`init` must resolve before `login`, and `login` before any kit component renders. Settings are a plain object, and `login` takes an object: `{ uid }` in development, `{ authToken }` (minted by your server) in production. Cache the promise so re-renders and Fast Refresh do not start a second login.

```ts
// src/cometchat.ts
import { CometChatUIKit } from "@cometchat/chat-uikit-react-native";
import { CometChat } from "@cometchat/chat-sdk-react-native";

const settings: CometChat.CometChatSettings = {
  appId: "YOUR_APP_ID", region: "YOUR_REGION",   // Dashboard -> Credentials
  credentials: { authKey: "YOUR_AUTH_KEY" },     // development only
  chatSDK: { presenceSubscription: { type: "ALL_USERS" }, autoEstablishSocketConnection: true },
};

let boot: Promise<CometChat.User> | null = null;
export function ensureReady(uid: string): Promise<CometChat.User> {
  boot ??= CometChatUIKit.initFromSettings(settings)
    .then(() => CometChatUIKit.login({ uid }))
    .catch((e) => { boot = null; throw e; });
  return boot;
}
```

`initFromSettings` records the integration as agent-built. The classic `CometChatUIKit.init({ appId, region, authKey, subscriptionType: "ALL_USERS" })` takes the same values as a plain object. Use a UID that exists in your app (new apps include `cometchat-uid-1` to `cometchat-uid-5`).

## 5. Render

There is no `CometChatConversationsWithMessages` in v5. Show `CometChatConversations`, then push a screen with header + list + composer.

```tsx
// App.tsx
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps as P } from "@react-navigation/native-stack";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import {
  CometChatConversations, CometChatI18nProvider, CometChatMessageComposer, CometChatMessageHeader,
  CometChatMessageList, CometChatThemeProvider, CometChatUiKitConstants,
} from "@cometchat/chat-uikit-react-native";
import { ensureReady } from "./src/cometchat";

type Routes = { Conversations: undefined; Messages: { user?: CometChat.User; group?: CometChat.Group } };
const Stack = createNativeStackNavigator<Routes>();

const ConversationsScreen = ({ navigation }: P<Routes, "Conversations">) => (
  <CometChatConversations
    onItemPress={(c: CometChat.Conversation) => {
      const isUser = c.getConversationType() === CometChatUiKitConstants.ConversationTypeConstants.user;
      const peer = c.getConversationWith();
      navigation.navigate("Messages", isUser ? { user: peer as CometChat.User } : { group: peer as CometChat.Group });
    }}
  />
);

const MessagesScreen = ({ route, navigation }: P<Routes, "Messages">) => {
  const { user, group } = route.params;
  return (
    <View style={{ flex: 1 }}>
      {/* showBackButton defaults to false on RN; without it onBack never fires */}
      <CometChatMessageHeader user={user} group={group} showBackButton onBack={() => navigation.goBack()} />
      <CometChatMessageList user={user} group={group} />
      <CometChatMessageComposer user={user} group={group} />
    </View>
  );
};

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { ensureReady("cometchat-uid-1").then(() => setReady(true), console.error); }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CometChatI18nProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <CometChatThemeProvider>
              {!ready ? <ActivityIndicator style={{ flex: 1 }} /> : (
                <NavigationContainer>
                  <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Conversations" component={ConversationsScreen} />
                    <Stack.Screen name="Messages" component={MessagesScreen} />
                  </Stack.Navigator>
                </NavigationContainer>
              )}
            </CometChatThemeProvider>
          </SafeAreaView>
        </CometChatI18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## Common pitfalls

- **Running in Expo Go**, or a missing native peer. The app crashes on mount with an error naming the peer (svg, video, gesture-handler), not CometChat.
- **Missing `GestureHandlerRootView`** (outermost, `flex: 1`). Swipes and long-press silently do nothing.
- **Rendering before `login()` resolves.** Blank screen, no error.
- **Porting React web code.** `UIKitSettingsBuilder`, `login(uid)`, `onItemClick`, CSS and `*WithMessages` components do not exist. Callbacks use `Press` (`onItemPress`, `onThreadRepliesPress`); view slots are PascalCase (`ItemView`, `TrailingView`).
- **`showSearchBar` defaults to `false`** on `CometChatConversations`. Set it and wire `onSearchBarClicked` to a `CometChatSearch` screen.
- **Calls SDK without its peers.** The kit loads the calls SDK at startup, so a missing `react-native-url-polyfill` or `react-native-performance` breaks the Metro bundle even for chat-only apps. Keep `react-native-performance` on 5.x.
- **Fixed heights or two headers.** Use `flex: 1` (fixed heights break with the keyboard) and `headerShown: false` on screens with `CometChatMessageHeader`.
- **`tsc` errors inside `node_modules/@cometchat/chat-uikit-react-native`.** The kit ships TypeScript source. Ignore them; gate on the Metro bundle.
- **Auth Key in production.** App bundles are readable. Log in with a server-issued auth token.

## What to read next

- Expo setup: https://www.cometchat.com/docs/ui-kit/react-native/expo-integration
- Components: https://www.cometchat.com/docs/ui-kit/react-native/components-overview
- Theme: https://www.cometchat.com/docs/ui-kit/react-native/theme
- Calling: https://www.cometchat.com/docs/ui-kit/react-native/calling-integration
