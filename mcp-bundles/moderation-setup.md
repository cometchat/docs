---
title: Moderation Setup
framework: any
prerequisites:
  - "CometChat app with Moderation available on its plan"
  - "App ID and Region"
  - "REST API key (full access) for the management endpoints"
last_verified: "2026-10-16"
packages: []
---

# Moderation Setup

Configure CometChat moderation: built-in rules, your own keyword lists, the flagged/blocked review queues, and moderation webhooks. The UI Kits need no code for this; the rules apply to every message sent through CometChat.

Source: https://www.cometchat.com/docs/moderation/getting-started

## 1. Turn off legacy extensions, then enable rules

If the app still uses the legacy **Profanity Filter**, **Data Masking** or **Image Moderation** extensions, disable them first. Running both processes every message twice and delays delivery.

Dashboard → your app → **Moderation** → **Settings** → **Rules** → toggle on the default rules you need. Categories:

- **Text** — Profanity Filter, Contact Details Filter, Email Filter, AI Toxicity, AI Spam, AI Scam, AI Platform Circumvention, plus OpenAI rules (hate & harassment, explicit content, privacy, self-harm, violence, impersonation, spam & scam).
- **Image** — AI Image Moderation, OpenAI rules (explicit, violence/gore, hate symbols, privacy data, minor safety, fraud, terrorism), Malware & Virus Scanner.
- **Video** — AI Video Moderation, Malware & Virus Scanner. **Audio / File** — Malware & Virus Scanner.

AI image/video moderation supports JPEG/PNG and MP4/MOV/AVI only.

## 2. Choose an action per rule

| Action | Effect |
| - | - |
| **Block** (default) | Message is not delivered; it goes to **Blocked Messages** |
| **Flag** | Message is delivered and added to **Flagged Messages** for review |
| **Ban User / Kick User** | Sender is banned or removed from the group |
| **Block User** | Sender is blocked platform-wide |

For AI conditions you can also set a confidence percentage: lower blocks more, higher gives fewer false positives.

## 3. Add your own keyword lists

Dashboard: **Moderation** → **Settings** → **Lists** → **Add** → name, category (word / pattern / sentence), terms. Then open a rule and select the list in its **Conditions**.

REST (multipart form; `category` is `word`, `pattern` or `sentence-similarity`):

```bash
curl -X POST "https://${APP_ID}.api-${REGION}.cometchat.io/v3/moderation/keywords" \
  -H "apikey: ${REST_API_KEY}" \
  -F "id=competitor-links" \
  -F "name=Competitor links" \
  -F "category=word" \
  -F "searchTerms=competitor1.com,competitor2.io"
```

Keyword lists are comma-separated. Pattern and sentence lists take one entry per line. Regex must be bounded: `.*`, `.+`, `\d+` and other unbounded quantifiers are rejected, so use `\d{3,10}`.

Rules can also be created over REST (`POST /v3/moderation/rules`); fetch the Add Rule reference for the condition schema first.

Source: https://www.cometchat.com/docs/moderation/lists-management

## 4. Client side

- **UI Kits** — moderation is built in, including the **Report Message** action in the message menu. Nothing to code.
- **Custom UI on the Chat SDK** — read the message's moderation status (approved / pending / disapproved) and listen for `onMessageModerated`. See the SDK moderation page for your platform, e.g. https://www.cometchat.com/docs/sdk/javascript/ai-moderation
- Users choose a reason when they report. Configure reasons in Dashboard → **Moderation** → **Advanced Settings** (max 5 custom reasons).

## 5. Webhook for moderation events

Dashboard → **Webhooks** → **Create Webhook** → **Triggers** → **Moderation**. Events:

- `moderation_engine_approved` / `moderation_engine_blocked` — the engine decided automatically.
- `moderation_manual_approved` — a moderator approved previously blocked content.
- `moderation_engine_failed` — OpenAI or your Custom API returned no decision.

Use an HTTPS URL, enable **Basic Authentication** on the webhook and check the `Authorization` header on every request, and return `200 OK` within 2 seconds (queue slow work).

## 6. Review queue

- Dashboard → **Moderation** → **Flagged Messages** / **Blocked Messages**. Decisions are recorded in **Reviewed Messages**, the audit trail.
- REST:

```bash
# List flagged messages
curl "https://${APP_ID}.api-${REGION}.cometchat.io/v3/moderation/flagged-messages?limit=50" \
  -H "apikey: ${REST_API_KEY}"

# Approve or block one ("approved" | "disapproved")
curl -X PATCH "https://${APP_ID}.api-${REGION}.cometchat.io/v3/moderation/flagged-messages/${MESSAGE_ID}" \
  -H "apikey: ${REST_API_KEY}" -H "Content-Type: application/json" \
  -d '{"status":"disapproved"}'
```

Source: https://www.cometchat.com/docs/moderation/flagged-messages

## Common pitfalls

- **Legacy extensions left on** next to the new rules — messages are processed twice and delayed.
- **Rules enabled only on the dev app** — production ships unmoderated; enable them on the production app too.
- **Rules set to Flag with no one watching the queue** — the backlog grows; assign an owner.
- **Greedy regex in a list or rule** (`.*`, `\d+`) — rejected; use bounded quantifiers.
- **Comma-separated entries in a pattern or sentence list** — stored as one entry and never matches.
- **REST API key in client code** — the moderation endpoints need a full-access key; call them only from your server.
- **Limits** — 25 custom rules, 25 custom lists, 10 conditions and 10 filters per rule.
- **Read receipts** — marking a message delivered/read also marks earlier pending or disapproved messages delivered/read.

## What to read next

- Rules management: https://www.cometchat.com/docs/moderation/rules-management
- Moderation REST API: https://www.cometchat.com/docs/rest-api/moderation-apis/overview
- Custom moderation API: https://www.cometchat.com/docs/moderation/custom/custom-api-overview
- OpenAI moderation: https://www.cometchat.com/docs/moderation/open-ai/openai-overview
- Constraints and limits: https://www.cometchat.com/docs/moderation/constraints-and-limits
