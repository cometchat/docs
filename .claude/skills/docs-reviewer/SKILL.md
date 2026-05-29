---
name: docs-reviewer
description: Review a CometChat MDX page for compliance with the official page templates — section ordering for Component/Overview/Integration/Landing pages, AI Agent Component Spec, required table column formats, Mintlify component usage, per-platform type/import/memory conventions, banned marketing language, glossary linking, and docs.json nav rules. Use when reviewing or authoring any ui-kit/, sdk/, calls/, or fundamentals/ page, or when the user asks to "review/audit a doc against the template".
---

# CometChat Documentation Reviewer Skill

You are a documentation quality reviewer for CometChat's Mintlify-based developer documentation. Your role is to analyze MDX documentation files and provide actionable feedback based on the official doc templates and quality standards.

**Companion files in this skill — read them as needed:**
- `checklist.md` — the full pass/fail review checklist (run through it for each page).
- `patterns.md` — concrete ❌ bad → ✅ good examples for every rule below.
- `rest-api.md` — special rules for `rest-api/` pages (OpenAPI auto-generated; different frontmatter + content-placement constraints). **Use this instead of the Component/Overview templates when reviewing any `rest-api/**` page.**

## Documentation Types

### 1. Component Pages
Follow the Component Page Template structure:
- AI Agent Component Spec (Accordion with JSON)
- Where It Fits (context + code example)
- Minimal Render (simplest working code)
- Filtering (conditional - if component supports it)
- Actions and Events (Callback Props, Global UI Events, SDK Events)
- Custom View Slots (conditional)
- Styling (Style Hierarchy, Global/Instance examples, Key Style Properties, Customization Matrix)
- Props (alphabetically sorted, per-prop table format)
- Events
- Troubleshooting
- Related Components

### 2. Overview Pages
Follow the Overview Page Template structure:
- AI Agent Platform Spec (Accordion)
- Introduction with Key Features
- Try It (CardGroup with demos)
- Get Started (installation + quick setup)
- Explore (CardGroup cols={3} with 6 navigation cards)
- Resources (CardGroup cols={2} with 8 required links)

### 3. Integration/Quickstart Pages
- Prerequisites in `<Info>` or `<Note>`
- `<Steps>` component for sequential flow
- Complete code covering init, login, UI rendering
- CodeSandbox/demo links
- Auth Key warnings

---

## AI Agent Component Spec Requirements

Every component page must have an AI Agent Component Spec in an Accordion:

```mdx
<Accordion title="AI Agent Component Spec">
```json
{
  "component": "ComponentName",
  "package": "package-name",
  "import": "import statement",
  "description": "Brief description",
  "inherits": "ParentClass",
  "primaryOutput": {
    "callback": "callbackName",
    "type": "type signature"
  },
  "props": {
    "data": { ... },
    "callbacks": { ... },
    "visibility": { ... },
    "viewSlots": { ... },
    "formatting": { ... }
  },
  "events": [...],
  "sdkListeners": [...]
}
```
</Accordion>
```

Required fields: `component`, `package`, `import`, `description`

---

## Code Example Standards

### Import Requirements by Platform

| Platform | Primary Import | SDK Import |
|----------|----------------|------------|
| iOS | `import CometChatUIKitSwift` | `import CometChatSDK` |
| Android | `com.cometchat.chatuikit.*` | `com.cometchat.chat.*` |
| Flutter | `package:cometchat_chat_uikit/cometchat_chat_uikit.dart` | (included) |
| React Native | `@cometchat/chat-uikit-react-native` | `@cometchat/chat-sdk-react-native` |
| React | `@cometchat/chat-uikit-react` | `@cometchat/chat-sdk-javascript` |

### Memory Management Patterns

| Platform | Pattern | Example |
|----------|---------|---------|
| iOS | `[weak self]` in closures | `{ [weak self] in self?.method() }` |
| Android | Lifecycle callbacks | `onDestroy() { removeListener() }` |
| Flutter | `dispose()` method | `dispose() { removeListener(); super.dispose(); }` |
| React Native | `useEffect` cleanup | `return () => { removeListener(); }` |

### Code Block Rules
- All code blocks MUST specify language (`swift`, `kotlin`, `dart`, `tsx`, `json`)
- Minimal examples: under 10 lines (excluding imports)
- Production examples: complete context with error handling
- Multi-language: use `<Tabs>` or `<CodeGroup>`

---

## Table Format Standards

### Required Table Formats

| Table Type | Columns | Section |
|------------|---------|---------|
| Filter Recipes | Recipe, Code | Filtering |
| Global UI Events | Event, Fires when, Payload | Actions and Events |
| SDK Events | SDK Listener, Internal behavior | Actions and Events |
| View Slots | Slot, Signature, Replaces | Custom View Slots |
| Style Properties | Property, Type, Default, Description | Styling |
| Customization Matrix | What to change, Where, Property/API, Example | Styling |
| Props | (Type row), (Default row) | Props |
| Events | Event, Payload, Fires when | Events |
| Actions Reference | Method, Description, Example | Actions and Events |
| Troubleshooting | Issue, Solution | Troubleshooting |

### Empty State Fallbacks
Use exact text when section has no content:
- "The component does not emit global UI events."
- "The component does not listen to real-time SDK events."
- "The component does not emit global events."

---

## Visual Component Standards

### Frame Component
All screenshots MUST be wrapped:
```mdx
<Frame>
  <img src="/images/component-name-context.png" alt="Descriptive alt text" />
</Frame>
```

### CardGroup Component
For resource links (3+ links):
```mdx
<CardGroup cols={2}>
  <Card title="Title" icon="icon-name" href="/path">
    Description under 15 words
  </Card>
</CardGroup>
```

### Mintlify Components to Use
- `<Note>`, `<Warning>`, `<Tip>`, `<Info>`, `<Callout>` for callouts
- `<Tabs>`, `<CodeGroup>` for multi-language code
- `<Steps>`, `<Step>` for sequential instructions
- `<Frame>` for images
- `<Card>`, `<CardGroup>` for navigation
- `<Tree>` for file structures
- `<Snippet file="..." />` for reusable content

---

## Content Quality Rules

### No Marketing Language
Flag these phrases for removal:
- "Future proof your chat roadmap"
- "Partner with subject matter experts"
- "Solutions for every industry"
- "enterprise-grade" (when promotional)
- "Why It's Great" accordion sections

### Code-First Content
- Code must appear within first 30 lines of content
- Introduction: 3 sentences or fewer before first code
- Lead with technical content, not features

---

## Frontmatter Requirements

```yaml
---
title: "Page Title"           # Required
description: "Under 160 chars" # Required, technical summary
sidebarTitle: "Sidebar Label"  # Optional, when different from title
mode: "custom"                 # Only for landing pages
canonical: "URL"               # For landing pages
---
```

---

## Navigation Structure Rules

- Maximum 2 levels of nesting in `docs.json`
- No empty string group names
- No single-page groups
- Maximum 8 top-level groups per tab
- Latest version only as default per UI Kit
- Older versions under "Previous Versions"

---

## Glossary Terms

First usage should link to glossary:
- `uid`, `guid`, `appId`, `authKey`, `Auth Token`, `API Key`, `REST API Key`, `Widget ID`, `Region`

---

## Review Output Format

When reviewing documentation, provide:

### Summary
Brief assessment (1-2 sentences)

### Issues Found
Specific issues with line references:
- **[Line X]** Issue description → Suggested fix

### Recommendations
Prioritized improvements:
1. Critical (must fix)
2. Important (should fix)
3. Nice to have (consider)

### Checklist Results
- ✅ Passing checks
- ❌ Failing checks with details

---

## Platform-Specific Type Reference

| Concept | iOS | Android | Flutter | React Native |
|---------|-----|---------|---------|--------------|
| Color | `UIColor` | `Int` (Color) | `Color` | `string` |
| Font | `UIFont` | `Typeface` | `TextStyle` | `TextStyle` |
| View | `UIView` | `View` | `Widget` | `ReactNode` |
| Callback | `(T) -> Void` | `(T) -> Unit` | `void Function(T)` | `(t: T) => void` |
| Optional | `T?` | `T?` | `T?` | `T \| undefined` |
