# CometChat REST API Documentation Audit Report

**Date:** 2026-04-24
**Branch:** `docs/restapi-chatapi-ENG-30061-ketan`
**Preview URL:** https://cometchat-22654f5b-docs-restapi-chatapi-eng-30061-ketan.mintlify.app/
**Pages Scanned:** 3,090 MDX files across 10 product directories
**OAS Files Scanned:** 5 files with 345 total endpoints

---

## Executive Summary

| Dimension              | Score      |
| ---------------------- | ---------- |
| Enterprise Readiness   | 7.5/10     |
| AI-Agent Friendliness  | 7.0/10     |
| AEO Friendliness       | 8.5/10     |
| Link Hygiene           | 8.0/10     |
| Completeness           | 7.5/10     |
| Consistency            | 7.0/10     |
| **Overall (weighted)** | **7.5/10** |

The REST API docs are well-structured with zero orphan pages, zero ghost nav entries, and 100% frontmatter description coverage. The main gaps are in the OAS response schemas (52 untyped `data: object` responses in chat-apis.json), 4 broken redirect destinations, and cross-product consistency in overview page structure.

---

## Product Coverage

| Product               | OAS File              | Endpoints | MDX Pages | Guide Pages        | Status |
| --------------------- | --------------------- | --------- | --------- | ------------------ | ------ |
| Chat & Messaging      | chat-apis.json        | 130       | 404       | 26 (notifications) | Active |
| Voice & Video Calling | calls.json            | 2         | 207       | —                  | Active |
| AI Agents             | ai-agent-service.json | 68        | 86        | —                  | Active |
| Moderation            | management-apis.json  | 141       | 12        | —                  | Active |
| Data Import           | data-import-apis.json | 4         | —         | —                  | Active |

---

## Score Breakdown

### Enterprise Readiness: 7.5/10

All 345 endpoints have operationIds and zero empty example values. Authentication is documented per-product (apikey for Chat, Basic Auth for Management). The main gap is 52 endpoints in chat-apis.json returning `data` as a generic untyped `object` — enterprise SDK codegen and type-safe clients can't infer response structure. 14 endpoints have completely empty response schemas.

### AI-Agent Friendliness: 7.0/10

100% operationId coverage is excellent for AI agent consumption. The `llms.txt` file is published and accessible. However, 35 list endpoints across 3 OAS files lack pagination metadata in response schemas, making it harder for agents to handle paginated results programmatically. The 52 untyped response objects in chat-apis.json are the biggest blocker for AI agent integration.

### AEO Friendliness: 8.5/10

Every REST API MDX file has a frontmatter `description`. The `llms.txt` is published with clear page descriptions. Heading hierarchy is clean across all scanned pages. Overview pages have structured endpoint tables (except AI Agents overview which uses prose instead). No debug markers in REST API pages.

### Link Hygiene: 8.0/10

Zero broken internal links in REST API pages. Zero legacy domain references. Zero orphan or ghost pages. However, 4 redirect destinations point to non-existent files (`/ai-chatbots/ai-bots/bots`, `/ai-chatbots/ai-bots/instructions`, `/widget/wordpress/legacy`, `/widget/html/legacy`). The `flutter-sdk-changes-review.md` file (286 `<br>` tags fixed in this branch) and 13 files with invalid `mintlify` imports were cleaned up.

### Completeness: 7.5/10

REST API overview pages for Calls and Moderation are comprehensive with endpoint tables, property tables, error handling, and pagination examples. AI Agents overview is lighter — missing a structured endpoint table. The iOS APNs push notification page renders as code-only with no prose introduction. 11 TODO markers remain in iOS UI Kit and React Native notification pages (screenshots and code snippets needed).

### Consistency: 7.0/10

Overview page structure varies across products — Calls and Moderation have full endpoint tables while AI Agents uses prose. Pagination parameter naming varies across OAS files (`perPage`/`count`/`limit`) — this is an API-contract issue, not a docs issue. Code fence formatting was inconsistent (3 vs 4 backtick closings) across 10 JavaScript SDK files — fixed in this branch. Duplicate frontmatter keys were found in 2 files — fixed in this branch.

---

## Issues Found

### CRITICAL (P0)

| #   | Issue                                                  | File/Product   | Dimension                      | Suggested Fix                                                |
| --- | ------------------------------------------------------ | -------------- | ------------------------------ | ------------------------------------------------------------ |
| 1   | 52 endpoints return `data` as untyped generic `object` | chat-apis.json | Enterprise Readiness, AI-Agent | Add typed response schemas with properties for each endpoint |

### HIGH (P1)

| #   | Issue                                                            | File/Product                                                   | Dimension             | Suggested Fix                                                                                                                                      |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2   | 35 list endpoints missing pagination metadata in response schema | chat-apis.json, management-apis.json, ai-agent-service.json    | AI-Agent Friendliness | Add `meta`/`pagination` object to list endpoint response schemas                                                                                   |
| 3   | 23 endpoints with empty response schemas                         | chat-apis.json (14), calls.json (2), ai-agent-service.json (7) | Enterprise Readiness  | Define response properties or document as 204 No Content                                                                                           |
| 4   | 4 broken redirect destinations                                   | docs.json redirects                                            | Link Hygiene          | Remove or update redirects for `/ai-chatbots/ai-bots/bots`, `/ai-chatbots/ai-bots/instructions`, `/widget/wordpress/legacy`, `/widget/html/legacy` |

### MEDIUM (P2)

| #   | Issue                                                   | File/Product                                       | Dimension                 | Suggested Fix                                                |
| --- | ------------------------------------------------------- | -------------------------------------------------- | ------------------------- | ------------------------------------------------------------ |
| 5   | AI Agents API overview lacks structured endpoint table  | rest-api/ai-agents-apis/overview                   | Completeness, Consistency | Add endpoint table matching Calls/Moderation overview format |
| 6   | iOS APNs push notification page is code-only            | notifications/ios-apns-push-notifications.mdx      | Completeness              | Add introductory prose, setup steps, and section headers     |
| 7   | 11 TODO markers in iOS UI Kit and RN notification pages | ui-kit/ios/_.mdx, notifications/react-native-_.mdx | Completeness              | Add missing screenshots and code snippets                    |

### LOW (P3)

| #   | Issue                                                          | File/Product | Dimension            | Suggested Fix                         |
| --- | -------------------------------------------------------------- | ------------ | -------------------- | ------------------------------------- |
| 8   | `AWSCLIV2.pkg` in repo root (skipped by Mintlify as too large) | Root         | Link Hygiene         | Add to .gitignore or remove from repo |
| 9   | Calls OAS has only 2 endpoints with empty 400 error schemas    | calls.json   | Enterprise Readiness | Add error response properties         |

---

## Fixes Applied in This Branch

The following issues were discovered and fixed during this audit session:

| Fix                        | Files                                                           | Change                                                                                                        |
| -------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Duplicate redirect source  | docs.json                                                       | Removed duplicate `/notifications/push-notification-extension-overview`, kept assets.cometchat.io destination |
| `<br>` → `<br/>`           | flutter-sdk-changes-review.md                                   | 286 self-closing HTML tags for MDX compatibility                                                              |
| Mismatched code fences     | 10 MDX files (ios-apns, ios-fcm, 8 JS SDK files)                | Fixed ``````` closings to match ` `` ` openings                                                               |
| Inline code fences         | sdk/javascript/retrieve-users.mdx, send-message.mdx             | Expanded single-line code fences to proper multi-line blocks                                                  |
| Escaped comment syntax     | sdk/javascript/send-message.mdx                                 | Fixed `{/\*` → `{/*` and `\*/}` → `*/}`                                                                       |
| Duplicate frontmatter keys | sdk/android/changelog.mdx, sdk/flutter/ai-chatbots-overview.mdx | Removed duplicate `description` keys                                                                          |
| Invalid mintlify imports   | 13 MDX files across calls, widget, ai-agents                    | Removed `import { ... } from 'mintlify'` (components are globally available)                                  |

---

## Prioritized Fix List

### P0 — Must fix (blocks SDK codegen / AI agent consumption)

1. Add typed response schemas to 52 chat-apis.json endpoints returning generic `data: object`

### P1 — Should fix (degrades developer experience)

1. Add pagination metadata to 35 list endpoint response schemas
2. Define response properties for 23 empty response schemas
3. Fix or remove 4 broken redirect destinations in docs.json

### P2 — Nice to fix (polish)

1. Add structured endpoint table to AI Agents API overview page
2. Add prose introduction to iOS APNs push notification page
3. Resolve 11 TODO markers (screenshots, code snippets)

### P3 — Backlog

1. Remove `AWSCLIV2.pkg` from repo
2. Add error response schemas to calls.json

---

## Appendix

- **Total issues:** 9
- **By severity:** 1 critical, 3 high, 3 medium, 2 low
- **By product:** Chat 3, Calls 1, AI Agents 1, Cross-product 4
- **Pages with zero issues:** 3,070+ of 3,090
- **OAS files scanned:** chat-apis.json (130), calls.json (2), data-import-apis.json (4), management-apis.json (141), ai-agent-service.json (68)
- **Branch fixes applied:** 3 commits fixing 27 files total
