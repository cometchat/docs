# CometChat Documentation Review Checklist

Use this checklist when reviewing CometChat documentation files. Based on the official doc templates.

---

## Frontmatter ✓

- [ ] Has `title` field
- [ ] Has `description` field (under 160 characters, technical summary)
- [ ] `sidebarTitle` present if sidebar label differs from title
- [ ] Landing pages have `mode: "custom"` and `canonical` URL

---

## AI Agent Component Spec ✓

- [ ] Wrapped in `<Accordion title="AI Agent Component Spec">`
- [ ] JSON is valid and properly formatted
- [ ] Required fields present: `component`, `package`, `import`, `description`
- [ ] Optional fields when applicable: `inherits`, `primaryOutput`, `props`, `events`, `sdkListeners`, `compositionExample`, `types`
- [ ] Props organized by category: `data`, `callbacks`, `visibility`, `sound`, `selection`, `viewSlots`, `formatting`
- [ ] Events match the Events section table

---

## Section Order (Component Pages) ✓

Must appear in this exact order:
1. [ ] Frontmatter
2. [ ] Introduction (1-2 sentences + hero image in `<Frame>`)
3. [ ] AI Agent Component Spec (Accordion)
4. [ ] Where It Fits
5. [ ] Minimal Render
6. [ ] Filtering *(conditional)*
7. [ ] Actions and Events
8. [ ] Custom View Slots *(conditional)*
9. [ ] Styling
10. [ ] Props
11. [ ] Events
12. [ ] Date Time Formatter *(conditional)*
13. [ ] Mention Configuration *(conditional)*
14. [ ] Troubleshooting
15. [ ] Related Components

---

## Code Examples ✓

### Import Requirements
- [ ] All necessary imports included
- [ ] iOS: `import CometChatUIKitSwift` and `import CometChatSDK` when using SDK types
- [ ] Android: Specific package imports for components and models
- [ ] Flutter: `import 'package:cometchat_chat_uikit/cometchat_chat_uikit.dart';`
- [ ] React/RN: Both UI Kit and SDK package imports

### Memory Management
- [ ] iOS: `[weak self]` in closures that reference `self`
- [ ] Android: Lifecycle-aware patterns, listener cleanup in `onDestroy()`
- [ ] Flutter: Listener cleanup in `dispose()`
- [ ] React Native: `useEffect` cleanup for listeners

### Code Block Standards
- [ ] All code blocks have language identifiers (`swift`, `kotlin`, `dart`, `tsx`, `json`, etc.)
- [ ] Code is copy-paste runnable
- [ ] Minimal examples under 10 lines (excluding imports)
- [ ] Production examples include complete context
- [ ] Multi-language examples use `<Tabs>` or `<CodeGroup>`

---

## Visual Components ✓

### Frame Component
- [ ] All screenshots wrapped in `<Frame>` component
- [ ] Images have descriptive alt text
- [ ] Image paths use lowercase with hyphens: `/images/component-name-context.png`

### CardGroup Component
- [ ] Used for resource links (3+ links)
- [ ] `cols` attribute set (2 for detailed, 3 for compact)
- [ ] Each Card has `title`, `icon`, `href`
- [ ] Card descriptions under 15 words

### Accordion Component
- [ ] AI Agent Spec wrapped in Accordion with exact title "AI Agent Component Spec"
- [ ] Platform specs use "AI Agent Platform Spec"

---

## Table Formats ✓

### Filter Recipes Table
```
| Recipe | Code |
|--------|------|
```

### Global UI Events Table
```
| Event | Fires when | Payload |
|-------|------------|---------|
```

### SDK Events Table
```
| SDK Listener | Internal behavior |
|--------------|-------------------|
```

### View Slots Table
```
| Slot | Signature | Replaces |
|------|-----------|----------|
```

### Style Properties Table
```
| Property | Type | Default | Description |
|----------|------|---------|-------------|
```

### Customization Matrix Table
```
| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
```

### Props Table (per-prop format)
```
| | |
|---|---|
| Type | `[Type]` |
| Default | `[default]` |
```

### Events Table
```
| Event | Payload | Fires when |
|-------|---------|------------|
```

### Actions Reference Table
```
| Method | Description | Example |
|--------|-------------|---------|
```

### Troubleshooting Table
```
| Issue | Solution |
|-------|----------|
```

---

## Empty State Fallbacks ✓

Use exact text when section has no content:

- [ ] No Global UI Events: "The component does not emit global UI events."
- [ ] No SDK Listeners: "The component does not listen to real-time SDK events."
- [ ] No Events: "The component does not emit global events."

---

## Content Quality ✓

### No Marketing Language
- [ ] No "Future proof"
- [ ] No "Partner with subject matter experts"
- [ ] No "Solutions for every industry"
- [ ] No "enterprise-grade" (promotional)
- [ ] No "Why It's Great" accordion sections
- [ ] Technical language is precise and factual

### Code-First Content
- [ ] Code appears within first 30 lines of content (after frontmatter)
- [ ] Introduction is 3 sentences or fewer before first code

---

## Mintlify Components ✓

- [ ] No raw HTML `<div>` for callouts (use `<Note>`, `<Warning>`, `<Tip>`, `<Info>`, `<Callout>`)
- [ ] No custom tab implementations (use `<Tabs>` or `<CodeGroup>`)
- [ ] Images use `<Frame>` where captions needed
- [ ] Cards use `<Card>` and `<CardGroup>`
- [ ] Sequential steps use `<Steps>` component
- [ ] Reusable content uses `<Snippet file="..." />`
- [ ] File trees use `<Tree>` component

---

## Page-Specific Checks

### Overview Pages
- [ ] AI Agent Platform Spec in Accordion
- [ ] Platform metadata summary table after Accordion
- [ ] Introduction with Key Features list
- [ ] Try It section with CardGroup
- [ ] Get Started with installation and quick setup code
- [ ] Explore section with 6 navigation cards (CardGroup cols={3})
- [ ] Resources section with 8 required links (Demo, Sample, Integration, Components, Features, Theming, Troubleshooting, Support)

### Component Pages
- [ ] Where It Fits section with context screenshot
- [ ] Minimal Render section with default screenshot
- [ ] Actions and Events with three subsections (Callback Props, Global UI Events, SDK Events)
- [ ] Styling section with Style Hierarchy, Global/Instance examples, Key Style Properties table, Customization Matrix
- [ ] Props sorted alphabetically with per-prop table format
- [ ] Related Components using CardGroup

### Integration/Quickstart Pages
- [ ] Prerequisites in `<Info>` or `<Note>` at top
- [ ] Uses `<Steps>` component for flow
- [ ] Covers: initialization, login, UI rendering
- [ ] "Try it live" / CodeSandbox link using `<Callout>` or `<Card>`
- [ ] Auth Key warning present
- [ ] Test UIDs listed for development

### Landing Pages
- [ ] Uses `<Snippet>` for footer (not inline HTML)
- [ ] Uses `<Snippet>` for hero blocks
- [ ] Interactive demo link prominent (above fold)
- [ ] No promotional accordion sections

### Deprecated Version Pages
- [ ] Deprecation notice using `<Note>` or `<Warning>`
- [ ] Link to current version

---

## Platform-Specific Type Reference

### iOS (Swift)
| Category | Type |
|----------|------|
| Colors | `UIColor` |
| Fonts | `UIFont` |
| Images | `UIImage` |
| Dimensions | `CGFloat` |
| Callbacks | `(T) -> Void` |
| Optional | `T?` |

### Android (Kotlin)
| Category | Type |
|----------|------|
| Colors | `Int` (Color) |
| Fonts | `Typeface` |
| Images | `Drawable` |
| Dimensions | `Float` |
| Callbacks | `(T) -> Unit` |
| Optional | `T?` |

### Flutter (Dart)
| Category | Type |
|----------|------|
| Colors | `Color` |
| Fonts | `TextStyle` |
| Images | `ImageProvider` |
| Dimensions | `double` |
| Callbacks | `void Function(T)` |
| Optional | `T?` |

### React Native (TypeScript)
| Category | Type |
|----------|------|
| Colors | `string` |
| Fonts | `TextStyle` |
| Images | `ImageSourcePropType` |
| Dimensions | `number` |
| Callbacks | `(t: T) => void` |
| Optional | `T \| undefined` |

---

## Glossary Terms ✓

First usage should link to glossary:
- [ ] `uid` - Unique user identifier
- [ ] `guid` - Unique group identifier
- [ ] `appId` - Application identifier from dashboard
- [ ] `authKey` - Authentication key for client-side user creation
- [ ] `Auth Token` - Server-generated token for secure authentication
- [ ] `API Key` / `REST API Key` - Keys for API access
- [ ] `Widget ID` - Identifier for embedded widgets
- [ ] `Region` - CometChat deployment region

---

## Navigation Structure ✓

- [ ] Maximum 2 levels of nesting in `docs.json`
- [ ] No empty string group names
- [ ] No single-page groups (inline or merge)
- [ ] Maximum 8 top-level groups per tab
- [ ] Latest version only as default per UI Kit
- [ ] Older versions under "Previous Versions" collapsible
