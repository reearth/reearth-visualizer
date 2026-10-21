# Plugin API Release Workflow — Review Notes

This PR adds the GitHub Actions workflow that publishes
`@reearth/visualizer-plugin-api` to npm.

The actual package source (TypeScript type definitions) lives in a
**separate PR**: `feat/visualizer-plugin-api-types`.
Merge order does not matter — the workflow only runs on a tag push.

---

## What this workflow does

Triggered by a tag matching `visualizer-plugin-api-v*`.

1. Verifies the tag version matches `package.json` version (fails fast if not).
2. Runs `npm ci` and `npm publish --provenance` using OIDC Trusted Publishing
   (no `NPM_TOKEN` stored as a secret).
3. Requires a manual approval gate (`npm-publish` environment) before the
   publish step runs.

## Before this workflow can run — SRE setup required

- [ ] Create the `npm-publish` environment on the GitHub repo with a required
      reviewer (Settings → Environments → New environment).
- [ ] Configure OIDC Trusted Publishing on npmjs.com for
      `@reearth/visualizer-plugin-api`:
      - Repository: `reearth/reearth-visualizer`
      - Workflow filename: `plugin_api_release.yml`
      - Environment: `npm-publish`
- [ ] The first publish must be done **manually** (`npm publish` from local) to
      claim the package name on the registry before Trusted Publishing works.

## First release steps (after both PRs are merged)

```bash
# In visualizer-plugin-api/
npm publish   # first-time manual publish to claim the package name

# After SRE setup is complete, subsequent releases via tag:
git tag visualizer-plugin-api-v0.1.0
git push origin visualizer-plugin-api-v0.1.0
```
