# Component Page Template

This is the master template for creating component documentation pages. It defines the complete structure and section order that all component pages should follow.

## Template Usage

1. Copy this template when creating a new component documentation page
2. Replace all placeholders (marked with `[placeholder-name]`) with actual values
3. Remove conditional sections that don't apply to your component
4. Follow the section order exactly as defined

---

## Template Structure

```mdx
---
title: "[Component Display Name]"
description: "[Brief one-line description of the component]"
---

[1-2 sentence introduction describing what the component does and its primary use case.]

<Frame>
  <img src="/images/[component-hero-screenshot].png" />
</Frame>

<!-- ============================================================ -->
<!-- AI AGENT COMPONENT SPEC SECTION                               -->
<!-- Required for all components                                   -->
<!-- ============================================================ -->

<Accordion title="AI Agent Component Spec">
```json
{
  "component": "[ComponentClassName]",
  "package": "[package-name]",
  "import": "[import-statement]",
  "description": "[Brief component description for AI agents]",
  "inherits": "[ParentClass]",
  "primaryOutput": {
    "callback": "[primaryCallbackName]",
    "type": "[callback-type-signature]"
  },
  "props": {
    "data": {
      "[dataPropName]": {
        "type": "[Type]",
        "default": "[default-value]",
        "note": "[Optional note about the prop]"
      }
    },
    "callbacks": {
      "[callbackName]": "[callback-type-signature]"
    },
    "visibility": {
      "[hidePropertyName]": { "type": "Bool", "default": false }
    },
    "sound": {
      "[soundPropName]": { "type": "[Type]", "default": "[default-value]" }
    },
    "selection": {
      "[selectionPropName]": { "type": "[Type]", "default": "[default-value]" }
    },
    "viewSlots": {
      "[slotName]": "[slot-type-signature]"
    },
    "formatting": {
      "[formatterPropName]": { "type": "[Type]", "default": "[default-value]" }
    }
  },
  "events": [
    {
      "name": "[eventName]",
      "payload": "[PayloadType]",
      "description": "[When this event fires]"
    }
  ],
  "sdkListeners": [
    "[sdkListenerName1]",
    "[sdkListenerName2]"
  ],
  "compositionExample": {
    "description": "[Brief description of component composition]",
    "components": ["[Component1]", "[Component2]"],
    "flow": "[Description of data/navigation flow between components]"
  },
  "types": {
    "[CustomTypeName]": {
      "[field1]": "[type]",
      "[field2]": "[type]"
    }
  }
}
```
</Accordion>

---

<!-- ============================================================ -->
<!-- WHERE IT FITS SECTION                                         -->
<!-- Required for all components                                   -->
<!-- ============================================================ -->

## Where It Fits

[1-2 sentence description explaining the component's role in the application architecture and how it connects to other components.]

```[language]
[import-statements]

[Code example showing how to wire this component with related components.
Include proper memory management (e.g., [weak self] for iOS closures).
Show the primary output callback and how to handle its payload.]
```

<Frame>
  <img src="/images/[component-context-screenshot].png" />
</Frame>

---

<!-- ============================================================ -->
<!-- MINIMAL RENDER SECTION                                        -->
<!-- Required for all components                                   -->
<!-- ============================================================ -->

## Minimal Render

[Optional: One sentence describing the minimal setup.]

```[language]
[import-statements]

[Simplest working code example - aim for under 10 lines.
Include only the essential code to render the component.]
```

<Frame>
  <img src="/images/[component-default-screenshot].png" />
</Frame>

---

<!-- ============================================================ -->
<!-- FILTERING SECTION                                             -->
<!-- CONDITIONAL: Include only if component supports filtering     -->
<!-- ============================================================ -->

## Filtering

[Explanation of the Request Builder pattern for this component and how filtering works.]

```[language]
[import-statements]

[Code example showing basic filtering setup with RequestBuilder]
```

### Filter Recipes

| Recipe | Code |
|--------|------|
| [Recipe name - e.g., "Show only users"] | `[Code snippet - e.g., ".set(conversationType: .user)"]` |
| [Recipe name - e.g., "Show only groups"] | `[Code snippet - e.g., ".set(conversationType: .group)"]` |
| [Recipe name - e.g., "Filter by tags"] | `[Code snippet - e.g., ".set(tags: [\"support\"])"]` |
| [Recipe name - e.g., "Limit results"] | `[Code snippet - e.g., ".set(limit: 20)"]` |

---

<!-- ============================================================ -->
<!-- ACTIONS AND EVENTS SECTION                                    -->
<!-- Required for all components                                   -->
<!-- ============================================================ -->

## Actions and Events

### Callback Props

#### [callbackName1]

[Description of when this callback fires and what it's used for.]

```[language]
[import-statements]

[Code example showing how to set and use this callback.
Include [weak self] for iOS closures that reference self.]
```

#### [callbackName2]

[Description of when this callback fires and what it's used for.]

```[language]
[Code example for this callback]
```

### Actions Reference

<!-- Include this table when component has multiple callback props -->

| Method | Description | Example |
|--------|-------------|---------|
| `[set(callbackName1:)]` | [Brief description] | [Brief usage example] |
| `[set(callbackName2:)]` | [Brief description] | [Brief usage example] |
| `[set(callbackName3:)]` | [Brief description] | [Brief usage example] |

### Global UI Events

<!-- If component emits global events, list them here -->
<!-- If no global events, use the fallback text below -->

| Event | Fires when | Payload |
|-------|------------|---------|
| `[eventName1]` | [Trigger description] | `[PayloadType]` |
| `[eventName2]` | [Trigger description] | `[PayloadType]` |

<!-- FALLBACK: Use this if component has no global UI events -->
<!-- The component does not emit global UI events. -->

### SDK Events (Real-Time, Automatic)

<!-- If component listens to SDK events, list them here -->
<!-- If no SDK listeners, use the fallback text below -->

| SDK Listener | Internal behavior |
|--------------|-------------------|
| `[onMessageReceived]` | [What the component does when this event fires] |
| `[onTypingStarted]` | [What the component does when this event fires] |
| `[onUserOnline]` | [What the component does when this event fires] |

<!-- FALLBACK: Use this if component has no SDK listeners -->
<!-- The component does not listen to real-time SDK events. -->

---

<!-- ============================================================ -->
<!-- CUSTOM VIEW SLOTS SECTION                                     -->
<!-- CONDITIONAL: Include only if component supports view slots    -->
<!-- ============================================================ -->

## Custom View Slots

| Slot | Signature | Replaces |
|------|-----------|----------|
| `[slotName1]` | `[type-signature]` | [What UI element it replaces] |
| `[slotName2]` | `[type-signature]` | [What UI element it replaces] |
| `[slotName3]` | `[type-signature]` | [What UI element it replaces] |

### [slotName1]

[Description of what this slot customizes and when to use it.]

Default:
<Frame>
  <img src="/images/[slot1-default-screenshot].png" />
</Frame>

Customized:
<Frame>
  <img src="/images/[slot1-customized-screenshot].png" />
</Frame>

```[language]
[import-statements]

[Code example showing how to customize this slot.
Include complete implementation with proper types.]
```

### [slotName2]

[Description of what this slot customizes and when to use it.]

Default:
<Frame>
  <img src="/images/[slot2-default-screenshot].png" />
</Frame>

Customized:
<Frame>
  <img src="/images/[slot2-customized-screenshot].png" />
</Frame>

```[language]
[Code example for this slot customization]
```

---

<!-- ============================================================ -->
<!-- STYLING SECTION                                               -->
<!-- Required for all components                                   -->
<!-- ============================================================ -->

## Styling

### Style Hierarchy

1. Global styles (`[ComponentName].style`) apply to all instances
2. Instance styles (`instance.style`) override global for specific instances

### Global Level Styling

```[language]
[import-statements]

[Code example showing how to apply global styles.
Show setting multiple style properties.]
```

### Instance Level Styling

```[language]
[import-statements]

[Code example showing how to apply instance-level styles.
Show creating a style object and applying it to a specific instance.]
```

<Frame>
  <img src="/images/[styled-component-screenshot].png" />
</Frame>

### Key Style Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `[backgroundColor]` | `[UIColor]` | `[CometChatTheme.backgroundColor01]` | [Background color of the component] |
| `[titleFont]` | `[UIFont]` | `[CometChatTypography.Heading.bold]` | [Font for the title text] |
| `[titleColor]` | `[UIColor]` | `[CometChatTheme.textColorPrimary]` | [Color for the title text] |
| `[listItemBackground]` | `[UIColor]` | `[.clear]` | [Background color for list items] |
| `[borderWidth]` | `[CGFloat]` | `[0]` | [Border width for the component] |
| `[cornerRadius]` | `[CometChatCornerStyle]` | `[CometChatCornerStyle(cornerRadius: 0)]` | [Corner radius for the component] |

### Customization Matrix

| What to change | Where | Property/API | Example |
|----------------|-------|--------------|---------|
| [Background color] | [Style] | `[backgroundColor]` | `[.systemBackground]` |
| [Title appearance] | [Style] | `[titleFont, titleColor]` | `[.boldSystemFont(ofSize: 18)]` |
| [List item look] | [Style] | `[listItemBackground]` | `[UIColor(hex: "#F5F5F5")]` |
| [Hide element] | [Property] | `[hidePropertyName]` | `[component.hideSearch = true]` |
| [Custom view] | [View Slot] | `[set(slotName:)]` | `[See Custom View Slots section]` |

---

<!-- ============================================================ -->
<!-- PROPS SECTION                                                 -->
<!-- Required for all components                                   -->
<!-- ============================================================ -->

## Props

All props are optional. Sorted alphabetically.

### [propName1]

[Description of what this prop does and when to use it.]

| | |
|---|---|
| Type | `[TypeName]` |
| Default | `[default-value]` |

### [propName2]

[Description of what this prop does and when to use it.]

| | |
|---|---|
| Type | `[TypeName]` |
| Default | `[default-value]` |

### [propName3]

[Description of what this prop does and when to use it.]

| | |
|---|---|
| Type | `[TypeName]` |
| Default | `[default-value]` |

---

<!-- ============================================================ -->
<!-- EVENTS SECTION                                                -->
<!-- Required for all components                                   -->
<!-- ============================================================ -->

## Events

<!-- If component has events, list them in this table -->
<!-- Events listed here must match the AI Agent Component Spec -->

| Event | Payload | Fires when |
|-------|---------|------------|
| `[eventName1]` | `[PayloadType]` | [Trigger description] |
| `[eventName2]` | `[PayloadType]` | [Trigger description] |

<!-- FALLBACK: Use this if component has no events -->
<!-- The component does not emit global events. -->

---

<!-- ============================================================ -->
<!-- DATE TIME FORMATTER SECTION                                   -->
<!-- CONDITIONAL: Include only if component displays timestamps    -->
<!-- ============================================================ -->

## Date Time Formatter

[Explanation of how date/time formatting works in this component.]

### Global Level Formatting

```[language]
[import-statements]

[Code example showing how to set global date/time formatters]
```

### Instance Level Formatting

```[language]
[import-statements]

[Code example showing how to set instance-level date/time formatters]
```

### Available Formatters

| Formatter | Purpose | Default Format |
|-----------|---------|----------------|
| `[timeFormatter]` | [Format for time display] | `[h:mm a]` |
| `[todayFormatter]` | [Format for today's date] | `[Today]` |
| `[yesterdayFormatter]` | [Format for yesterday] | `[Yesterday]` |
| `[dateFormatter]` | [Format for other dates] | `[MMM d]` |

### Common Customizations

```[language]
[Code example showing common date format customizations]
```

---

<!-- ============================================================ -->
<!-- MENTION CONFIGURATION SECTION                                 -->
<!-- CONDITIONAL: Include only if component supports @mentions     -->
<!-- ============================================================ -->

## Mention Configuration

[Explanation of how @mentions work in this component and where they appear.]

### [mentionConfigMethod]

[Description of the mention configuration API.]

```[language]
[Method signature]
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `[param1]` | `[Type]` | [Description] |
| `[param2]` | `[Type]` | [Description] |

```[language]
[import-statements]

[Code example showing how to configure mentions]
```

---

<!-- ============================================================ -->
<!-- TROUBLESHOOTING SECTION                                       -->
<!-- Recommended for all components                                -->
<!-- ============================================================ -->

## Troubleshooting

| Issue | Solution |
|-------|----------|
| [Common issue 1 - e.g., "Empty list"] | [Solution - e.g., "Ensure user is logged in and has data"] |
| [Common issue 2 - e.g., "Not updating"] | [Solution - e.g., "Check that real-time listeners are active"] |
| [Common issue 3 - e.g., "Navigation fails"] | [Solution - e.g., "Verify navigationController is not nil"] |
| [Common issue 4 - e.g., "Custom views not showing"] | [Solution - e.g., "Ensure custom view has proper constraints"] |

---

<!-- ============================================================ -->
<!-- RELATED COMPONENTS SECTION                                    -->
<!-- Required for all components                                   -->
<!-- ============================================================ -->

## Related Components

- [[RelatedComponent1]](/ui-kit/[platform]/[related-component-1]) - [Brief description of relationship]
- [[RelatedComponent2]](/ui-kit/[platform]/[related-component-2]) - [Brief description of relationship]
- [[RelatedComponent3]](/ui-kit/[platform]/[related-component-3]) - [Brief description of relationship]
- [[RelatedComponent4]](/ui-kit/[platform]/[related-component-4]) - [Brief description of relationship]
```

---

## Section Order Reference

The following sections MUST appear in this exact order:

1. **Frontmatter** (title, description)
2. **Introduction** (1-2 sentences + hero image)
3. **AI Agent Component Spec** (Accordion)
4. **Where It Fits**
5. **Minimal Render**
6. **Filtering** *(conditional - only if component supports filtering)*
7. **Actions and Events**
8. **Custom View Slots** *(conditional - only if component has view slots)*
9. **Styling**
10. **Props**
11. **Events**
12. **Date Time Formatter** *(conditional - only if component displays timestamps)*
13. **Mention Configuration** *(conditional - only if component supports @mentions)*
14. **Troubleshooting**
15. **Related Components**

---

## Conditional Section Guidelines

### Filtering Section

Include this section when:
- Component uses a RequestBuilder pattern for data fetching
- Component displays a list that can be filtered

Omit this section when:
- Component does not fetch list data
- Component has no filtering capabilities

### Custom View Slots Section

Include this section when:
- Component has customizable UI areas (view slots)
- Developers can inject custom views

Omit this section when:
- Component has no customizable views
- All UI is fixed/non-replaceable

### Date Time Formatter Section

Include this section when:
- Component displays timestamps (message times, last seen, etc.)
- Developers can customize date/time formatting

Omit this section when:
- Component does not display any dates or times

### Mention Configuration Section

Include this section when:
- Component displays or handles @mentions
- Developers can customize mention appearance

Omit this section when:
- Component does not support @mentions

---

## Placeholder Reference

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `[component-name]` | Component class name | `CometChatConversations` |
| `[platform]` | Target platform | `ios`, `android`, `flutter`, `react-native` |
| `[language]` | Code block language | `swift`, `kotlin`, `dart`, `typescript` |
| `[Type]` | Platform-specific type | `UIColor`, `Color`, `ColorValue` |
| `[import-statements]` | Required imports | `import CometChatUIKitSwift` |
| `[callback-type-signature]` | Callback type | `(Conversation, IndexPath) -> Void` |
| `[default-value]` | Default prop value | `nil`, `false`, `0` |

---

## Visual Component Requirements

### Frame Component

All images MUST be wrapped in Frame components:

```mdx
<Frame>
  <img src="/images/[screenshot-name].png" />
</Frame>
```

### Accordion Component

AI Agent Component Specs MUST be wrapped in Accordion:

```mdx
<Accordion title="AI Agent Component Spec">
```json
{ ... }
```
</Accordion>
```

### Code Blocks

All code blocks MUST specify the language:

```mdx
```swift
// Swift code
```

```kotlin
// Kotlin code
```

```dart
// Dart code
```

```typescript
// TypeScript code
```
```

---

## Table Format Standards

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

### Props Table
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

## Empty State Fallback Text

Use these exact phrases when a section has no content:

### No Global UI Events
```
The component does not emit global UI events.
```

### No SDK Listeners
```
The component does not listen to real-time SDK events.
```

### No Events
```
The component does not emit global events.
```
