import { PrimitiveComponent } from "../../PluginPrimitive";

import Marker from "./marker";
import Polyline from "./polyline";
import Polygon from "./polygon";
import Rect from "./rect";
import Ellipsoid from "./ellipsoid";
import PhotoOverlay from "./photooverlay";
import Resource from "./resource";

export default {
  marker: Marker,
  polyline: Polyline,
  polygon: Polygon,
  rect: Rect,
  ellipsoid: Ellipsoid,
  photooverlay: PhotoOverlay,
  resource: Resource,
} as { [key: string]: PrimitiveComponent };
