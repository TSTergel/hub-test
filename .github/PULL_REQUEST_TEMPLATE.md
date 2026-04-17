<!--
  Thanks for submitting! Fill this out honestly — reviewers check each box.
  Delete sections that don't apply (e.g. the "New module" section on a schema PR).
-->

## What kind of change is this?

- [ ] New module
- [ ] Update to an existing module (bump version in `manifest.json`)
- [ ] Tooling / schema / workflow change
- [ ] Docs only

## New module checklist

- [ ] I am the module author, or authorized by them.
- [ ] `endpoint` is served over HTTPS and responds in under 3 seconds.
- [ ] `privacy_url` points to a real, public privacy policy that covers the
      fields the extension sends (user email, contacts, thread id).
- [ ] I ran `npm ci && npm run validate` locally and it passed.

## Describe the module or change

<!-- What does it do? What problem does it solve? -->

## Notes for the reviewer

<!-- Anything unusual: non-obvious payload shape, rate limits, auth flow, etc. -->
