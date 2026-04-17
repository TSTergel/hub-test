# Security policy

## Reporting a vulnerability or a malicious module

Do not open a public issue. Email **security@mailmeteor.com** with:

- The module id (folder name under `blocks/`) or the affected part of this
  repo.
- A description of the issue. For malicious-module reports, include the
  behavior you observed and, if possible, a captured request/response.
- Your contact info and timezone.

We acknowledge reports within 2 business days and aim to triage within 5
business days.

## Takedown process

When a module is confirmed to be violating user privacy, exfiltrating beyond
its stated purpose, or serving malware:

1. The module's folder is removed from `blocks/` in a maintainer-signed commit
   within 24 hours of confirmation.
2. The id is added to a denylist so the same slug cannot be re-registered by a
   different author.
3. Extension users with the module installed receive a notification on next
   sidebar load that the module was removed and why.

## Scope

In scope:

- The validation and build scripts in [`scripts/`](./scripts).
- The GitHub Actions workflows in [`.github/workflows/`](./.github/workflows).
- The JSON schemas in [`schema/`](./schema).
- Modules listed in `blocks/` (we handle the report, coordinate with the
  author if appropriate, and remove the module if warranted).

Out of scope:

- The Chrome extension itself — report those at the extension's own security
  address.
- Third-party endpoints operated by module authors — we will forward the
  report and, if relevant, remove the module from the registry.
