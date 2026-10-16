# Docs MCP implementation bundles

Each `<name>.md` file here is an implementation bundle: a short, copyable recipe the
[CometChat Docs MCP server](https://www.cometchat.com/docs/mcp-server) returns from
`get_cometchat_implementation_bundle` and lists in `list_cometchat_bundles`. AI coding
agents paste this code into customer apps, so it must work on the **latest** kit.

- **How they reach the server:** the server's search index is built from this repo's
  `main` branch, and the build stores these files in it. A merged change is served
  within about 10 minutes. The MCP server doesn't need a redeploy.
- **Not on the docs site:** `.mintignore` keeps this folder out of the Mintlify build.
- **Bundle names:** the file name is the bundle name (lowercase kebab-case). Renaming a
  file breaks agents that ask for the old name, so add a new bundle rather than rename one.

## Format

```markdown
---
title: React UI Kit Quickstart
framework: react
prerequisites:
  - "Node.js 18+"
  - "CometChat App ID, Auth Key, and Region from app.cometchat.com"
last_verified: "2026-10-16"
packages:
  - registry: npm                      # npm | pub | maven | github
    name: "@cometchat/chat-uikit-react"  # maven: "group:artifact"; github: "owner/repo" (tags)
    version: "7.2.4"
---

# React UI Kit Quickstart
…
```

`packages` lists every CometChat package the bundle installs. Use `packages: []` when
it installs nothing versioned.

## The check

`.github/scripts/check-mcp-bundles.mjs` runs on every PR that touches this folder and
every Monday. A scheduled failure opens an issue titled "MCP bundles are out of date".
It fails a bundle when:

- a declared package is behind the latest release in its major version
- a version in the body differs from the declared one, or the body pins a CometChat
  package that `packages` does not declare
- a code block uses something in [`removed-apis.json`](removed-apis.json)
- `last_verified` is more than 90 days old
- a `cometchat.com/docs` link does not resolve

A new major version is a warning, not a failure, because moving a bundle to a new major
means rewriting it.

Run it locally with `node .github/scripts/check-mcp-bundles.mjs`. Add `--offline` to skip
the registry and link checks.

## Updating a bundle

1. Install the latest kit in a scratch project and run the bundle's code on it.
2. Update the versions in `packages` and in the body.
3. Set `last_verified` to today.
4. When a kit release removes or renames an API, add it to `removed-apis.json`. The check
   then also catches it in future edits.
