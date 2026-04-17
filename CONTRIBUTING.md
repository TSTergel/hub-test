# Contributing

Thanks for submitting a module. This registry is public and trusted by every
extension user. Expect a review that looks at privacy and endpoint safety, not just schema validity.

## Prerequisites

- Node 24 or later.
- Your module's endpoint is live, served over HTTPS, and handles the request
  shape documented in [`blocks/example/README.md`](./blocks/example/README.md).
- A public privacy policy URL that is already published, not a placeholder.

## Local workflow

```bash
git clone <your fork>
cd hub
npm ci
cp -r blocks/example blocks/<your-module-id>
# edit blocks/<your-module-id>/*
npm run validate
```

`npm run validate` runs the same checks CI runs: manifest schema, icon
existence, id-matches-folder, case-fold collision. Fix everything locally
before opening a PR.

## What the reviewer looks at

1. **Endpoint behavior.** Does a real POST with the documented payload return
   a well-formed block response? Is the response under 3s? Is HTTPS enforced?
2. **Privacy policy.** Is the URL reachable? Does the policy cover the fields
   the extension sends (user email, contacts, thread id)?
3. **Icon.** Square, legible at 32px, no trademarks you don't own.
4. **Metadata.** Is the description a one-sentence summary? Is the category
   correct?

## What fails CI automatically

- `manifest.json` missing required fields or violating the schema.
- `id` not matching the folder name.
- Icon file referenced by `manifest.icon` missing from the folder.
- `endpoint` or `privacy_url` not HTTPS.
- Case-insensitive duplicate of an existing folder.
- Unknown fields in `manifest.json` — the schema is closed. If a legitimate
  new field is needed, open a tooling issue first.

## Version bumps

`version` is strict semver. Bump it whenever the manifest or endpoint behavior
changes. Patch for fixes, minor for new supported contexts, major for
breaking payload changes.

## Removals and takedowns

To retire your own module, open a PR deleting its folder. If you believe a
module is misusing user data, see [`SECURITY.md`](./SECURITY.md) — do not open
a public issue with sensitive details.
