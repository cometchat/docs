---
title: iOS UI Kit Quickstart (SwiftUI)
framework: ios
prerequisites:
  - "Xcode 16+"
  - "iOS 15.1+ deployment target"
  - "Swift Package Manager"
  - "CometChat App ID, Auth Key, and Region from app.cometchat.com"
last_verified: "2026-10-16"
packages:
  - registry: github
    name: "cometchat/cometchat-uikit-ios"
    version: "5.2.3"
  - registry: github
    name: "cometchat/chat-sdk-ios"
    version: "4.1.10"
  - registry: github
    name: "cometchat/calls-sdk-ios"
    version: "5.0.4"
---

# iOS UI Kit Quickstart (SwiftUI)

Install the CometChat iOS UI Kit with SPM, initialize and log in at launch, then show a conversation list that opens a chat screen.

Source: https://www.cometchat.com/docs/ui-kit/ios/getting-started

## 1. Install via Swift Package Manager

In Xcode: File → Add Package Dependencies → `https://github.com/cometchat/cometchat-uikit-ios`. Dependency Rule: **Up to Next Major Version** from `5.2.3`. Add the `CometChatUIKitSwift` product to your app target.

- The kit's package pulls in `CometChatSDK` (from `4.1.10`). Do not add it yourself.
- Only for voice/video calls, also add `https://github.com/cometchat/calls-sdk-ios` (Up to Next Major from `5.0.4`).
- Use SPM. The CocoaPods pod is no longer updated and does not have this release.

## 2. Configure your Info.plist

Add a usage description for each media feature you use, or iOS terminates the app when it is used: `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSPhotoLibraryUsageDescription`. Write a real sentence for each; App Review rejects placeholders.

## 3. Initialize and log in at launch

Run `init → login` once, from an `AppDelegate`, and render chat only after login succeeds.

```swift
// MyApp.swift
import SwiftUI
import CometChatUIKitSwift
import CometChatSDK

final class ChatSession: ObservableObject {
    static let shared = ChatSession()
    @Published var ready = false
}

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ app: UIApplication,
                     didFinishLaunchingWithOptions opts: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        let settings = UIKitSettings()
            .set(appID: "YOUR_APP_ID")
            .set(region: "YOUR_REGION")      // "us", "eu" or "in"
            .set(authKey: "YOUR_AUTH_KEY")   // development only
            .subscribePresenceForAllUsers()
            .build()
        CometChatUIKit.init(uiKitSettings: settings) { result in
            guard case .success = result else { print("init failed: \(result)"); return }  // check App ID / Region
            if CometChatUIKit.getLoggedInUser() != nil {
                DispatchQueue.main.async { ChatSession.shared.ready = true }; return
            }
            CometChatUIKit.login(uid: "cometchat-uid-1") { loginResult in   // the user must already exist
                switch loginResult {
                case .success: DispatchQueue.main.async { ChatSession.shared.ready = true }
                case .onError(let e): print("login failed: \(e.errorDescription)")
                @unknown default: break
                }
            }
        }
        return true
    }
}

@main
struct MyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    @ObservedObject private var session = ChatSession.shared
    var body: some Scene {
        WindowGroup {
            if session.ready { ConversationsView().ignoresSafeArea() } else { ProgressView() }
        }
    }
}
```

## 4. Show conversations and a chat screen

v5 has no combined "with messages" component. Push your own screen built from the message header, message list and composer.

```swift
// ConversationsView.swift
import SwiftUI
import CometChatUIKitSwift
import CometChatSDK

struct ConversationsView: UIViewControllerRepresentable {
    func makeCoordinator() -> NavBarCoordinator { NavBarCoordinator() }
    func makeUIViewController(context: Context) -> UINavigationController {
        let conversations = CometChatConversations()
        let nav = UINavigationController(rootViewController: conversations)
        nav.delegate = context.coordinator           // weak; the coordinator keeps it alive
        conversations.set(onItemClick: { [weak nav] conversation, _ in
            let chat = MessagesVC()
            chat.user  = conversation.conversationWith as? CometChatSDK.User
            chat.group = conversation.conversationWith as? CometChatSDK.Group
            nav?.pushViewController(chat, animated: true)
        })
        return nav
    }
    func updateUIViewController(_ vc: UINavigationController, context: Context) {}
}

// The kit header has its own back button, so hide the host bar on the chat screen only.
final class NavBarCoordinator: NSObject, UINavigationControllerDelegate {
    func navigationController(_ nav: UINavigationController, willShow vc: UIViewController, animated: Bool) {
        nav.setNavigationBarHidden(vc is MessagesVC, animated: animated)
    }
}

final class MessagesVC: UIViewController {
    var user: CometChatSDK.User?
    var group: CometChatSDK.Group?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        let header = CometChatMessageHeader(), list = CometChatMessageList()
        let composer = CometChatCompactMessageComposer()
        if let user { header.set(user: user); list.set(user: user); composer.set(user: user) }
        else if let group { header.set(group: group); list.set(group: group); composer.set(group: group) }
        header.set(controller: self); list.set(controller: self); composer.set(controller: self)

        for v in [header, list, composer] as [UIView] {
            v.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(v)
            v.leadingAnchor.constraint(equalTo: view.leadingAnchor).isActive = true
            v.trailingAnchor.constraint(equalTo: view.trailingAnchor).isActive = true
        }
        NSLayoutConstraint.activate([
            header.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            header.heightAnchor.constraint(equalToConstant: 50),
            list.topAnchor.constraint(equalTo: header.bottomAnchor),
            list.bottomAnchor.constraint(equalTo: composer.topAnchor),
            composer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
        ])
    }
}
```

## 5. Production auth

The Auth Key can log in as any user. Before shipping, create an auth token on your server and log in with it:

```swift
CometChatUIKit.login(authToken: serverIssuedToken) { result in /* .success(User) / .onError(error) */ }
```

REST: https://www.cometchat.com/docs/rest-api/auth-tokens/create

## Common pitfalls

- **Kit older than 5.2.3** — earlier 5.2 releases crash at launch when the Calls SDK is absent. An old exact pin on `CometChatSDK` should be loosened to Up to Next Major from 4.1.10 or removed.
- **`login` before `init` succeeds, or rendering before `login` succeeds** — the screen stays empty with no error.
- **Removed v4 components** — `CometChatConversationsWithMessages`, `CometChatMessages`, `CometChatUsersWithMessages` and `CometChatGroupsWithMessages` do not exist in v5.
- **Missing `set(controller:)`** — header, list and composer use it to present their own screens, such as the long-press message menu.
- **Composer pinned to `keyboardLayoutGuide`** — the composer handles the keyboard itself; pin it to the safe area or the list collapses when the keyboard opens.
- **`CometChatConversations` is a `UIViewController`** (push or wrap it); header, list and composer are `UIView`s.
- **`'Group' is ambiguous`** in files that import SwiftUI — write `CometChatSDK.Group` / `CometChatSDK.User`.
- **Alignment names** — `MessageListAlignment` with `.standard` / `.leftAligned` (`list.set(messageAlignment: .leftAligned)`). `MessageAlignment` and `.left` do not exist.
- **Auth Key in a TestFlight or App Store build** — switch to auth tokens first.

## What to read next

- Components: https://www.cometchat.com/docs/ui-kit/ios/components-overview
- Conversation + chat guide: https://www.cometchat.com/docs/ui-kit/ios/ios-conversation
- Theme: https://www.cometchat.com/docs/ui-kit/ios/theme-introduction
- Methods: https://www.cometchat.com/docs/ui-kit/ios/methods
