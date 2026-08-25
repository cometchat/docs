# Flutter UI Kit v6 — docs vs. published package audit

**Method:** every ```dart fence on all 54 `ui-kit/flutter/*.mdx` pages was extracted and compiled
against the **published** `cometchat_chat_uikit 6.1.0` (pub.dev), with `cometchat_sdk 5.0.6` and
`cometchat_calls_sdk 5.0.6`. Nothing here was inferred from reading — every item was a compiler
diagnostic, and every fix was re-compiled before being committed.

## Result

| | Before | After |
|---|---|---|
| Pages with errors | 26 of 54 | **0** |
| Kit-API errors | 90 | **0** |
| Fences compiling clean | — | **352 of 374** |

The 22 fences not counted are multi-expression illustrative blocks that do not parse standalone in any
wrapper (they are listed by the tool on every run — it never silently drops them). Spot-checks of the
suspicious ones (`conversationsBloc`, `stateCallBack`) confirmed they use real APIs.

`upgrading-from-v5` is excluded by design: its "before" snippets are v5 code and are correct as written.

## What was wrong (all fixed)

**1. View slots were missing the trailing `BuildContext` (17).** In v6 every view-slot callback gained a
final `BuildContext`; the docs still showed v5 arity. On `message-header` the first two parameters were
**also swapped** — the real signature is `(Group? group, User? user, BuildContext context)` while the docs
named them `(user, group)`, which is why `user.status` and `group.membersCount` appeared broken. They are
both real fields; only the parameter names were wrong.

**2. `onError` handlers used `e.message` (10).** The typedef is `OnError = Function(Exception e)` and
`Exception` has no `.message`. (`getting-started` was left alone — init/login's `onError` really is
typed `CometChatException`, so `error.message` is correct there.)

**3. Parameters that do not exist (13)** — `searchBoxBackgroundColor` → `searchBackgroundColor`,
`replyCountTextColor` → `countTextColor`, `groupMembersStyle` → `style`, `leadingView` →
`leadingStateView`, `errorAlertStyle` → `attachmentErrorAlertStyle`, `declineButtonText` (no text
variant exists), and `onError`/`messageHeaderBloc`/`typingIndicatorStyle` on `CometChatMessageHeader`,
which has none of them.

**4. Symbols that do not exist (17)** — `CometChatCallLogDetails`, `CometChatErrorAlertStyle`,
`CometChatAttachmentErrorSnackBarStyle`, `CometChatConstants`, `CometChatTextFormatterResult`,
`CometChatAiAssistantBubbleStyle` (the real class is `CometChatAIAssistantBubbleStyle` — capital AI).
Constants moved to `CometChatCallType.video` / `CometChatUserStatus.online`.

**5. `CometChatUIKit.getDataSource()` (4)** — removed in v6 with the DataSource architecture. The
defaults now come from `MessageTemplateUtils` (`getTextMessageOptions`, `getAllMessageTypes`,
`getAllMessageCategories`).

**6. Wrong method names and arities** — `CometChatUIKit.blockUsers/unblockUsers` are actually
`CometChat.blockUser/unblockUser` (singular, still taking a list); `onSelection` takes one argument, not
two; `onItemTap` on `CometChatUsers`/`CometChatGroups` takes `(context, item)` while
`CometChatConversations`/`CometChatGroupMembers` take just `(item)`; `CometChatMessageOption.onClick` is
`onItemClick(message, state)`.

**7. Structural errors** — `conversationItemView`'s parameters were in the **reverse** order;
`messageItemView` does not exist (message results override per type: `searchTextMessageView`,
`searchImageMessageView`, …); `CometChatThreadedHeader` has no `bubbleView` (it lives on
`CometChatMessageTemplate`, passed via `template`) and no `onBack`/`onError`; the custom-text-formatter
guide subclassed an abstract class without its five required members and used a non-existent
`getFormattedText`/`CometChatTextFormatterResult` API instead of `getAttributedText`/`AttributedText`;
`localize` mixed an aliased import with unprefixed symbols and imported a package that no longer exists.

## Recommendation — add this to docs CI

The engine is `test-suite/scripts/typecheck-fences-dart.mjs` in the `cometchat-skills` repo. It takes a
pinned Flutter project and a list of markdown files, and exits non-zero on kit-API drift:

```bash
node test-suite/scripts/typecheck-fences-dart.mjs \
  --project test-suite/typecheck/flutter-v6 \
  --exclude upgrading-from-v5 \
  ui-kit/flutter/*.mdx
```

It is CI-safe: it distinguishes real drift from the reader's own placeholders (symbols the page itself
declares, relative imports, host helper functions), supports `--exclude` for pages that intentionally
show a previous major, and prints any fence it could not check rather than quietly skipping it.
