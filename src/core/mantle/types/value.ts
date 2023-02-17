export type LatLng = {
  lat: number;
  lng: number;
};

export type LatLngHeight = {
  lat: number;
  lng: number;
  height: number;
};

export type Camera = {
  lat: number;
  lng: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
  fov: number;
};

export type Typography = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify" | "justify_all";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type Coordinates = LatLngHeight[];

export type Polygon = LatLngHeight[][];

export type Rect = {
  west: number;
  south: number;
  east: number;
  north: number;
};

// Ideal for plugin developers, but it's hard to implement it with Cesium
export type Plane = {
  location: LatLngHeight;
  width: number;
  height: number;
  length: number;
  heading: number;
  pitch: number;
};

// Familiar with Cesium
export type EXPERIMENTAL_clipping = {
  planes?: {
    normal: {
      x: number;
      y: number;
      z: number;
    };
    distance: number;
  }[];
  visible?: boolean;
  // for compat
  location?: LatLngHeight;
  coordinates?: number[];
  /**
   * x-axis
   */
  width?: number;
  /**
   * y-axis
   */
  length?: number;
  /**
   * z-axis
   */
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  direction?: "inside" | "outside";
};

// Don't forget adding a new field to valueTypeMapper also!
export type ValueTypes = {
  string: string;
  number: number;
  bool: boolean;
  latlng: LatLng;
  latlngheight: LatLngHeight;
  url: string;
  camera: Camera;
  typography: Typography;
  coordinates: Coordinates;
  polygon: Polygon;
  rect: Rect;
  ref: string;
  tiletype: string;
};

export type ValueType = keyof ValueTypes;
