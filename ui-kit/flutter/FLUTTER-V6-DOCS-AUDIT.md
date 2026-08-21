# Flutter UI Kit v6 — docs vs. published package audit

**Method:** every ```dart fence on all 54 `ui-kit/flutter/*.mdx` pages was extracted and compiled
against the **published** `cometchat_chat_uikit 6.1.0` (pub.dev), with `cometchat_sdk 5.0.6` and
`cometchat_calls_sdk 5.0.6`. Nothing here is inferred from reading — each item is a compiler
diagnostic. Host placeholders (`ThreadScreen`, `navigateToUserChat`, `YourScreen`) are filtered out
and are NOT counted.

**Result: 374 fences compiled · 90 errors across 26 of 54 pages.**

> Caveat: the 6 on `upgrading-from-v5` are EXPECTED — that page intentionally shows v5 "before" code.
> Real total is ~84 across 25 pages.

## The systematic patterns (fix the pattern, not the page)

**1. View slots are missing the trailing `BuildContext` (17).** In v6 every view-slot callback gained a
final `BuildContext` parameter; the docs still show the v5 arity. Example — `CometChatMessageHeader`:
```dart
// docs
subtitleView: (group, user) { ... }
// actual: Widget? Function(Group? group, User? user, BuildContext context)?
subtitleView: (group, user, context) { ... }
```
Affects `message-header`, `conversations`, `groups`, `group-members`, `users`, and the guide pages that
copy them.

**2. `onError` handlers use `e.message` (10).** The typedef is `OnError = Function(Exception e)`, and
`Exception` has no `.message` getter. Use `"$e"` (or type the callback to `CometChatException` where the
widget actually provides one — verify per widget).

**3. `CometChatUIKit.getDataSource()` (4).** Removed in v6 along with the whole DataSource/extension
architecture, but still shown on `message-template` and `upgrading-from-v5`.

**4. Undefined named parameters (13)** — style and prop names that no longer exist, e.g.
`searchBoxBackgroundColor` → `searchBackgroundColor`, `replyCountTextColor` → `countTextColor`,
`onError`/`leadingView`/`messageHeaderBloc`/`typingIndicatorStyle` on `CometChatMessageHeader`.

**5. Undefined symbols (17)** — names that do not exist in 6.1.0 (`CometChatErrorAlertStyle`,
`CometChatAttachmentErrorSnackBarStyle`, `CometChatConfig`, `CometChatConstants`, …).

**6. Stale package imports (6)** — `package:cometchat_uikit_shared/...` no longer resolves.

## Distribution

| Pattern | Count |
|---|---|
| undefined symbol | 17 |
| view-slot missing trailing BuildContext | 17 |
| undefined named parameter | 13 |
| onError: e.message (OnError = Function(Exception)) | 10 |
| undefined_getter | 8 |
| undefined_method | 6 |
| stale package import | 6 |
| CometChatUIKit.getDataSource() — removed in v6 | 4 |
| argument_type_not_assignable | 3 |
| non_type_as_type_argument | 2 |
| undefined setter (v5 UIKitSettings) | 2 |
| non_abstract_class_inherits_abstract_member | 1 |
| not_enough_positional_arguments | 1 |

| Page | Errors |
|---|---|
| `message-header` | 10 |
| `flutter-one-to-one-chat` | 6 |
| `flutter-tab-based-chat` | 6 |
| `upgrading-from-v5` | 6 |
| `conversations` | 5 |
| `message-composer` | 5 |
| `custom-text-formatter-guide` | 4 |
| `group-members` | 4 |
| `guide-group-chat` | 4 |
| `guide-new-chat` | 4 |
| `multi-tab-chat-ui-guide` | 4 |
| `call-logs` | 3 |
| `customization-menu-options` | 3 |
| `localize` | 3 |
| `message-template` | 3 |
| `methods` | 3 |
| `outgoing-call` | 3 |
| `groups` | 2 |
| `guide-block-unblock-user` | 2 |
| `incoming-call` | 2 |
| `users` | 2 |
| `customization-bloc-data` | 1 |
| `customization-state-views` | 1 |
| `customization-view-slots` | 1 |
| `flutter-conversation` | 1 |
| `message-bubble-styling` | 1 |
| `message-list` | 1 |


## Already fixed on this branch (compile-verified)

`guide-threaded-messages` · `threaded-messages-header` · `search` — all 22 fences on those three pages
now compile clean. See the branch commits for the exact changes.

## Recommendation

Add a compile pass over doc snippets to docs CI. The engine used for this audit is
`test-suite/scripts/typecheck-fences-dart.mjs` in the `cometchat-skills` repo; it takes a pinned
Flutter project plus a list of markdown files and exits non-zero on kit-API drift. It found all 90 in a
single run, and it distinguishes real drift from host placeholders, so it is CI-safe.
