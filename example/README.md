# Example Module

A template module showing how to build a custom sidebar block. Copy this folder as a starting point for your own module.

## What it does

When a user opens a Gmail thread with this module installed, the Chrome extension will `POST` to the module's `endpoint` and render the returned JSON as a block in the sidebar.

This example renders a **grid** block showing mock contact details for a fictional "Jane Doe."

## Folder contents

| File | Purpose |
| --- | --- |
| `manifest.json` | Module metadata — name, description, endpoint URL, author, category, etc. Validated in CI against `/schema/manifest.schema.json`. |
| `preview.json` | A mock response conforming to the sidebar render schema. The hub uses this to show a live preview of the module without calling the real endpoint. |
| `icon.svg` | Module icon shown in the hub. SVG preferred; PNG also accepted (≥ 96×96, square). |
| `README.md` | This file. |

## How the endpoint is called

When the sidebar loads in a supported context, the extension makes a request:

```http
POST https://example.com/assistant
Authorization: <token>
Content-Type: application/json

{
  "user": "john.doe@gmail.com",
  "context": "thread",
  "contacts": ["John @ SpaceX <john@spacex.com>"],
  "gmail": { "thread": "<thread-id>" }
}
```

Fields:

- **`user`** — email of the connected Gmail user.
- **`context`** — one of `thread`, `home`, `list`, `search`. Only contexts listed in `supported_contexts` will be called.
- **`contacts`** — array of participant strings in `Name <email>` format.
- **`gmail.thread`** — Gmail thread ID (only present when `context` is `thread`).

## What the endpoint must return

A JSON object matching the sidebar render schema. At minimum:

```json
{
  "title": "Your module name",
  "blocks": [ /* one or more block objects */ ]
}
```

See `preview.json` for a complete working example and the main repo `README.md` for the full block schema reference (grid, list, actions).

### Block types supported

- **`grid`** — label + value pairs. Good for key facts (status, amount, date).
- **`list`** — items with icon, text, and optional meta. Good for sequences (recent events, upcoming meetings).
- **`actions`** — clickable action items. Good for quick operations.

### Signed-out / empty state

If the user isn't connected to your service yet, return a top-level `description` with a sign-in link and no `blocks`:

```json
{
  "title": "Example Module",
  "description": "[Sign in](https://example.com/auth) to view your data."
}
```

## Using this folder as a template

1. Copy the `modules/example/` folder to `modules/<your-module-id>/`.
2. Rename `id` in `manifest.json` to match the new folder name.
3. Update `name`, `description`, `endpoint`, `author`, `privacy_url`, and the rest.
4. Replace `icon.svg` with your own icon.
5. Update `preview.json` to reflect the shape of your real endpoint response.
6. Open a PR. CI will validate your `manifest.json` against the schema and render your `preview.json` in the PR preview.

## Requirements before submission

- [ ] `endpoint` is served over HTTPS.
- [ ] `privacy_url` points to a real, public privacy policy.
- [ ] `preview.json` reflects the actual shape your endpoint returns.
- [ ] The endpoint handles the documented request payload.
- [ ] The endpoint responds in under 3 seconds for a typical request.

## Questions

Open an issue in this repo or reach out at the `support_url` of a similar module.
