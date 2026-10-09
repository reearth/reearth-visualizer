# @reearth/visualizer-plugin-api

TypeScript type definitions for the [Re:Earth Visualizer](https://github.com/reearth/reearth-visualizer) plugin API.

## Installation

```bash
npm install --save-dev @reearth/visualizer-plugin-api
# or
yarn add -D @reearth/visualizer-plugin-api
```

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

## Versioning

This package is independently versioned. When the Re:Earth Visualizer plugin API changes,
a new version of this package will be released. See [CHANGELOG.md](./CHANGELOG.md).

## License

Apache-2.0
