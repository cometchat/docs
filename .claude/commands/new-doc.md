---
description: Scaffold a new MDX doc page with correct frontmatter and wire it into docs.json navigation
---

Create a new documentation page. Arguments: `$ARGUMENTS` (the page path and/or title — ask me if unclear).

Steps:
1. Confirm the target file path under the right product dir (`ui-kit/`, `sdk/`, `rest-api/`, `calls/`, `fundamentals/`, etc.) and the page title.
2. Look at 1–2 sibling pages in the same directory to match their structure and tone — do NOT read more than needed.
3. Create the `.mdx` file with frontmatter containing only quoted `title` and `description` (description = one SEO-friendly sentence).
4. Add the page path (no extension) to `docs.json` under the correct `navigation.products[].tabs[]…groups…pages` array. Edit docs.json surgically — never read it whole; use python/grep to locate the right insertion point.
5. Report the file path and exactly where in the nav it was added. Do NOT commit unless asked.
