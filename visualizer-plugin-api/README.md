# @reearth/visualizer-plugin-api

TypeScript type definitions for the [Re:Earth Visualizer](https://github.com/reearth/reearth-visualizer) plugin API.

## Installation

```bash
npm install --save-dev @reearth/visualizer-plugin-api @reearth/core@0.0.7-alpha.81
# or
yarn add -D @reearth/visualizer-plugin-api @reearth/core@0.0.7-alpha.81
```

`@reearth/core` is a peer dependency, pinned to the version the Visualizer runs (`0.0.7-alpha.81`). Install that exact version, not `latest`, so the types match the Visualizer. Install it alongside this package so TypeScript can resolve the layer and feature types used in the declarations.

Note: `@reearth/core` brings React and Cesium with it (about 350 packages), only for the type imports.

## Usage

Create a `reearth.d.ts` file in your plugin project:

```typescript
import type { Reearth } from "@reearth/visualizer-plugin-api";

declare global {
  const reearth: Reearth;
}
```

Then use `reearth` with full TypeScript IntelliSense:

```typescript
reearth.camera.flyTo({ lat: 35.68, lng: 139.76, height: 1000 });
reearth.layers.show("layer-id");
reearth.ui.show("<h1>Hello from plugin</h1>");
reearth.camera.on("move", (pos) => console.log(pos.lat, pos.lng));
```

## API Overview

| Namespace | Description |
|-----------|-------------|
| `reearth.camera` | Camera control: flyTo, lookAt, zoom, rotate, events |
| `reearth.layers` | Layer management: add, delete, find, select, override |
| `reearth.viewer` | Viewport, tools, coordinate conversion, interaction mode |
| `reearth.timeline` | Playback control: play, pause, setTime, setSpeed |
| `reearth.sketch` | Drawing tools: marker, polyline, polygon, rectangle |
| `reearth.ui` | Plugin panel: show HTML, postMessage, resize |
| `reearth.modal` | Modal dialog: show, update, close |
| `reearth.popup` | Popup: show, update, position, close |
| `reearth.extension` | Inter-plugin messaging, widget/block context |
| `reearth.data` | Client-side persistent storage |
| `reearth.spatialId` | PLATEAU spatial ID picking |
| `reearth.engine` | Rendering engine metadata |

## TypeScript configuration

Add `"skipLibCheck": true` to your `tsconfig.json`. This package depends on `@reearth/core`,
which references React and Cesium types internally. Without `skipLibCheck`, those transitive
declarations cause errors in projects that do not install React or Cesium types directly.

## Versioning

This package version tracks the Re:Earth plugin API version directly.
`@reearth/visualizer-plugin-api@2.1.0` corresponds to plugin API version 2.1.0.
When the plugin API version bumps, a new version of this package is released with the same version number.

See [CHANGELOG.md](./CHANGELOG.md) for the full history.

## Releasing

Publishing uses [npm OIDC Trusted Publishing](https://docs.npmjs.com/generating-provenance-statements) — no `NPM_TOKEN` needed.

### One-time SRE setup

1. Create the `npm-publish` environment on this GitHub repo with a required reviewer (Settings → Environments → New environment). Restrict deployment refs to tags matching `visualizer-plugin-api-v*`.
2. Configure OIDC Trusted Publishing on npmjs.com for `@reearth/visualizer-plugin-api`:
   - Repository: `reearth/reearth-visualizer`
   - Workflow filename: `plugin_api_release.yml`
   - Environment: `npm-publish`

### First publish (manual — one time only)

The package name must be claimed on the registry before Trusted Publishing can take over:

```bash
cd visualizer-plugin-api
npm publish --access public
```

### Subsequent releases

1. Bump the version in `visualizer-plugin-api/package.json` and update `CHANGELOG.md`.
2. Go to GitHub Actions → **Publish @reearth/visualizer-plugin-api** → **Run workflow**.
3. Enter the version number (must match `package.json`) and confirm.
4. Approve the manual gate in the `npm-publish` environment.

## License

Apache-2.0
