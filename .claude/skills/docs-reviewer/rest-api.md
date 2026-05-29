# REST API MDX File Structure

> Applies to every `rest-api/**/*.mdx` page. When reviewing or authoring a REST API page, use these rules instead of the Component/Overview page templates.

These files use Mintlify's OpenAPI auto-generation. The frontmatter `openapi:` directive tells Mintlify to render the API endpoint details (parameters, request body, response schema, code samples, try-it playground) from the referenced OpenAPI spec.

## How Mintlify renders an OpenAPI MDX page

Mintlify renders content in this fixed order:

1. Endpoint title, description, method badge, and "Try it" button
2. MDX body content (everything below the frontmatter `---`)
3. Auto-generated API docs (authorizations, parameters, request body, response)

There is NO way to place custom content after the auto-generated API docs. This has been tested with:
- MDX body content → renders BEFORE API params (between endpoint header and authorizations)
- `x-mint: content` in OpenAPI spec → ignored when page uses MDX with `openapi:` frontmatter
- OpenAPI `description` with markdown → overridden by MDX frontmatter `description`
- Direct endpoint references in `docs.json` → `x-mint: content` still did not render

## Content Placement Rule

Since MDX body content always appears BETWEEN the endpoint header and the API parameters/response, be intentional about what goes in the MDX body. Only include content that provides useful context before the API details.

### Correct structure

```
---
openapi: <method> <path>
description: "<description>"
---

<static content goes here — renders BETWEEN endpoint header and API params>
```

The frontmatter block should only contain `openapi` and `description`. All supplementary content belongs in the MDX body below the closing `---`.

### Section ordering within the MDX body

When multiple sections are present, use this order:

1. `## Constraints` — property limits, validation rules (only when relevant)
2. `## Common errors` — table with Error Code, HTTP Status, Cause columns, followed by a link to the full error guide
3. `## Related` — `<CardGroup>` with `<Card>` links to related endpoints

Not every page needs all sections. Only include what's relevant.
