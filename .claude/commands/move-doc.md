---
description: Move or rename an MDX doc page, updating docs.json navigation and adding a redirect so old URLs don't 404
---

Move/rename a documentation page safely. Arguments: `$ARGUMENTS` (source path and destination path — ask me if either is unclear).

Do ALL of these, in order — skipping any one breaks live URLs or the build:

1. **Move the file** — `git mv <old>.mdx <new>.mdx` (preserves history).
2. **Update navigation** — find the old page path (without `.mdx`) in `docs.json` under `navigation.products[].tabs[]…groups…pages` and replace it with the new path. Edit surgically; never read `docs.json` whole — locate the line with `grep -n` / python.
3. **Add a redirect** — append `{ "source": "/<old-path>", "destination": "/<new-path>" }` (paths without extension, leading slash) to the `redirects` array in `docs.json`. Check no conflicting redirect already exists for that source.
4. **Fix inbound links** — `grep -rn "/<old-path>" --include=*.mdx .` and update any pages that linked to the old path.
5. **Verify** — run `npx mint broken-links` and report the result.

Report what changed: file move, nav edit location, redirect added, and how many inbound links were updated. Do NOT commit unless asked.
