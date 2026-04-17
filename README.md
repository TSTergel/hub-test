# Mailmeteor Modules Hub

The public directory of modules for the Mailmeteor Chrome extension sidebar.
Each module is a folder under [`blocks/`](./blocks) containing metadata and an
icon. There is no executable code in this repo — module authors host their own
endpoints.

On every merge to `main`, a GitHub Action aggregates every module into
[`registry.json`](./registry.json), which the extension fetches at runtime.

## Submit a module

1. Copy [`blocks/example/`](./blocks/example) to `blocks/<your-module-id>/`.
2. Edit `manifest.json` to describe your module. The schema is at
   [`schema/manifest.schema.json`](./schema/manifest.schema.json) — your editor
   will autocomplete the fields via the `$schema` reference.
3. Replace `icon.svg` with your own icon.
4. Run `npm ci && npm run validate` locally — CI runs exactly the same check.
5. Open a PR. A maintainer reviews privacy and endpoint safety.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full flow and
[`SECURITY.md`](./SECURITY.md) for how to report a malicious module.

## What modules receive

When the sidebar loads in a supported context, the extension POSTs to your
`endpoint`:

```json
{
  "user": "john.doe@gmail.com",
  "context": "thread",
  "contacts": ["John @ SpaceX <john@spacex.com>"],
  "gmail": { "thread": "<thread-id>" }
}
```

Your endpoint must respond with JSON matching the sidebar render schema (block
types: `grid`, `list`, `actions`). See
[`blocks/example/README.md`](./blocks/example/README.md) for a worked example.

## Repository layout

```
blocks/<id>/          — one folder per module (manifest + icon)
schema/               — JSON Schema for manifests
scripts/              — build-registry.mjs (validates + emits registry.json)
registry.json         — generated artifact; committed by CI on every merge
.github/workflows/    — validate.yml (PRs) + build-registry.yml (main)
```

## Moderation

PR review is the moderation pipeline. A merged PR is a maintainer-vouched
module. There is no separate "verified" flag — if it's in `registry.json`, a
maintainer approved it.
