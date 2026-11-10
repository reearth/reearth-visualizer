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

This package follows [semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`, for example `2.1.1`. It only contains types, so a type change can show up in a plugin's build. The rules below are based on that.

| Part | Bump it when | Example |
|------|--------------|---------|
| `MAJOR` (the `2` in `2.1.1`) | A change that can break a plugin's build, such as removing, renaming or narrowing a type. This includes a bug fix that does so: for example, a plugin that used a field that was wrong and is now removed. Plugin authors may need to change their code. | `2.1.1` → `3.0.0` |
| `MINOR` (the `1` in `2.1.1`) | A bug fix, or any change that affects the types in this package, but only adds or widens something, such as a new API or a new optional field. Existing plugins keep compiling. | `2.1.1` → `2.2.0` |
| `PATCH` (the last `1` in `2.1.1`) | A small update with no effect on the types, such as docs, comments, `repository` metadata or a release-process check. | `2.1.1` → `2.1.2` |

A bug fix is `MINOR`, not `PATCH`, unlike many packages, because in a package that only has types a fix always changes the types. `PATCH` is only for changes that do not change the types.

Plugins that depend on `^2.1.1` pick up every `MINOR` and `PATCH` release automatically, so never ship a change that can break a build as one of those.

Every release needs a new version number, because npm never lets you publish the same version twice.

See [CHANGELOG.md](./CHANGELOG.md) for the full history.

## Source of truth

This package is the source of truth for the plugin API types. The Visualizer web app (`web/`) imports them from here, so almost all of them have no second copy to keep in sync.

Five types are still copied into this package, because the app's own versions depend on app internals:

- `WidgetLocation`, `WidgetAlignment` and `WidgetLayout`, from `web/src/app/features/Visualizer/Crust/Widgets/types.ts`
- `PluginInfoboxBlock`, from `web/src/app/features/Visualizer/Crust/Infobox/types.ts`
- `PluginStoryBlock`, from `web/src/app/features/Visualizer/Crust/StoryPanel/types.ts`
- `SceneMode` (inside `ViewerProperty`), from `web/src/app/types/sceneProperty.ts`

If you change one of them, change both sides. `web/src/app/features/Visualizer/Crust/Plugins/pluginAPI/types/compat.test.ts` checks that the app's types and the package's types are equal, and `yarn type` fails when they are not. It runs against the released package, so it only fails after `web/` is updated to the new version.

To change the API types:

1. Edit `visualizer-plugin-api/src`, bump the version in `package.json`, and update `CHANGELOG.md`.
2. Release the package (see below).
3. Update the `@reearth/visualizer-plugin-api` version in `web/package.json` and run `yarn install`.

To try a change in `web/` before releasing, build the package (`npm run build`) and point `web` at it with `yarn add @reearth/visualizer-plugin-api@portal:../visualizer-plugin-api`. Do not commit that; the web Dockerfile only builds from `web/`.

When `@reearth/core` is upgraded in `web/`, upgrade the pinned peer version here and release too.

## Releasing

Publishing uses [npm OIDC Trusted Publishing](https://docs.npmjs.com/generating-provenance-statements) — no `NPM_TOKEN` needed.

### One-time SRE setup

1. Create the `npm-publish` environment on this GitHub repo with a required reviewer (Settings → Environments → New environment). Restrict deployment branches to `main`.
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
