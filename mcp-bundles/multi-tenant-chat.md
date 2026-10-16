---
title: Multi-Tenant SaaS Chat
framework: any
prerequisites:
  - "Backend service that can call the CometChat REST API and issue Auth Tokens"
  - "CometChat App ID, REST API Key (fullAccess, server-side only), and Region"
  - "A unique ID per user and per tenant in your own database"
last_verified: "2026-10-16"
packages:
  - registry: npm
    name: "@cometchat/chat-sdk-javascript"
    version: "4.2.1"
---

# Multi-Tenant SaaS Chat

Recipe for SaaS apps where many tenants share one CometChat app but must not see each other's users, conversations, or messages.

Source: https://www.cometchat.com/docs/rest-api/chat-apis

## 1. Choose an isolation model

CometChat has no built-in tenant object. Pick one of these:

| Model | How | Fits |
|---|---|---|
| One CometChat app per tenant | Separate App ID per tenant | Strongest isolation; more apps to manage |
| Shared app + RBAC "friends" mode | Users of a tenant are friends; roles restrict listing and sending to friends | Tenants up to ~1,000 users (max 1,000 friends per user) |
| Shared app + one role per tenant | RBAC `allowedRoles` per tenant role | Few tenants (max 25 roles per app) |

In every model, **prefix IDs with the tenant** so they never collide and are easy to audit:

```
UID  = `${tenantId}-${userId}`    // e.g. t42-u8911  (letters, digits, dashes; stored lowercase)
GUID = `${tenantId}-${groupId}`   // e.g. t42-project-777
```

ID prefixing alone does not stop a client SDK from listing or messaging other tenants' users. Enforce isolation on the server (RBAC, friends, or separate apps) and in your own token endpoint.

## 2. Install (client)

```bash
npm install @cometchat/chat-sdk-javascript@4.2.1
```

UI Kit apps install the kit per its quickstart; the server steps are the same.

## 3. Provision users via REST (server)

REST base URL: `https://{APP_ID}.api-{REGION}.cometchat.io/v3`. Authenticate with the `apikey` header (REST API Key, never shipped to clients).

```bash
curl -X POST "https://${APP_ID}.api-${REGION}.cometchat.io/v3/users" \
  -H "apikey: $COMETCHAT_REST_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "uid": "t42-u8911",
    "name": "Sam Rivera",
    "tags": ["tenant-t42"],
    "metadata": { "tenantId": "t42" }
  }'
```

`tags` can be filtered (`GET /users?tags=tenant-t42`); `metadata` cannot, so keep the tenant in both.

## 4. Issue Auth Tokens only after a tenant check (server)

```ts
// Express handler. requireAuth sets req.user from YOUR session.
app.post("/chat-token", requireAuth, async (req, res) => {
  const { tenantId, userId } = req.user;          // from your session, never from the request body
  const uid = `${tenantId}-${userId}`;
  const r = await fetch(
    `https://${APP_ID}.api-${REGION}.cometchat.io/v3/users/${uid}/auth_tokens`,
    {
      method: "POST",
      headers: { apikey: REST_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ force: true }),
    },
  );
  if (!r.ok) return res.status(502).json({ error: "token mint failed" });
  const { data } = await r.json();
  res.json({ authToken: data.authToken });
});
```

## 5. Log in from the client

```ts
import { CometChat } from "@cometchat/chat-sdk-javascript";

const settings = new CometChat.AppSettingsBuilder()
  .setRegion(REGION)
  .subscribePresenceForFriends() // not ForAllUsers: that streams every tenant's presence
  .build();
await CometChat.init(APP_ID, settings);

const { authToken } = await fetch("/chat-token", { method: "POST" }).then((r) => r.json());
await CometChat.login(authToken); // one argument = Auth Token login
```

React UI Kit: `await CometChatUIKit.loginWithAuthToken(authToken)` after `CometChatUIKit.init(...)`.

## 6. Restrict cross-tenant access (shared app)

Make users of the same tenant friends (`POST /v3/users/{uid}/friends` with `{"accepted": [...]}`, max 15 UIDs per call), then limit the role your users have to friends:

```bash
curl -X PUT "https://${APP_ID}.api-${REGION}.cometchat.io/v3/roles/default/permissions" \
  -H "apikey: $COMETCHAT_REST_API_KEY" -H "Content-Type: application/json" \
  -d '{ "permissions": {
        "listUsers.mode": "friends",
        "getUserDetails.mode": "friends",
        "sendMessage.mode": "friends"
      } }'
```

Denied calls return `ERR_PERMISSION_DENIED`. Test with two tenants before launch.

## 7. Create groups with tenant scoping (server)

```bash
curl -X POST "https://${APP_ID}.api-${REGION}.cometchat.io/v3/groups" \
  -H "apikey: $COMETCHAT_REST_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "guid": "t42-project-777",
    "name": "Project 777",
    "type": "private",
    "owner": "t42-u8911",
    "tags": ["tenant-t42"],
    "metadata": { "tenantId": "t42" }
  }'
```

Use `private` groups: users cannot join them on their own. Add members from your server after checking they belong to the same tenant.

## 8. Audit checklist

- Every UID/GUID has a tenant prefix and tag; webhooks for new users/groups verify it.
- The token endpoint and group-member adds run on your server and check the tenant.
- User and group pickers are scoped server-side (RBAC friends mode or your own endpoint).

## Common pitfalls

- **Relying on ID prefixes alone.** `UsersRequestBuilder().fetchNext()` and `CometChatUsers` list every user in the app unless RBAC restricts it. Client-side filters such as `setTags()` are display filters, not security.
- **`subscribePresenceForAllUsers()` in a shared app.** It sends presence for every tenant. Use friends (or roles) and note presence stops above 1,000 concurrent online users per app.
- **Shipping the REST API Key or Auth Key to clients.** Either one allows cross-tenant impersonation. Keep keys on the server; clients use Auth Tokens.
- **Trusting `tenantId` from the request body** in the token endpoint. Take it from your authenticated session.
- **Public groups for tenant spaces.** Any user in the app can find and join a public group. Use `private`.
- **Old REST conventions.** Use `/v3/` paths and the lowercase `apikey` header.
- **Calling `CometChat.loginWithAuthToken`.** It does not exist in the JavaScript SDK; use `CometChat.login(authToken)` (UI Kit: `CometChatUIKit.loginWithAuthToken`).

## What to read next

- REST authentication: https://www.cometchat.com/docs/rest-api/authentication
- Auth tokens: https://www.cometchat.com/docs/rest-api/auth-tokens
- Users API: https://www.cometchat.com/docs/rest-api/users
- Groups API: https://www.cometchat.com/docs/rest-api/groups
- RBAC permissions: https://www.cometchat.com/docs/rest-api/rbac-overview
- Friends API: https://www.cometchat.com/docs/rest-api/friends
- Limits: https://www.cometchat.com/docs/articles/properties-and-constraints
