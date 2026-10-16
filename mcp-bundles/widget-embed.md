---
title: Widget Embed (No-Code)
framework: widget
prerequisites:
  - "Access to your site's HTML, or its custom-code settings"
  - "CometChat App ID, Region, and Auth Key from app.cometchat.com"
  - "A widget variant designed in the dashboard Widget Builder (optional Variant ID)"
last_verified: "2026-10-16"
packages: []
---

# Widget Embed (No-Code)

Add the CometChat Chat Widget (v2) to an existing site with one script tag and one config object. Works on plain HTML, Webflow, Squarespace, Wix, Shopify and WordPress.

Source: https://www.cometchat.com/docs/widget/html/integration

## 1. Design the widget and get credentials

1. In the CometChat dashboard, open your app's **Widget Builder**.
2. Set layout, features and theme, then click **Get Embedded Code**.
3. Note the **App ID**, **Auth Key**, **Region** and **Variant ID**.

Look and features come from the Widget Builder. For deeper customization use a UI Kit instead.

## 2. Embed the script

In `<head>`:

```html
<script defer src="https://cdn.jsdelivr.net/npm/@cometchat/chat-embed@2.x.x/dist/main.js"></script>
```

In `<body>`:

```html
<div id="cometChatMount"></div>
<script type="module">
  const COMETCHAT_WIDGET_CONFIG = {
    appID: "YOUR_APP_ID",
    region: "YOUR_APP_REGION",     // "us", "eu" or "in"
    mode: "uid",                   // "guest" | "uid" | "authToken"
    authKey: "YOUR_AUTH_KEY",      // development only (guest and uid modes)
    uid: "UNIQUE_USER_ID",         // created on first visit if it does not exist
    user: { name: "User Name" },   // optional profile
    mount: "#cometChatMount",
    width: "450px",
    height: "80vh",
    isDocked: true,                // true = chat bubble, false = inline in the mount
    // variantID: "YOUR_VARIANT_ID",
    // chatType: "user",           // or "group"
    // defaultChatID: "uid_or_guid",
    // dockedAlignment: "right",   // or "left"
  };
  CometChatApp.CometChatAuth.start(COMETCHAT_WIDGET_CONFIG);
</script>
```

- `mode: "guest"` — anyone chats without signing in; drop `uid` and optionally set `user.name`.
- `mode: "uid"` — your own user IDs drive chat identity.
- Optional: `language` (default `"en-US"`), `storageMode` (`"LOCAL"` or `"SESSION"`), `autoOpenFirstItem`.

After start you can drive it from JavaScript: `CometChatApp.chatWithUser("UID")`, `CometChatApp.chatWithGroup("GUID")`, `CometChatApp.uiEvent("onOpenChat", fn)`.

## 3. CMS-specific install paths

Put the script tag in the site-wide head (or next to the config), and the config snippet where the docs say:

- **Webflow**: Site Settings → Custom Code → Head Code for the script tag; the config goes in an **Embed** element.
- **Squarespace**: Custom Code → Code Injection → **Footer**.
- **Wix**: Settings → Custom Code → **+ Add Custom Code** (site-level). Do not use an Embed HTML element.
- **Shopify**: Online Store → Themes → Edit code → `layout/theme.liquid`, near `</body>`.
- **WordPress**: install the CometChat WordPress plugin (it loads its own copy of the widget).

## 4. Production auth

The Auth Key can log in as any user. For signed-in users, create the user and an auth token on your server (REST), send the token to the page, and use `authToken` mode with no `authKey`:

```html
<script type="module">
  CometChatApp.CometChatAuth.start({
    appID: "YOUR_APP_ID",
    region: "YOUR_APP_REGION",
    mode: "authToken",
    authToken: "USER_AUTH_TOKEN",   // issued by your backend
    mount: "#cometChatMount",
    width: "450px",
    height: "80vh",
    isDocked: true,
  });
</script>
```

REST: https://www.cometchat.com/docs/rest-api/auth-tokens/create

## Common pitfalls

- **Old v3 script** (`widget-js.cometchat.io/v3/cometchatwidget.js` with `CometChatWidget.init/launch`) — that is the legacy widget. New embeds use `@cometchat/chat-embed@2.x.x` and `CometChatApp.CometChatAuth.start`.
- **`@latest` or a bare package name** — still installs v1. Pin `@2.x.x`.
- **Config in a plain `<script>`** — it runs before the deferred loader, so `CometChatApp` is undefined. Keep `type="module"` and the loader tag before it.
- **Upgrading from v1** — v2 renames most CSS classes, so custom CSS and JS selectors written for v1 stop matching. Existing variants keep v2's new features (pinned/saved messages, pinned conversations, thread subscription, multiple attachments) off; create a new variant to get them.
- **`isDocked` omitted** — v2 follows the variant's docked setting. **`launch()` without `height`** — fills 100% of the mount, so give the mount a height.
- **Wix Embed HTML element** — runs in an iframe without camera/mic permission, so calls fail. Use site-level Custom Code.
- **Wix editor preview** — custom code does not run there; check the published site.
- **Auth Key visible in page source** — switch to `authToken` mode before going live.

## What to read next

- Advanced JavaScript API: https://www.cometchat.com/docs/widget/html/advanced
- Upgrade v1 → v2: https://www.cometchat.com/docs/widget/migration
- Webflow guide: https://www.cometchat.com/docs/widget/webflow/integration
- Squarespace guide: https://www.cometchat.com/docs/widget/squarespace/integration
- WordPress plugin: https://www.cometchat.com/docs/widget/wordpress/integration
