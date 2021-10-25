export type GlobalThis = {
  Cesium?: Cesium;
  reearth: Reearth;
  console: {
    readonly log: (...args: any[]) => void;
    readonly error: (...args: any[]) => void;
  };
};

/** Most of the APIs related to Re:Earth are stored in this object. */
export type Reearth = {
  readonly version: string;
  readonly apiVersion: number;
  readonly visualizer: Visualizer;
  readonly ui: UI;
  readonly plugin: Plugin;
  readonly layers: Layers;
  readonly layer?: Layer;
  readonly widget?: Widget;
  readonly block?: Block;
  readonly on: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
  readonly off: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
  readonly once: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
};

export type ReearthEventType = {
  update: [];
  close: [];
  cameramove: [camera: CameraPosition];
  select: [layerId: string | undefined];
  message: [message: any];
};

/** Access to the metadata of this plugin and extension currently executed. */
export type Plugin = {
  readonly id: string;
  readonly extensionId: string;
  readonly extensionType: string;
  readonly property?: any;
};

/** You can operate and get data about layers. */
export type Layers = {
  readonly layers: Layer[];
  readonly selected?: Layer;
  readonly selectionReason?: string;
  readonly overriddenInfobox?: OverriddenInfobox;
  readonly overriddenProperties?: { [id: string]: any };
  /** Selects the layer with the specified ID; if the ID is undefined, the currently selected later will be deselected. */
  readonly select: (id?: string, options?: SelectLayerOptions) => void;
  readonly show: (...id: string[]) => void;
  readonly hide: (...id: string[]) => void;
  readonly findById: (id: string) => Layer | undefined;
  readonly findByIds: (...id: string[]) => (Layer | undefined)[];
  readonly find: (
    fn: (layer: Layer, index: number, parents: Layer[]) => boolean,
  ) => Layer | undefined;
  readonly findAll: (fn: (layer: Layer, index: number, parents: Layer[]) => boolean) => Layer[];
  readonly walk: <T>(
    fn: (layer: Layer, index: number, parents: Layer[]) => T | void,
  ) => T | undefined;
  readonly overrideProperty: (id: string, property: any) => void;
};

export type SelectLayerOptions = {
  reason?: string;
  overriddenInfobox?: OverriddenInfobox;
};

export type OverriddenInfobox = {
  title?: string;
  content: { key: string; value: string }[];
};

/** Layer is acutually displayed data on the map in which layers are flattened. All properties are stored with all dataset links, etc. resolved. */
export type Layer<P = any, IBP = any> = {
  id: string;
  type?: string;
  pluginId?: string;
  extensionId?: string;
  title?: string;
  property?: P;
  infobox?: Infobox<IBP>;
  isVisible?: boolean;
  propertyId?: string;
  readonly children?: Layer<P, IBP>[];
};

export type Infobox<BP = any> = {
  property?: InfoboxProperty;
  blocks?: Block<BP>[];
};

export type InfoboxProperty = {
  default?: {
    title?: string;
    size?: "small" | "large";
    typography?: Typography;
    bgcolor?: string;
  };
};

export type Block<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
};

export type Widget<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
  extended?: {
    horizontally: boolean;
    vertically: boolean;
  };
  layout?: WidgetLayout;
};

export type WidgetLayout = {
  location: WidgetLocation;
  align: WidgetAlignment;
};

export type WidgetLocation = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetAlignment = "start" | "centered" | "end";

/** The API for iframes, which is required not only for displaying the UI but also for calling the browser API. */
export type UI = {
  /**
   * Creates a new iframe to show any UI of the plugin or call the web browser API in a hidden way.
   *
   * ```js
   * reearth.ui.show(`<h1>Hello</h1>`);
   * ```
   *
   * How the UI is displayed depends on the type of extension when visible field is true in the options: in the case of widgets, it will be displayed in the place where it is placed on the screen, in the case of blocks, it will be displayed in the infobox field, but in the case of primitives, it will never actually be displayed.
   *
   * The iframe will be automatically resized according to the size of its contents.
   *
   * When `show` has been called again druing the iframe has been already shown, the iframe will be destroyed and then a new iframe will be recreated with the new html and options.
   */
  readonly show: (html: string, options?: { visible?: boolean }) => void;
  /**
   * Sends a message to the iframe's window shown by the show method. Sent data will be automatically encoded as JSON and restored in the iframe's window. So any object that cannot be serialized to JSON will be ignored.
   */
  readonly postMessage: (message: any) => void;
};

/** The API for the visualizer. This works regardless of the visualization engine you are using, which ensures the versatility of the plugin. It is recommended that you use this API whenever possible, and call the visualization engine's own low-layer API only when there is something you cannot do. */
export type Visualizer = {
  /** Current visualization engine type. Currently only "cesium" is available. */
  readonly engine: string;
  readonly camera: Camera;
  /** Current scene property */
  readonly property?: any;
};

export type Camera = {
  /** Current camera position */
  readonly position: CameraPosition | undefined;
  readonly zoomIn: (amount: number) => void;
  readonly zoomOut: (amount: number) => void;
  /** Moves the camera position to the specified destination. */
  readonly flyTo: (destination: FlyToDestination, options?: CameraOptions) => void;
  /** Moves the camera position to look at the specified destination. */
  readonly lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
};

/** Represents the camera position and state */
export type CameraPosition = {
  /** degrees */
  lat: number;
  /** degrees */
  lng: number;
  /** meters */
  height: number;
  /** radians */
  heading: number;
  /** radians */
  pitch: number;
  /** radians */
  roll: number;
  /** Field of view expressed in radians */
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

/**
 * Undefined fields are assumed to be the same as the current camera position.
 */
export type FlyToDestination = {
  /** degrees */
  lat?: number;
  /** degrees */
  lng?: number;
  /** meters */
  height?: number;
  /** radians */
  heading?: number;
  /** radians */
  pitch?: number;
  /** radians */
  roll?: number;
  /** Field of view expressed in radians */
  fov?: number;
};

/**
 * Undefined fields are assumed to be the same as the current camera position.
 */
export type LookAtDestination = {
  /** degrees */
  lat?: number;
  /** degrees */
  lng?: number;
  /** meters */
  height?: number;
  /** radians */
  heading?: number;
  /** radians */
  pitch?: number;
  /** radians */
  range?: number;
  /** Field of view expressed in radians */
  fov?: number;
};

export type CameraOptions = {
  /** Expressed in seconds. Default is zero. */
  duration?: number;
  /** Easing function. */
  easing?: (time: number) => number;
};

/** Cesium API: available only when the plugin is a primitive */
export type Cesium = {};
