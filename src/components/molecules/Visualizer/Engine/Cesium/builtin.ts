import type { Component } from "../../Primitive";

import Box from "./Box";
import Ellipsoid from "./Ellipsoid";
import Marker from "./Marker";
import Model from "./Model";
import PhotoOverlay from "./PhotoOverlay";
import Polygon from "./Polygon";
import Polyline from "./Polyline";
import Rect from "./Rect";
import Resource from "./Resource";
import Tileset from "./Tileset";

const builtin: Record<string, Component> = {
  "reearth/marker": Marker,
  "reearth/polyline": Polyline,
  "reearth/polygon": Polygon,
  "reearth/rect": Rect,
  "reearth/ellipsoid": Ellipsoid,
  "reearth/box": Box,
  "reearth/photooverlay": PhotoOverlay,
  "reearth/resource": Resource,
  "reearth/model": Model,
  "reearth/tileset": Tileset,
};

export default builtin;
