# Repro — `enableCalling: true` without the Calls SDK crashes the app at launch

**Kit:** `com.cometchat:chatuikit-compose-android:6.0.5` (crash path is in the shared
`chatuikit-core`, so `chatuikit-kotlin-android` is affected identically)
**Device:** Pixel 8 emulator, API 36 · **Observed:** 2026-08-21

## Steps

1. New Android app, `minSdk 28`, Kotlin DSL. Add the CometChat maven to `settings.gradle.kts`:
   ```kotlin
   maven("https://dl.cloudsmith.io/public/cometchat/cometchat/maven/")
   ```
2. Add **only** the UI Kit — deliberately **no** `calls-sdk-android`:
   ```kotlin
   dependencies { implementation("com.cometchat:chatuikit-compose-android:6.0.+") }
   configurations.all { exclude(group = "org.jetbrains", module = "annotations-java5") }
   ```
3. Create `app/src/main/assets/cometchat-settings.json` with **valid** credentials and the calling
   flag ON. Credentials must be valid — the crash occurs *after* chat init succeeds:
   ```json
   {
     "appId": "<REAL_APP_ID>",
     "region": "<REAL_REGION>",
     "credentials": { "authKey": "<REAL_AUTH_KEY>" },
     "uiKit": { "subscribePresenceForAllUsers": true, "enableCalling": true }
   }
   ```
4. In `MainActivity.onCreate`, call init — nothing else is required:
   ```kotlin
   CometChatUIKit.initFromSettings(this, object : CometChat.CallbackListener<String>() {
       override fun onSuccess(result: String) { /* never reached */ }
       override fun onError(e: CometChatException?) { /* never reached */ }
   })
   ```
5. Build, install, launch.

## Expected
Either init succeeds with calling silently unavailable, or `onError` fires with an actionable
message naming the missing dependency.

## Actual
Process dies in `onCreate`, before any UI renders. Neither `onSuccess` nor `onError` is called —
the throw escapes the callback.

```
FATAL EXCEPTION: main
java.lang.NoClassDefFoundError: Failed resolution of:
  Lcom/cometchat/calls/core/CometChatCalls$SessionSettingsBuilder;
    at com.cometchat.uikit.core.CometChatUIKit.initCometChatCalls(CometChatUIKit.kt:229)
    at com.cometchat.uikit.core.CometChatUIKit.access$initCometChatCalls(CometChatUIKit.kt:40)
    at com.cometchat.uikit.core.CometChatUIKit$initFromSettings$1.onSuccess(CometChatUIKit.kt:196)
    at com.cometchat.uikit.core.CometChatUIKit$initFromSettings$1.onSuccess(CometChatUIKit.kt:187)
    at com.cometchat.chat.core.CometChat.init(CometChat.java:63)
    at com.cometchat.chat.core.CometChat.initFromSettings(CometChat.java:138)
    at com.cometchat.uikit.core.CometChatUIKit.initFromSettings(CometChatUIKit.kt:185)
    at com.example.composechat.MainActivity.onCreate(MainActivity.kt:38)
```

## Confirming the cause
Set `"enableCalling": false`, change nothing else, rebuild → `init OK` then `login OK`, app runs
normally. Flip it back → crash returns.

## Why it matters
- The symptom (app will not start at all) is maximally distant from the cause (one boolean in a
  JSON asset). Nothing in the flag's name implies a Gradle dependency.
- It **compiles cleanly**, so no build-time gate can catch it.
- It is trivially hit by copying `cometchat-settings.json` between projects — which is how it was
  found here.
- `onError` is not invoked, so an app that correctly handles init failure still dies.

## Suggested fix
Guard `initCometChatCalls` so a missing Calls SDK routes to `callbackListener.onError(...)` with a
message naming the required dependency, rather than propagating `NoClassDefFoundError`. Unlike the
`CometChatCallLogs` case (where a missing dependency legitimately cannot work), here calling is an
*optional* feature the app may never use — a launch crash is disproportionate.
