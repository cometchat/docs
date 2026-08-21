# Android docs audit — UI Kit v6 + Chat SDK v5

Every entry below was found by **mechanically diffing the docs against the shipped source**, not by
reading. Each row names the source file + line that proves it. Raised while building the Android
skill pack (Linear ENG-38207).

## Source of truth used
| Surface | Repo / artifact | Version |
|---|---|---|
| UI Kit v6 | `cometchat-team/uikit-android` — `chatuikit-kotlin`, `chatuikit-compose`, `chatuikit-core` | 6.0.5 (`master-v6`) |
| Chat SDK v5 | `cometchat-team/chat-sdk-android` (+ installed AAR) | 5.0.5 |

**Method:** extract every `.setX(...)` call from each page's `Kotlin (XML Views)` tab → check it
against every `fun` declared in the three kit modules → subtract Android-framework methods. 120
documented setters checked; the misses below are what remained.

**Reproduce:** `python3` extractor in the ENG-38207 working notes; re-runnable against any kit tag.

---

## A. Wrong method name — documented call does not compile
| # | Page | Docs say | Shipped 6.0.5 | Evidence |
|---|---|---|---|---|
| A1 | `ui-kit/android/incoming-call` | `setOnAcceptClick { }` | `setOnAcceptClickListener(OnClick?)` | `chatuikit-kotlin/.../incomingcall/CometChatIncomingCall.kt:489` |
| A2 | `ui-kit/android/incoming-call` | `setOnRejectClick { }` | `setOnRejectClickListener(OnClick?)` | `…/incomingcall/CometChatIncomingCall.kt:507` |
| A3 | `ui-kit/android/outgoing-call` | `setOnEndCallClick { }` | `setOnEndCallClickListener(OnClick?)` | `…/outgoingcall/CometChatOutgoingCall.kt:493` |
| A4 | `ui-kit/android/message-composer` | `setAuxiliaryButtonView(...)` | `setAuxiliaryButtonViewListener(MessageComposerViewHolderListener)` | `…/messagecomposer/ui/CometChatMessageComposer.kt:5627` |
| A5 | `ui-kit/android/guide-ai-agent` | `messageHeader.setNewChatButtonClick { }` | `setOnNewChatClick(() -> Unit)` | `…/messageheader/ui/CometChatMessageHeader.kt:627` |
| A6 | `ui-kit/android/guide-ai-agent` | `messageHeader.setChatHistoryButtonClick { }` | `setOnChatHistoryClick(() -> Unit)` | `…/messageheader/ui/CometChatMessageHeader.kt:631` |
| A7 | `ui-kit/android/guide-threaded-messages` | `messageList.setParentMessage(it.id)` | `setParentMessageId(Long)` | `…/messagelist/ui/CometChatMessageList.kt:1709` |
| A8 | `ui-kit/android/message-list` | `mentionFormatter.setMessageListMentionTextStyle(context, style)` | no such method — use `setIncomingBubbleMentionTextStyle` / `setOutgoingBubbleMentionTextStyle` | `…/shared/formatters/CometChatMentionsFormatter.kt:166,182` |

## B. Wrong signature — right name, wrong arity/params
| # | Page | Docs say | Shipped 6.0.5 | Evidence |
|---|---|---|---|---|
| B1 | `guide-threaded-messages`, `message-list` | `setOnThreadRepliesClick { context, baseMessage, template -> }` (3 args) | `((BaseMessage) -> Unit)?` — **one** arg | `…/messagelist/ui/CometChatMessageList.kt:3727` |
| B2 | `ui-kit/android/message-composer` | `setOnSendButtonClick { context, baseMessage -> }` | `(String) -> Unit` — the typed text | `…/messagecomposer/ui/CometChatMessageComposer.kt:5395` |
| B3 | `ui-kit/android/message-composer` (Compose tab) | `onError = { context, exception -> }` | `((CometChatException) -> Unit)` — one arg | `chatuikit-compose/.../CometChatMessageComposer.kt` |

## C. Removed API — page documents a v5 surface that no longer ships
| # | Page | Issue | Replacement in v6 | Evidence |
|---|---|---|---|---|
| C1 | `ui-kit/android/message-template` | **The whole page.** `CometChatMessageTemplate()`, `setType`, `setCategory`, `setBubbleView`, `setMessageReceipt`, `setTemplates` — none exist in 6.0.5 (only the unrelated `UIKitConstants.MessageTemplateId`) | **`BubbleFactory`** — subclass it (`getCategory()`, `getType()`, `createContentView()`, `bindContentView()`) and register with `messageList.setBubbleFactories(listOf(...))` | `chatuikit-kotlin/.../shared/messagebubble/BubbleFactory.kt`; registration at `…/messagelist/ui/CometChatMessageList.kt:3475` |

## D. Stale guidance — compiles, but teaches the wrong default
| # | Page | Issue | Should be |
|---|---|---|---|
| D1 | `getting-started-kotlin`, `getting-started-jetpack` | Teach `UIKitSettings.UIKitSettingsBuilder()` + `CometChatUIKit.init(...)` with `APP_ID`/`AUTH_KEY` as **hardcoded source constants** | `CometChatUIKit.initFromSettings(context, callback)` reading a **gitignored** `app/src/main/assets/cometchat-settings.json`. The shipped kit implements it (`chatuikit-core/.../CometChatUIKit.kt:121`) and it persists `integrationSource` telemetry + auto-inits the Calls SDK. Hardcoded credentials in a sample are also a security-guidance problem. |
| D2 | `ui-kit/android/*` component pages | Most v6 component pages have **no "AI Integration Quick Reference"** accordion (35 of 68 pages do) | Backfill, so AI agents get prop/param tables without parsing prose |
| D3 | `sdk/android/v5/*` | **Zero** of the 61 v5 SDK pages carry the accordion (all 46 that exist are on the v4 root tree) | Backfill for v5 |

## E. Missing artifacts
| # | Item | Status |
|---|---|---|
| E1 | `ui-kit/android/llms-android-v6.mdx` — scoped LLM index for the v6 UI Kit | **Added** (this branch) |
| E2 | `sdk/android/v5/llms-android-v5.mdx` — scoped LLM index for the v5 SDK | **Added** (this branch) |

---

## New findings (added during the fix pass)
| # | Page | Docs say | Shipped 6.0.5 / SDK 5.0.5 | Evidence |
|---|---|---|---|---|
| A9 | `ui-kit/android/upgrading-from-v5` | `conversations.setViewModelFactory(factory)` | `setViewModel(viewModel)` — build the VM with `ViewModelProvider(this, factory)` | `…/conversations/ui/CometChatConversations.kt:887` |
| A10 | `ui-kit/android/upgrading-from-v5` | repository interface `ConversationsRepository` with `fetchConversations()` | `ConversationListRepository` with `getConversations(...)`, `deleteConversation(...)`, `markAsDelivered(...)`, `hasMoreConversations()` | `chatuikit-core/.../domain/repository/ConversationListRepository.kt:13` |
| B4 | `ui-kit/android/upgrading-from-v5` | V6 block: `composer.setOnSendButtonClick { context, message -> }` | `(String) -> Unit` | `…/CometChatMessageComposer.kt:5395` |
| A11 | `ui-kit/android/theme-introduction` (Compose tab) | `CometChatColorScheme.light().copy(...)` / `.dark().copy(...)` | **`lightColorScheme(...)` / `darkColorScheme(...)`** — top-level factories in `com.cometchat.uikit.compose.theme`, configured by **named params**; `CometChatColorScheme` is a plain class with no `.copy()`. Setting `primary` derives the whole extended ramp. | `chatuikit-compose/.../theme/CometChatColorScheme.kt:190,325` |
| S1 | `sdk/android/v5/typing-indicators` | `CometChat.endtyping(...)` — lowercase `t`, does not compile | `CometChat.endTyping(...)` | SDK source API index |
| S2 | `sdk/android/v5/typing-indicators` | 8 tab titles read `"Strat Typing"`; the stop-typing section was also mislabelled "Start" | `Start Typing` (§send) / `Stop Typing` (§end) | copy-edit |

---

## Fix log — all applied on this branch
| # | Page | Change | Verified against |
|---|---|---|---|
| A1 | `incoming-call` | `setOnAcceptClick` → `setOnAcceptClickListener` (Views only; Compose `onAcceptClick` was already correct) | source + shipped AAR |
| A2 | `incoming-call` | `setOnRejectClick` → `setOnRejectClickListener` | source |
| A3 | `outgoing-call` | `setOnEndCallClick` → `setOnEndCallClickListener` | source |
| A4 | `message-composer` | `setAuxiliaryButtonView(view)` → `setAuxiliaryButtonViewListener(object : MessageComposerViewHolderListener { createView(context, user, group) })` | `:5627` + `MessageComposerViewHolderListener.kt:39` |
| A5 | `guide-ai-agent` | `setNewChatButtonClick` → `setOnNewChatClick` | source |
| A6 | `guide-ai-agent` | `setChatHistoryButtonClick` → `setOnChatHistoryClick` | source |
| A7 | `guide-threaded-messages` | `messageList.setParentMessage(id)` → `setParentMessageId(id)` (×2; `viewModel.`/`header.setParentMessage` left alone — both correct) | source |
| A8 | `message-list` | `setMessageListMentionTextStyle` → `setIncomingBubbleMentionTextStyle` + `setOutgoingBubbleMentionTextStyle` | `CometChatMentionsFormatter.kt:166,182` |
| A9 | `upgrading-from-v5` | `setViewModelFactory(factory)` → `ViewModelProvider(this, factory)` + `setViewModel(vm)` | source |
| A10 | `upgrading-from-v5` | `ConversationsRepository.fetchConversations()` → `ConversationListRepository.getConversations()` | source |
| B1 | `guide-threaded-messages`, `message-list`, `upgrading-from-v5` | thread callback 3-arg → **1-arg** `{ baseMessage -> }` in **both** cohorts (V5 Java "before" blocks left intact) | Views `:3727`, Compose `:604` |
| B2 | `message-composer` | Views `setOnSendButtonClick { context, baseMessage -> }` → `{ text -> }` (Compose 2-arg form is correct, untouched) | `:5395` / Compose `:268` |
| B4 | `upgrading-from-v5` | same fix in the V6 "after" block | `:5395` |
| C1 | `message-template` | Added a verified `<Warning>` — the page's API is absent from the shipped artifact; documented the real `BubbleFactory` + `setBubbleFactories` replacement with a source-accurate example. **Full page rewrite still owed.** | shipped AAR: no `MessageTemplate`, has `BubbleFactory` |
| S1 | `sdk/.../typing-indicators` | `CometChat.endtyping` → `endTyping` | SDK source |
| S2 | `sdk/.../typing-indicators` | `"Strat Typing"` → `Start`/`Stop Typing` (8 titles) | copy-edit |
| A11 | `theme-introduction` | `CometChatColorScheme.light()/.dark()` + `.copy()` → `lightColorScheme(...)`/`darkColorScheme(...)` with named params (4 sites) | source + **compile-proved** in harness fixture `skill-compose-families` |

## Behaviour gaps (found by the SKILL⇄DOCS⇄SOURCE audit, not by compiling)
| # | Page | Gap | Fix |
|---|---|---|---|
| BEH-1 | `ui-kit/android/group-members` | The kit enforces a **member permission matrix** before opening the long-press menu (owner/admin/moderator/participant, plus "a moderator cannot assign admin"). The page documented scope *filtering* and *badges* but never the matrix — unknowable from the docs alone. | Added a **"Member Permissions"** section with the matrix, the scope constants, and a `<Warning>` about `updateGroupMemberScope(UID, GUID, …)` vs `transferGroupOwnership(GUID, UID, …)` having **reversed** parameter order. |

Tracked with the skill-side fixes in `cometchat-skills/THREE-WAY-AUDIT.md`.

---

## Round 2 — the three-way audit (skills ↔ docs ↔ source)

`test-suite/scripts/three-way-audit.mjs` in the skills repo compares three independent claims about
the same API. **Source is the arbiter** — the installed UI Kit, Chat SDK, Calls SDK and Cards SDK.

| Disagreement | Meaning | Who fixes |
|---|---|---|
| in SOURCE + DOCS, not in SKILLS | skill under-teaches a real API | skill |
| in SOURCE + SKILLS, not in DOCS | docs under-teach a real API | docs |
| in DOCS or SKILLS, **not in SOURCE** | **phantom** — taught but ships nowhere | whoever teaches it |

### Phantoms fixed in this round
| # | Page | Docs said | Shipped | Evidence |
|---|---|---|---|---|
| R1 | `ui-kit/android/group-members` | `getSelectedGroupMembers()` | **`getSelectedMembers()`** (+ `setOnSelection {}` to observe) | `CometChatGroupMembers.kt:772,1211` |
| R2 | `ui-kit/android/custom-text-formatter-guide`, `shortcut-formatter-guide`, `message-composer` | `CometChatUIKit.getDataSource().getTextFormatters(...)` / `.getAuxiliaryOption(...)` | **`getDataSource()` was removed after V5** — build the formatter list yourself and pass it to `setTextFormatters(...)`; the auxiliary slot has no "fetch the defaults" API, an override REPLACES them | `javap` on the shipped `chatuikit-core` AAR: no `getDataSource` |
| R3 | `sdk/android/v5/delivery-read-receipts` | `message.getReceiverUID()` **and** `message.getRecieverUID()` — two different wrong spellings on one page | **`getReceiverUid()`** | `BaseMessage.java:297` |
| R4 | `sdk/android/v5/additional-message-filtering` | `.setAttachmemnt(...)` (typo) on a `MessagesRequestBuilder` | **`setAttachmentTypes(...)`** — matching the page's own prose | `MessagesRequest.java:1127` |
| R5 | `sdk/android/v5/flag-message` | `reason.getReason()` | **`reason.getName()`** (`FlagReason` has `getId`/`getName`/`getDescription`) | `FlagReason.java:194` |

### False positives the audit itself had to learn (recorded so the next platform doesn't repeat them)
- **Calls SDK / Cards SDK.** `setCallCategory`, `setCardSchema`, `setThemeMode`, `setActionCallback`
  are real — they ship in `calls-sdk-android` / `cards-android`, which the first pass didn't scan.
  Without that, correct docs would have been "fixed" into incorrect ones.
- **V5 "before" blocks.** A ` ```java title="V5" ` fence in `upgrading-from-v5` *should* name removed
  APIs; the audit now skips them.
- **Comment lines.** Warning that "X was removed" is documentation, not a claim X exists.
- **`sdk/android/v5/` is the CURRENT SDK.** An early version of the version filter excluded it and
  silently audited **zero** SDK pages — which is why R3–R5 were invisible in round 1.

### Standing result
`PHANTOM in SKILLS = 0` — no Android skill teaches an API that does not ship. The only remaining
docs phantoms are the four in `message-template.mdx`, the page already flagged (C1) for rewrite.

### Skill gaps (not defects)
The audit reports ~216 real APIs the docs teach that the skills never name. That is the intended
**bake-vs-fetch** split: skills bake the hot path and route everything else to the docs `.md` twin
via `core/references/docs-map.md`. Listed for visibility, not as a backlog.

---

## Round 3 — the fresh-app run (built + executed on an emulator)

A NEW app was scaffolded from nothing, following **only** the skills, installed on a booted emulator
and driven by hand. Static audits cannot find these: they only appear when the app runs.

| # | Symptom on a real device | Root cause | Docs fix | Skill fix |
|---|---|---|---|---|
| F1 | **Build fails**, ~40 `Duplicate class org.jetbrains.annotations.*` at dexing | The kit's own transitive chain: `chatuikit-kotlin-android` → `io.noties.markwon:syntax-highlight` → `io.noties:prism4j:2.0.0` → `org.jetbrains:annotations-java5:17.0.0`, colliding with `org.jetbrains:annotations:23.0.0` from AndroidX/Kotlin | `<Warning>` + `exclude(group="org.jetbrains", module="annotations-java5")` added to **both** getting-started pages | added to the core skill's install block, marked REQUIRED |
| F2 | UI Kit toolbar renders **under the status bar** — "Chats" overlaps the clock | Every recipe calls `enableEdgeToEdge()` and **nothing** consumes the insets. Docs had **zero** occurrences of `setOnApplyWindowInsetsListener` | `<Warning>` + the runnable inset snippet added to `conversation-message-view` and `one-to-one-chat` | core skill's Sizing section now carries the **code**, not just the words "+ inset padding" |
| F3 | `Intent(this, …)` inside the login callback **does not compile** | Inside `object : CometChat.CallbackListener<User>()`, `this` binds to the listener, not the Activity. The skill's snippet only had `/* unlock the chat UI */`, so it never showed the navigation a consumer writes next | — (docs don't show navigation from the callback) | core skill now shows `this@MainActivity` with an inline warning |

**Verified working after the fixes**, on device: `init OK → login OK` → conversations list renders
with real data (avatars, unread badges, receipts, presence) → tap opens the message screen for the
right entity → back returns → keyboard opens with the composer above it → **a message sends and is
delivered**. The `cometchatPrimaryColor` from the customization skill is visibly applied.

F1 and F2 are worth raising with the kit team too: F1 is a dependency-hygiene issue in the published
artifact (a consumer should not need to know about `prism4j`), and F2 means every published Android
recipe produces a visibly broken status bar.

---

## Round 4 — component-wise acceptance on the emulator

Each drop-in was hosted alone, sized exactly as the skills prescribe, and driven on a booted
emulator. Evidence is the UI hierarchy (`uiautomator dump`), not a screenshot impression.

| Component | Verdict | Evidence |
|---|---|---|
| `CometChatConversations` | ✅ renders | real rows, avatars, unread badges, receipts, presence dot |
| `CometChatUsers` | ✅ renders | title, `et_search`, real users (Bob Bob, Susan Marie) |
| `CometChatGroups` | ✅ renders | `groups_item_container`, `groups_avatar`, "CometChat Team Meeting" |
| `CometChatGroupMembers` | ✅ compiles + renders | emitted by a skills-only agent; see round 5 |
| `CometChatSearch` | ✅ renders | `chip_group` (Unread/Groups/Photos), `iv_back`, `initial_state_view` |
| `CometChatNotificationFeed` | ✅ renders | "Notifications" |
| `CometChatMessageHeader/List/Composer` | ✅ renders + sends | polls, image bubbles, moderation notice; message sent + delivered |
| **`CometChatCallLogs`** | ❌ **CRASHES** | see C-1 |

### C-1 — `CometChatCallLogs` requires the Calls SDK **and** calling to be initialized (DOCS gap)
```
java.lang.NoClassDefFoundError: Failed resolution of:
  Lcom/cometchat/calls/core/CallLogRequest$CallLogRequestBuilder;
    at com.cometchat.uikit.core.viewmodel.CometChatCallLogsViewModel.<init>(CometChatCallLogsViewModel.kt:97)
```
**This is a documentation gap, NOT a product defect.** Two distinct runtime states, both expected:

| Calls artifact | `uiKit.enableCalling` | Result |
|---|---|---|
| absent | anything | `NoClassDefFoundError` — correct JVM behaviour for a missing dependency |
| present | `false` | `RuntimeException: Please call the CometChatCalls.init() method …` — thrown **deliberately by the Calls SDK** (`com.cometchat.calls.core.ApiConnection.getInstance`) as actionable guidance |
| present | `true` | renders |

Neither is the UI Kit misbehaving: a missing library cannot work, and the Calls SDK's message names
its own fix. The defect is that **`call-logs.mdx` documented the component with zero mention that the
Calls SDK is required at all** — a reader following only that page hits a runtime failure with no
warning. It compiles fine in every state, so no build gate can warn either.

The non-obvious part worth documenting: with the UI Kit you do **not** call `CometChatCalls.init()`
yourself — `initFromSettings` does it, but **only** when `"uiKit": { "enableCalling": true }` is set
in `cometchat-settings.json`. A developer who adds the artifact and expects it to work will hit
state 2 and has no reason to connect it to a JSON flag they never set.

| Where | Before | Now |
|---|---|---|
| `ui-kit/android/call-logs` | **zero** mentions of `calls-sdk-android` or any dependency requirement | `<Warning>` with the exact stack trace + the Gradle line |
| components skills (both cohorts) | a parenthetical "(needs the calls artifact)" | explicit crash warning: compiles fine, fails at runtime |

*(An earlier revision of this audit framed C-1 as a kit defect and recommended escalation. That was
wrong — the exception originates in the Calls SDK as intentional guidance, and a missing dependency
failing is correct behaviour. Corrected: docs-only.)*

---

## Round 5 — the Compose fresh-app run

A second fresh app, Jetpack Compose cohort, built from the `…-compose-*` skills only and run on the
emulator. The Compose recipes **compiled first time and rendered correctly** — theming
(`lightColorScheme(primary = …)`), `Scaffold(contentWindowInsets = WindowInsets.statusBars)`,
`weight(1f)` + `imePadding()` all behaved as the skills describe. One severe finding, and it is
**not** Compose-specific — it sits in the shared init path:

### F4 — `enableCalling: true` without the Calls artifact kills the app at LAUNCH
```
java.lang.NoClassDefFoundError: Failed resolution of:
  Lcom/cometchat/calls/core/CometChatCalls$SessionSettingsBuilder;
    at com.cometchat.uikit.core.CometChatUIKit.initCometChatCalls(CometChatUIKit.kt:229)
    at com.cometchat.uikit.core.CometChatUIKit$initFromSettings$1.onSuccess(CometChatUIKit.kt:196)
    at com.example.composechat.MainActivity.onCreate(MainActivity.kt:38)
```
`initFromSettings` auto-initializes the Calls SDK when the flag is set. Without the dependency the
throw lands in **`onCreate`, before any UI renders** — so the symptom (app won't start at all) is
maximally distant from the cause (a boolean in a JSON file). Setting `enableCalling: false` with no
other change: `init OK → login OK`, app runs.

This is worse than C-1: C-1 fails when you *use* a calling component; F4 fails when you *launch the
app*, whether or not calling is ever used. It is trivially hit by copying a settings file between
projects — which is exactly how it was found.

| Where | Fix |
|---|---|
| `getting-started-kotlin`, `getting-started-jetpack`, `calling-integration` | `<Warning>` with the stack trace + "change the flag and the dependency together" |
| core skill | warning beside the settings-file JSON block |
| builder-settings skill | `enableCalling` re-described: setting it `true` makes the dependency **mandatory** |
| calls skill | the flag and the artifact documented as a **pair**, with both failure directions |

The two directions, together:

| Artifact | `enableCalling` | Result |
|---|---|---|
| absent | `true` | **app crashes at launch** (F4) |
| present | `false` | calling components crash when used (C-1) |
| absent | `false` | fine — until a calling component is used (C-1) |
| present | `true` | correct |

---

## Round 6 — Chat SDK v5 device run (headless, no UI Kit)

A third fresh app depending on **only** `com.cometchat:chat-sdk-android:5.0.+`, built from
`cometchat-android-v5-sdk` alone. Verified on the emulator:

```
1 init OK                                   ← CometChat.initFromSettings (reads the same assets JSON)
2 login OK cometchat-uid-1                  ← init-then-login ordering, getLoggedInUser guard
3 message listener registered               ← listener-register-with-id
4 conversations fetched: 5                  ← pagination-via-request-builder
5 sent id=384770 "sdk-skill-test-2197"      ← send-message + sdk-error-handling
6 history fetched: 5 message(s)             ← MessagesRequestBuilder.fetchPrevious
7 listener removed (onDestroy)              ← listener-remove-on-teardown
```
No crashes. `CometChat.initFromSettings` reads the same `assets/cometchat-settings.json` as the UI
Kit — confirmed working without the UI Kit present.

### S-3 — the SDK skill conflated two DIFFERENT `login` overloads (SKILL bug, now fixed)
The shipped SDK has:

| Overload | Use |
|---|---|
| `login(uid, apiKey, listener)` | dev — **uid required** |
| `login(authToken, listener)` | production — **NO uid**; the server-minted token carries the identity |

The skill wrote it as `login(uid, authKeyOrToken, …)`, which reads as "put either credential in the
middle slot". Following that for the **production** path passes a token where an apiKey is expected
— the wrong overload, and it fails at auth rather than at compile time. Fixed: both overloads are
now named explicitly, with the trap in Common pitfalls. Docs were correct here; the skill was not.

---

## Round 7 — found by RUNNING the review harness on a device

The review harness executed on a booted emulator for the first time (skills repo `AUDIT-086`).
The first kit view it inflated crashed, and the cause is a documentation gap:

| # | Page | Gap | Fix |
|---|---|---|---|
| T1 | `ui-kit/android/getting-started-kotlin` | Neither getting-started page states that the app theme **must** descend from `Theme.MaterialComponents`. The kit's views are Material components, so on a stock `Theme.AppCompat.*` the first CometChat view inflated throws `IllegalArgumentException: The style on this component requires your app theme to be Theme.MaterialComponents (or a descendant)`. It is a **launch crash on the chat screen**, not a styling glitch, and it is the very first thing a developer following the page hits. `troubleshooting` and `theme-introduction` mention Material, but a reader only reaches those AFTER it has already crashed. | Added a `<Warning>` to `getting-started-kotlin` next to the existing dependency-exclude warning: inherit `CometChatTheme.DayNight` in `res/values/themes.xml` and point `<application android:theme>` at it. |

**Scoped to Views on purpose.** `getting-started-jetpack` was deliberately left alone: the Compose
cohort themes through the `CometChatTheme` **composable**
(`chatuikit-compose/.../theme/Theme.kt:13`), so it does not inflate Material Views and the XML
theme requirement does not apply to it. Adding the same warning there would have been a new docs
bug, not a fix.

**Reproduced, then fixed, in the harness itself:** `test-suite/harness/android` ran on
`Theme.AppCompat.DayNight.NoActionBar` and every emit died at `attach()` with exactly this
exception; it now inherits `CometChatTheme.DayNight` like any integrating app must.

---

## ROOT CAUSE — a v5 UI Kit checkout is vendored inside the docs repo

`/.cometchat-uikit-android/` is a **shallow clone of `cometchat/cometchat-uikit-android` at tag
`v5.2.9`** (26 MB, its own `.git`, untracked and NOT gitignored). It is a working artifact, not docs
content — and it is the **wrong major** for the v6 pages it sits beside.

Every "phantom API" found in the v6 docs exists in that v5 checkout:

| API taught on a v6 page | In shipped v6 (6.0.5)? | In the vendored v5.2.9 clone? |
|---|---|---|
| `CometChatMessageTemplate` | ❌ | ✅ |
| `setTemplates` | ❌ | ✅ |
| `CometChatUIKit.getDataSource()` | ❌ | ✅ |
| `getAuxiliaryOption` | ❌ | ✅ |
| `getSelectedGroupMembers` | ❌ | ✅ |
| `setOnBackButtonPressed` | ❌ | ✅ |

**6 of 6.** These pages are not randomly wrong — they are **correctly documenting v5** under a v6
heading. The most economical explanation is that they were written or verified against this
checkout. (Correlation + physical presence in the repo, not proof of intent — but the pattern is
exact, and the fix is the same either way.)

Note the v5 module layout differs too: this clone has a single `chatuikit/` module, whereas v6 ships
`chatuikit-core` + `chatuikit-kotlin` + `chatuikit-compose`. Anyone checking "does this API exist?"
against it gets a confident, wrong answer.

### Recommended
1. **Remove it from the docs repo** (or at minimum add it to `.gitignore` — today it is 26 MB of
   untracked noise in every `git status`, and a nested `.git` inside a repo invites accidental
   commits).
2. If a reference checkout is genuinely wanted for docs authoring, it must be the **v6** source —
   `cometchat-team/uikit-android` @ `master-v6` — and it should be pinned to the version the docs
   claim, with the version stated in the path or a README beside it.
3. Better still: verify against the **published artifact** (the `.aar` Gradle already resolves), which
   cannot drift from what customers actually install. That is what caught all six of these.

The remaining docs bugs are NOT explained by this and are ordinary copy errors: `endtyping`,
`"Strat Typing"`, `getRecieverUID`, `setAttachmemnt`, `getReason`.

## Still owed (not fixed here)
- **C1 full rewrite** of `message-template.mdx` (636 lines) against `BubbleFactory` — needs docs-team authoring; a banner is not a substitute.
- **D1** `getting-started-*` → `initFromSettings` + gitignored settings file instead of hardcoded `APP_ID`/`AUTH_KEY` constants. Behaviour change; wants product sign-off.
- **D2/D3** AI Integration Quick Reference accordion backfill (v6 components, all of SDK v5).

---

## Round 8 — phantom CALLBACK TYPES on the search page (three-way audit)

Surfaced by `three-way-audit.mjs` after the skills started teaching `CometChatSearch`. The page
documents the right method NAMES, but types every callback with a class that **does not exist in
6.0.5**. This sits in the machine-readable "AI Integration Quick Reference" accordion — the block
an AI agent reads first — so an agent would emit v5-Java-style SAM construction
(`new OnItemClick<Conversation>() { … }`) that cannot compile against v6.

| # | Page | Docs said | Shipped 6.0.5 |
|---|---|---|---|
| P1 | `ui-kit/android/search` | `OnItemClick<Conversation>` / `OnItemClick<BaseMessage>` | `((Conversation) -> Unit)?` / `((BaseMessage) -> Unit)?` |
| P2 | `ui-kit/android/search` | `OnBackPress` · `OnError` · `OnEmpty` | `(() -> Unit)?` · `((CometChatException) -> Unit)?` · `(() -> Unit)?` |
| P3 | `ui-kit/android/search` | `OnLoad<BaseMessage>` / `OnLoad<Conversation>` | `((List<BaseMessage>) -> Unit)?` / `((List<Conversation>) -> Unit)?` |
| P4 | `ui-kit/android/search` | two Kotlin fences calling `setOnLoad*(OnLoad<T> { … })` | trailing lambda: `setOnLoadMessages { list -> … }` |

**Verified absent from the kit:** `OnItemClick`, `OnBackPress`, `OnError`, `OnEmpty`, `OnLoad` are
not declared anywhere in `chatuikit-kotlin` / `chatuikit-core`. The only such type that IS real is
`OnClick` (used by e.g. `setOnAcceptClickListener(OnClick?)`), which is why the family reads
plausible. 13 sites fixed on this branch.

**Deliberately NOT changed:** the same `OnItemClick<T>` spelling in `upgrading-from-v5.mdx` is
inside fences labelled `title="V5 — …"`. Those are BEFORE examples of the old v5 Java API, where
the name is correct — "fixing" them would break the migration story.

**Also confirmed, not a bug:** `setOnConversationClicked` / `setOnMessageClicked` (past tense) DO
ship — they are aliases of `setOnConversationClick` / `setOnMessageClick`
(`CometChatSearch.kt:2431,2436`). Only their declared TYPES were wrong.

---

---

## Round 9 — the drift gate wired into CI, and what it then found

`three-way-audit.mjs` is now a CI gate on the skills side (`npm run verify:sync:android-v6`, folded
into `verify:ci:android`) — the Android equivalent of what RN did with `sync-check.mjs`. Wiring it
up meant fixing it first: it read **only ```kotlin/java fences**, so an API documented in a props
table or in the "AI Integration Quick Reference" accordion counted as undocumented. It now also
reads inline-code mentions and accordion JSON keys — which immediately exposed six phantoms that
fence-scanning could never see.

| # | Page | Docs said | Shipped | Kind |
|---|---|---|---|---|
| R1 | `ui-kit/android/guide-ai-agent` | `setAIAssistantTools()` | **`setAiAssistantTools()`** (`CometChatMessageList.kt:2446`, `HashMap<String, ToolCallListener>`) | casing — feature IS real |
| R2 | `ui-kit/android/troubleshooting` | `setAuxiliaryButtonView()` | `setAuxiliaryButtonViewListener()` — the A4 fix never reached this page | wrong name |
| R3 | `sdk/android/v5/edit-message` | `onSucess()` | `onSuccess()` | typo |
| R4 | `sdk/android/v5/send-message` | `setSubtype()` | **`setSubType()`** (`CustomMessage.java:113`) | casing — will not compile |
| R5 | `ui-kit/android/message-template` | the whole 676-line page taught v5's `MessageTemplate` | **rewritten** against `BubbleFactory` (both cohorts), 164 lines | C1 closed |
| R6 | `ui-kit/android/search`, `guide-search-messages` | **8** examples calling `setOnConversationClicked`/`setOnMessageClicked` with a **3-arg** lambda `{ view, position, x -> }` | **ONE** arg — `((Conversation) -> Unit)?` / `((BaseMessage) -> Unit)?` (`CometChatSearch.kt:1790,1797,2431,2436`) | arity — will not compile |

R6 is the same defect class as B1 (the 3-arg thread callback) on a different page — evidence the
v5 listener idiom is still being carried into v6 pages by hand.

**Result: `PHANTOM in DOCS` and `PHANTOM in SKILLS` are both 0** under the wider scan.

**Still advisory, not defects:** the gate's `DOCS GAP (2)` names `setOnConversationClick` /
`setOnMessageClick` — the docs use the `…Clicked` aliases while the skills teach the canonical
names. **Both ship** (the aliases are real, `CometChatSearch.kt:2431,2436`), so this is a naming
inconsistency to settle, not broken code. `SKILL GAP (333)` is long-tail by design: the pack is
deliberately thin and fetches the long tail from docs at runtime.

