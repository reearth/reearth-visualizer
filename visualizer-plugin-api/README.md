# @reearth/visualizer-plugin-api

TypeScript type definitions for the [Re:Earth Visualizer](https://github.com/reearth/reearth-visualizer) plugin API.

## Installation

```bash
npm install --save-dev @reearth/visualizer-plugin-api @reearth/core
# or
yarn add -D @reearth/visualizer-plugin-api @reearth/core
```

`@reearth/core` is a peer dependency. Install it alongside this package so TypeScript can resolve the layer and feature types used in the declarations.

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

This package follows its own semver, independent of the Re:Earth Visualizer release cycle.

The `reearthApiVersion` field in `package.json` records which Visualizer plugin API version
the types correspond to. When the API changes, a new version of this package is released
and `reearthApiVersion` is updated accordingly.

| Package version | Re:Earth plugin API version |
|-----------------|-----------------------------|
| 0.1.0           | 2.1.0                       |

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
2. Push a tag — the workflow triggers automatically:

```bash
git tag visualizer-plugin-api-v0.2.0
git push origin visualizer-plugin-api-v0.2.0
```

3. Approve the manual gate in the `npm-publish` environment on GitHub Actions.

## License

Apache-2.0
