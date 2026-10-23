// Compiled by scripts/consumer-test.mjs against the packed package, the way a
// plugin project would use it. Every `@ts-expect-error` must be an error: if the
// types silently became `any` (for example an unresolved import), they would
// stop being errors and the build would fail.
import type {
  Camera,
  CameraPosition,
  Layers,
  Reearth,
  Viewer
} from "@reearth/visualizer-plugin-api";

declare const reearth: Reearth;

// root
const version: string = reearth.version;
const apiVersion: string = reearth.apiVersion;
const engineName: string = reearth.engine.name;
void [version, apiVersion, engineName];

// camera
const position: CameraPosition | undefined = reearth.camera.position;
reearth.camera.flyTo("layer-id", { duration: 1 });
reearth.camera.flyTo({ lat: 35, lng: 139, height: 1000 });
reearth.camera.flyToBoundingBox({ west: 0, south: 0, east: 1, north: 1 });
reearth.camera.on("move", (p: CameraPosition) => void p);
void position;
// @ts-expect-error destination must be a layer id or a camera position
reearth.camera.flyTo(42);
// @ts-expect-error the camera is read-only
reearth.camera = {} as Camera;

// layers
const id: string | undefined = reearth.layers.add({
  type: "simple",
  data: { type: "geojson", url: "https://example.com/a.geojson" }
});
reearth.layers.show("a", "b");
reearth.layers.hide("a");
reearth.layers.on("select", (layerId, featureId) => {
  const l: string | undefined = layerId;
  const f: string | undefined = featureId;
  void [l, f];
});
void id;
// @ts-expect-error show takes layer ids
reearth.layers.show(1);
// @ts-expect-error not an event of layers
reearth.layers.on("nope", () => {});
const layers: Layers = reearth.layers;
void layers;

// viewer
const viewer: Viewer = reearth.viewer;
void viewer.viewport;
// Mouse events carry the engine's position payload, not a DOM MouseEvent.
reearth.viewer.on("click", (e) => {
  const lat: number | undefined = e.lat;
  const layerId: string | undefined = e.layerId;
  void [lat, layerId];
  // @ts-expect-error not a DOM MouseEvent
  void e.clientX;
});
reearth.viewer.on("wheel", (e) => void e.delta);
// The viewer property is typed, so values read from it complete and validate.
const lightType = reearth.viewer.property?.scene?.light?.type;
void lightType;
reearth.viewer.overrideProperty({ scene: { mode: "3d" } });
// @ts-expect-error only "3d" is a scene mode
reearth.viewer.overrideProperty({ scene: { mode: "2d" } });
// @ts-expect-error unknown property group
reearth.viewer.overrideProperty({ nope: 1 });

// timeline
reearth.timeline.on("tick", (t: Date) => void t);
reearth.timeline.play?.();
reearth.timeline.setSpeed?.(2);
// @ts-expect-error speed is a number
reearth.timeline.setSpeed?.("fast");

// ui, modal, popup
reearth.ui.show("<p>hi</p>", { width: 300, extended: true });
reearth.ui.postMessage({ any: "thing" });
reearth.ui.on("close", () => {});
reearth.modal.show("<p>hi</p>");
reearth.modal.close();
reearth.popup.show("<p>hi</p>");
reearth.popup.close();
// @ts-expect-error html must be a string
reearth.ui.show(123);

// extension: messages are `unknown`, so they have to be narrowed
reearth.extension.on("message", (msg) => {
  // @ts-expect-error `msg` is unknown until narrowed
  void msg.action;
  if (typeof msg === "object" && msg !== null && "action" in msg) {
    void (msg as { action: string }).action;
  }
});
reearth.extension.on("extensionMessage", (e) => {
  const sender: string = e.sender;
  void sender;
});
reearth.extension.postMessage?.("other-extension", { hello: 1 });
void reearth.extension.widget?.layout;
void reearth.extension.list;

// data
void reearth.data.clientStorage.getAsync("key").then((v: unknown) => v);
void reearth.data.clientStorage.setAsync("key", 1);

// sketch, spatialId
void reearth.sketch.on;
void reearth.spatialId.on;
