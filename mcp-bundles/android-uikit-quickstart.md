---
title: Android UI Kit Quickstart (Jetpack Compose)
framework: android
prerequisites:
  - "Android Studio with a Jetpack Compose app module (Kotlin)"
  - "minSdk 28, compileSdk 36, AGP 8.9.1+, Gradle 8.11+, Kotlin 2.1+, JVM target 11"
  - "CometChat App ID, Auth Key, and Region from app.cometchat.com"
last_verified: "2026-10-16"
packages:
  - registry: maven
    name: "com.cometchat:chatuikit-compose-android"
    version: "6.1.1"
  - registry: maven
    name: "com.cometchat:chatuikit-kotlin-android"
    version: "6.1.1"
  - registry: maven
    name: "com.cometchat:calls-sdk-android"
    version: "5.0.4"
---

# Android UI Kit Quickstart (Jetpack Compose)

Install the CometChat Android UI Kit v6, initialize it, log a user in, and show a conversation list that opens a chat screen (header, message list, composer) with threaded replies.

Source: https://www.cometchat.com/docs/ui-kit/android/getting-started-jetpack

v6 ships two artifacts. This recipe uses `chatuikit-compose-android`. For an XML Views app use `com.cometchat:chatuikit-kotlin-android:6.1.1` instead (https://www.cometchat.com/docs/ui-kit/android/getting-started-kotlin). Never install both. The old v5 artifact `com.cometchat:chat-uikit-android` does not have a 6.x release; remove it if present.

## 1. Gradle

```kotlin
// settings.gradle.kts → dependencyResolutionManagement { repositories { ... } }
maven("https://dl.cloudsmith.io/public/cometchat/cometchat/maven/")
```

```kotlin
// app/build.gradle.kts (Compose plugin already applied by the Android Studio Compose template)
import java.util.Properties   // must be the first line of the file

val localProps = Properties().apply {
    rootProject.file("local.properties").takeIf { it.exists() }?.inputStream()?.use { load(it) }
}
android {
    compileSdk = 36
    defaultConfig {
        minSdk = 28
        listOf("COMETCHAT_APP_ID", "COMETCHAT_REGION", "COMETCHAT_AUTH_KEY").forEach {
            buildConfigField("String", it, "\"${localProps.getProperty(it, "")}\"")
        }
    }
    buildFeatures { compose = true; buildConfig = true }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_11; targetCompatibility = JavaVersion.VERSION_11 }
}
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11) } }

dependencies {
    implementation("com.cometchat:chatuikit-compose-android:6.1.1")
    implementation("androidx.navigation:navigation-compose:2.8.0")
    // Compose 1.8+ is REQUIRED at runtime (the kit's POM only asks for 1.7); BOM 2025.06.00 or newer.
    implementation(platform("androidx.compose:compose-bom:2025.06.00"))
    implementation("androidx.compose.material3:material3")
    // Voice/video only: implementation("com.cometchat:calls-sdk-android:5.0.4")
}
```

`gradle.properties` needs `android.useAndroidX=true`. Put `COMETCHAT_APP_ID=...`, `COMETCHAT_REGION=us` and `COMETCHAT_AUTH_KEY=...` in `local.properties` (git-ignored), never in source. No manifest edits: the kit declares the permissions it uses.

## 2. Initialize and log in (once per process)

```kotlin
// CometChatGate.kt
import android.content.Context
import androidx.compose.runtime.*
import com.cometchat.chat.core.CometChat
import com.cometchat.chat.exceptions.CometChatException
import com.cometchat.chat.models.User
import com.cometchat.uikit.core.CometChatUIKit
import com.cometchat.uikit.core.UIKitSettings

object CometChatGate {
    var ready by mutableStateOf(false); private set
    var error by mutableStateOf<String?>(null); private set
    private var started = false

    fun start(context: Context, uid: String) {        // main thread; safe to call again
        if (started) return else started = true
        val settings = UIKitSettings.UIKitSettingsBuilder()
            .setAppId(BuildConfig.COMETCHAT_APP_ID)
            .setRegion(BuildConfig.COMETCHAT_REGION)
            .setAuthKey(BuildConfig.COMETCHAT_AUTH_KEY)    // dev only
            .subscribePresenceForAllUsers()
            .build()
        CometChatUIKit.init(context.applicationContext, settings, object : CometChat.CallbackListener<String>() {
            override fun onSuccess(result: String) {          // login only after init succeeds
                if (CometChatUIKit.getLoggedInUser() != null) { ready = true; return }
                CometChatUIKit.login(uid, object : CometChat.CallbackListener<User>() {
                    override fun onSuccess(user: User) { ready = true }
                    override fun onError(e: CometChatException) { error = e.message; started = false }
                })
            }
            override fun onError(e: CometChatException) { error = e.message; started = false }
        })
    }
}
```

## 3. Render: conversations → messages → thread

```kotlin
// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        CometChatGate.start(this, "cometchat-uid-1")   // a UID that exists in your app
        setContent {
            // The Compose kit does not follow the system dark setting unless you pass a scheme.
            CometChatTheme(colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()) {
                when {
                    CometChatGate.error != null -> Text("CometChat error: ${CometChatGate.error}")
                    !CometChatGate.ready -> Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
                    else -> ChatApp()
                }
            }
        }
    }
}

@Composable
fun ChatApp() {
    val nav = rememberNavController()
    var user by rememberSaveable { mutableStateOf<User?>(null) }
    var group by rememberSaveable { mutableStateOf<Group?>(null) }
    var parent by remember { mutableStateOf<BaseMessage?>(null) }

    // One NavHost destination per screen: each gets its own ViewModel store, which the thread list needs.
    NavHost(nav, startDestination = "conversations") {
        composable("conversations") {
            CometChatConversations(
                modifier = Modifier.fillMaxSize().systemBarsPadding(), hideSearchBox = true,
                onItemClick = { c ->
                    user = c.conversationWith as? User; group = c.conversationWith as? Group
                    nav.navigate("messages")
                },
            )
        }
        composable("messages") {
            ChatColumn {
                CometChatMessageHeader(user = user, group = group, onBackPress = { nav.popBackStack() })
                CometChatMessageList(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    user = user, group = group,
                    onThreadRepliesClick = { msg -> parent = msg; nav.navigate("thread") },
                )
                CometChatMessageComposer(user = user, group = group)
            }
        }
        composable("thread") {
            val p = parent ?: return@composable LaunchedEffect(Unit) { nav.popBackStack() }
            ChatColumn {
                CometChatThreadHeader(parentMessage = p)   // display only: system back pops
                CometChatMessageList(Modifier.fillMaxWidth().weight(1f), user = user, group = group, parentMessageId = p.id)
                CometChatMessageComposer(user = user, group = group, parentMessageId = p.id)
            }
        }
    }
}

@Composable
fun ChatColumn(content: @Composable ColumnScope.() -> Unit) =
    Column(Modifier.fillMaxSize().systemBarsPadding().imePadding(), content = content)
```

Imports: Compose UI from `androidx.compose.*`, `androidx.navigation.compose.*`; models from `com.cometchat.chat.models.*` (`User`, `Group`, `BaseMessage`); theme from `com.cometchat.uikit.compose.theme.*` (`CometChatTheme`, `lightColorScheme`, `darkColorScheme`); components from `com.cometchat.uikit.compose.presentation.<area>.ui.*` (`conversations`, `messageheader`, `messagelist`, `messagecomposer`, `threadheader`).

## Common pitfalls

- **v5 code or artifacts.** `CometChatConversationsWithMessages` and the other v5 combined screens do not exist in v6, and v5 imports (`com.cometchat.chatuikit.*`) do not compile; v6 is `com.cometchat.uikit.*`. Compose the screen from conversations + header + list + composer as above.
- **Compose older than 1.8 → crash when the list opens.** The 6.1.1 POM declares compose-bom 2024.09.00 (Compose 1.7), but the kit calls a Compose 1.8 `LazyColumn` overload. On 1.7 the app builds, then crashes with `NoSuchMethodError: ... LazyColumn(...)` as soon as `CometChatConversations` renders. Pin a compose BOM of 2025.06.00 or newer as above.
- **Build floors too low.** The kit pulls `androidx.core` 1.18, which needs minSdk 28, compileSdk 36, AGP 8.9.1+, Gradle 8.11+ and Kotlin 2.1+. A lower value fails `checkDebugAarMetadata`.
- **Missing CometChat Maven repository** → `Could not find com.cometchat:chatuikit-...`.
- **Login before init finishes, or UI before login.** Login silently fails, or the screens render empty. Gate on init → login → render as above.
- **Auth Key in production.** It is dev only. Mint an auth token on your server and call `CometChatUIKit.loginWithAuthToken(token, listener)`.
- **Inventing a UID.** `login()` needs an existing user. New apps include `cometchat-uid-1` to `cometchat-uid-5`.
- **Thread screen without `user`/`group`.** `parentMessageId` alone means replies never send. Pass the same target as the main chat.
- **Thread in the same composition as the main list** (an if/else instead of NavHost routes): both lists share one ViewModel and the thread shows the whole chat.
- **No `weight(1f)` on the list or no `imePadding()`:** the composer is pushed off screen or hidden by the keyboard.
- **Calling turned on without the calls SDK.** `setEnableCalling(true)` needs `com.cometchat:calls-sdk-android`; without it 6.1.1 logs a warning and calling stays off.

## What to read next

- Components: https://www.cometchat.com/docs/ui-kit/android/components-overview
- Theme: https://www.cometchat.com/docs/ui-kit/android/theme-introduction
- Methods: https://www.cometchat.com/docs/ui-kit/android/methods
- Calling: https://www.cometchat.com/docs/ui-kit/android/calling-integration
