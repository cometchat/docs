# Dual-Audience Documentation Audit Checklist

Use this checklist when auditing documentation for both human developers and AI coding agents.

---

## Heading Hierarchy & Structure ✓

- [ ] Single H1 per page (the page title)
- [ ] Heading levels nested logically (H1 → H2 → H3, no skipping)
- [ ] Headings provide a clear "roadmap" of the content
- [ ] Headings are descriptive (not generic like "Overview" or "Details")
- [ ] Heading text is unique within the page (no duplicate headings)
- [ ] Headings don't end with punctuation (except ?)

---

## Chunking & Contextual Integrity ✓

### Self-Contained Sections
- [ ] Each major section includes product/feature name
- [ ] Each section states its purpose in the first sentence
- [ ] Critical constraints appear near relevant instructions
- [ ] Prerequisites listed before instructions
- [ ] No "as mentioned above" or "see below" without links

### RAG-Friendly Structure
- [ ] Sections are 200-500 words (optimal chunk size)
- [ ] Key information not split across section boundaries
- [ ] Tables and code blocks are complete within sections
- [ ] Lists don't span multiple sections

---

## Terminology & Semantic Clarity ✓

### Consistency
- [ ] `appId` used consistently (not "app ID", "App Id", "application ID")
- [ ] `authKey` used consistently (not "auth key", "Auth Key")
- [ ] `uid` used consistently (not "user ID", "userId" in prose)
- [ ] `guid` used consistently (not "group ID", "groupId" in prose)
- [ ] `API Key` used consistently (not "api key", "apiKey" in prose)
- [ ] `Auth Token` used consistently (not "auth token", "authToken" in prose)

### Clarity
- [ ] No ambiguous pronouns ("it", "this", "that") in technical instructions
- [ ] Acronyms defined on first use
- [ ] Technical jargon explained or linked to glossary
- [ ] Parameter names match code exactly
- [ ] Error messages quoted exactly as they appear

### Coreference Resolution
- [ ] Subject of each sentence is explicit
- [ ] Antecedents are clear within 1-2 sentences
- [ ] Lists items are parallel in structure
- [ ] Comparisons state both items being compared

---

## Code & Format Optimization ✓

### Code Blocks
- [ ] All code blocks have language identifiers
- [ ] Code is copy-paste runnable
- [ ] Imports included in examples
- [ ] Placeholder values clearly marked (YOUR_APP_ID, etc.)
- [ ] Error handling shown in production examples
- [ ] Comments explain non-obvious code

### Format Efficiency
- [ ] Tables used for structured data (not verbose JSON)
- [ ] Lists used for 3+ related items
- [ ] Inline code for single values, blocks for multi-line
- [ ] Images have alt text
- [ ] Large code examples are collapsible or linked

### The What vs The Why
- [ ] API reference sections explain parameters
- [ ] Use case sections explain when/why to use
- [ ] Architecture decisions are documented
- [ ] Trade-offs are explained

---

## Discoverability & Agentic Support ✓

### Metadata
- [ ] Frontmatter includes title
- [ ] Frontmatter includes description (under 160 chars)
- [ ] Keywords/tags present if supported
- [ ] Version information included where relevant

### Navigation
- [ ] Cross-references use relative links
- [ ] External links open in new tab
- [ ] Breadcrumbs or navigation context present
- [ ] Related content linked at end

### Agent Signals
- [ ] Page supports "Copy to Markdown"
- [ ] Code blocks are properly fenced
- [ ] No embedded images in critical instructions
- [ ] Machine-readable formats available (JSON, YAML)

---

## Human Experience ✓

### The "Why"
- [ ] Purpose explained before implementation
- [ ] Use cases described with real scenarios
- [ ] Benefits and trade-offs mentioned
- [ ] Architecture decisions explained

### Skimmability
- [ ] Key information in first paragraph
- [ ] Bullet points for lists of 3+ items
- [ ] Tables for comparative information
- [ ] Bold for key terms (sparingly)
- [ ] TL;DR or summary for long sections

### Error Guidance
- [ ] Common errors documented
- [ ] Error messages explained
- [ ] Troubleshooting section present
- [ ] Debug steps provided
- [ ] Support/help links included

### Progressive Disclosure
- [ ] Simple example first
- [ ] Advanced options after basics
- [ ] Optional features clearly marked
- [ ] Deep dives in separate sections or pages

---

## Hallucination Risk Assessment ✓

### High Risk (Must Fix)
- [ ] No instructions that assume context from other pages
- [ ] No version-specific info without version numbers
- [ ] No deprecated features without warnings
- [ ] No ambiguous parameter names

### Medium Risk (Should Fix)
- [ ] No implicit ordering dependencies
- [ ] No assumed environment setup
- [ ] No platform-specific code without labels
- [ ] No optional steps that look required

### Low Risk (Nice to Have)
- [ ] No marketing language in technical sections
- [ ] No subjective claims ("easy", "simple", "best")
- [ ] No time-sensitive information without dates
- [ ] No external links without context

---

## Scoring Guide

### Agentic Readiness Score Components

| Category | Points | Criteria |
|----------|--------|----------|
| Heading Structure | 20 | Logical hierarchy, no skips, descriptive |
| Contextual Integrity | 20 | Self-contained, prerequisites stated |
| Terminology | 20 | Consistent, no ambiguity, defined |
| Code Quality | 20 | Fenced, runnable, documented |
| Discoverability | 20 | Metadata, links, agent signals |

### Score Interpretation

| Score | Rating | Action |
|-------|--------|--------|
| 90-100 | Excellent | Minor polish only |
| 75-89 | Good | Address important issues |
| 60-74 | Fair | Significant revision needed |
| 40-59 | Poor | Major restructuring required |
| 0-39 | Critical | Complete rewrite recommended |

---

## Quick Reference: Common Fixes

| Issue | Fix |
|-------|-----|
| "It does X" | "[Component name] does X" |
| "As mentioned above" | "[Link to section] explains..." |
| "Use the API" | "Use the `sendMessage` API" |
| H1 → H3 skip | Add H2 between them |
| "Easy to use" | Remove or replace with specific benefit |
| Code without language | Add ```javascript or appropriate tag |
| "See below" | Add anchor link to specific section |
| Undefined acronym | "SDK (Software Development Kit)" on first use |
