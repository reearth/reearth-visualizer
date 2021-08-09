import type { Component } from "../../Primitive";

import Marker from "./Marker";
import Polyline from "./Polyline";
import Polygon from "./Polygon";
import Rect from "./Rect";
import Ellipsoid from "./Ellipsoid";
import PhotoOverlay from "./PhotoOverlay";
import Resource from "./Resource";

const builtin: Record<string, Component> = {
  "reearth/marker": Marker,
  "reearth/polyline": Polyline,
  "reearth/polygon": Polygon,
  "reearth/rect": Rect,
  "reearth/ellipsoid": Ellipsoid,
  "reearth/photooverlay": PhotoOverlay,
  "reearth/resource": Resource,
};

export default builtin;
