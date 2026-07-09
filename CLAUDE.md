# CometChat Documentation

This is the source for [CometChat's documentation](https://www.cometchat.com/docs), built with **Mintlify**. It is a content repo (MDX + OpenAPI JSON), not an application codebase.

## Stack & layout

- **Mintlify** site configured by [docs.json](docs.json) — navigation, theme, OpenAPI specs, and redirects all live here. Edit it when adding/moving pages.
- Pages are `.mdx` files. OpenAPI references are the large `*.json` files at root (`chat-apis.json`, `management-apis.json`, `calls.json`, etc.), registered under `openapi` in [docs.json](docs.json).
- Shared snippets live in [snippets/](snippets/); images in [images/](images/); reusable assets in [assets/](assets/).

Main content sections (each a top-level dir): `fundamentals/`, `ui-kit/`, `sdk/`, `rest-api/`, `ai-agents/`, `ai-chatbots/`, `moderation/`, `notifications/`, `widget/`, `calls/`, `campaigns/`, `articles/`.

## Local preview

```bash
npm i -g mint   # one-time
mint dev        # run at repo root (where docs.json is)
```

If `mint dev` misbehaves: `npm i -g mint@latest`. A 404 usually means you're not in the folder containing `docs.json`.

## MDX conventions

- Every page starts with YAML frontmatter (`title`, `description`, optionally `mode`, `canonical`).
- Components are Mintlify/MDX (`<Columns>`, `<Card>`, etc.) with JSX-style `className` and inline `style={{}}`.
- Formatting follows [.prettierrc](.prettierrc): 2-space indent, LF line endings, double quotes, no trailing commas.
- When you add or rename a page, update its entry in [docs.json](docs.json) `navigation` or it won't appear.

## Contributing

- Branch naming follows [.github/branch-naming-convention.md](.github/branch-naming-convention.md). For docs changes use `docs/<description>` (e.g. `docs/react-ui-kit`).
- See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.
- Commit messages in history use Conventional Commits, often scoped, e.g. `docs(ui-kit/react): ...`.

## Working notes

- This repo has no real build/test suite — validation is previewing with `mint dev` and checking links/navigation render.
- Prefer editing existing pages and `docs.json` over creating parallel structures. Keep prose consistent with neighboring pages in the same section.
