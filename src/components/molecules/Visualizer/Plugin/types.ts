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
  /** Current visualization engine type. Currently only "cesium" is available. */
  readonly engineName: string;
  readonly camera: Camera;
  readonly clock?: Clock;
  readonly ui: UI;
  readonly modal: Modal;
  readonly popup: Popup;
  readonly plugin: Plugin;
  readonly plugins: Plugins;
  readonly layers: Layers;
  readonly layer?: Layer;
  readonly widget?: Widget;
  readonly block?: Block;
  readonly scene: Scene;
  readonly viewport: Viewport;
  readonly clientStorage: ClientStorage;
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

export type MouseEvent = {
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
  height?: number;
  layerId?: string;
  delta?: number;
};

export type LayerEditEvent = {
  layerId: string | undefined;
  scale?: { width: number; length: number; height: number; location: LatLngHeight };
  rotate?: { heading: number; pitch: number; roll: number };
};

export type PluginMessage = {
  data: any;
  sender: string;
};

export type ReearthEventType = {
  update: [];
  close: [];
  cameramove: [camera: CameraPosition];
  layeredit: [e: LayerEditEvent];
  select: [layerId: string | undefined];
  message: [message: any];
  click: [props: MouseEvent];
  doubleclick: [props: MouseEvent];
  mousedown: [props: MouseEvent];
  mouseup: [props: MouseEvent];
  rightclick: [props: MouseEvent];
  rightdown: [props: MouseEvent];
  rightup: [props: MouseEvent];
  middleclick: [props: MouseEvent];
  middledown: [props: MouseEvent];
  middleup: [props: MouseEvent];
  mousemove: [props: MouseEvent];
  mouseenter: [props: MouseEvent];
  mouseleave: [props: MouseEvent];
  wheel: [props: MouseEvent];
  tick: [props: Date];
  resize: [props: ViewportSize];
  modalclose: [];
  popupclose: [];
  pluginmessage: [props: PluginMessage];
};

/** Access to the metadata of this plugin and extension currently executed. */
export type Plugin = {
  readonly id: string;
  readonly extensionId: string;
  readonly extensionType: string;
  readonly property?: any;
};

export type PluginExtensionInstance = {
  readonly id: string;
  readonly pluginId: string;
  readonly name: string;
  readonly extensionId: string;
  readonly extensionType: "widget" | "block";
  readonly runTimes: number | undefined; // Count number of plugin is run
};

export type Plugins = {
  readonly instances: PluginExtensionInstance[];
  readonly postMessage?: (id: string, message: any) => void;
};

export type LatLngHeight = {
  lat: number;
  lng: number;
  height: number;
};

export type Scene = {
  /** Current scene property */
  readonly inEditor: boolean;
  readonly property?: any;
  readonly overrideProperty: (property: any) => void;
  readonly captureScreen: (type?: string, encoderOptions?: number) => string | undefined;
  readonly getLocationFromScreen: (
    x: number,
    y: number,
    withTerrain?: boolean,
  ) => LatLngHeight | undefined;
};

/** You can operate and get data about layers. */
export type Layers = {
  readonly layers: Layer[];
  readonly selected?: Layer;
  readonly tags?: Tag[];
  readonly selectionReason?: string;
  readonly overriddenInfobox?: OverriddenInfobox;
  readonly overriddenProperties?: { [id: string]: any };
  /** Selects the layer with the specified ID; if the ID is undefined, the currently selected later will be deselected. */
  readonly layersInViewport: Layer[];
  readonly select: (id?: string, options?: SelectLayerOptions) => void;
  readonly show: (...id: string[]) => void;
  readonly hide: (...id: string[]) => void;
  readonly findById: (id: string) => Layer | undefined;
  readonly findByIds: (...id: string[]) => (Layer | undefined)[];
  readonly findByTags: (...tagIds: string[]) => Layer[];
  readonly findByTagLabels: (...tagLabels: string[]) => Layer[];
  readonly find: (
    fn: (layer: Layer, index: number, parents: Layer[]) => boolean,
  ) => Layer | undefined;
  readonly findAll: (fn: (layer: Layer, index: number, parents: Layer[]) => boolean) => Layer[];
  readonly walk: <T>(
    fn: (layer: Layer, index: number, parents: Layer[]) => T | void,
  ) => T | undefined;
  readonly isLayer: (obj: any) => obj is Layer;
  readonly overrideProperty: (id: string, property: any) => void;
  readonly add: (layer: Layer, parentId?: string, creator?: string) => string | undefined;
};

export type SelectLayerOptions = {
  reason?: string;
  overriddenInfobox?: OverriddenInfobox;
};

export type OverriddenInfobox = {
  title?: string;
  content:
    | {
        type: "table";
        value: { key: string; value: string }[];
      }
    | { type: "html"; value: string };
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
  tags?: Tag[];
  readonly children?: Layer<P, IBP>[];
  creator?: string;
};

export type Tag = {
  id: string;
  label: string;
  tags?: Tag[];
};

export type Infobox<BP = any> = {
  property?: InfoboxProperty;
  blocks?: Block<BP>[];
};

export type InfoboxProperty = {
  default?: {
    showTitle?: boolean;
    title?: string;
    height?: number;
    heightType?: "auto" | "manual";
    infoboxPaddingTop?: number;
    infoboxPaddingBottom?: number;
    infoboxPaddingLeft?: number;
    infoboxPaddingRight?: number;
    size?: "small" | "medium" | "large";
    position?: "right" | "middle" | "left";
    typography?: Typography;
    bgcolor?: string;
    outlineColor?: string;
    outlineWidth?: number;
    useMask?: boolean;
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
  moveTo?: (options: WidgetLocationOptions) => void;
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

export type WidgetLocationOptions = WidgetLocation & {
  method?: "insert" | "append";
};

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
  readonly show: (
    html: string,
    options?: {
      /** If true, display a iframe. Otherwise, hide the iframe and plugin works like headless mdoe. Default value is true. */
      visible?: boolean;
      /** Initial iframe width of the widget. If not specified, the iframe will be automatically resized. If a number is specified, it will be treated as pixels. This option is only available for widgets that are not horizontally extended. */
      width?: number | string;
      /** Initial iframe height of the widget. If not specified, the iframe will be automatically resized. If a number is specified, it will be treated as pixels. This option is only available for widgets that are not vertically extended. */
      height?: number | string;
      /** Override whether the iframe is extended. This option is only available for widgets on an extendable area on the widget align system. */
      extended?: boolean;
    },
  ) => void;
  /**
   * Sends a message to the iframe's window shown by the show method. Sent data will be automatically encoded as JSON and restored in the iframe's window. So any object that cannot be serialized to JSON will be ignored.
   */
  readonly postMessage: (message: any) => void;
  /**
   * Resize the iframe by the plugin. If width or height is undefined, it will be auto-resized. If a number is specified, it will be treated as pixels.
   *
   * If plugins try to resize the iframe by specifying size in the iframe's internal HTML, for example, in the body style, or by updating the CSS, iframe will not actually be resized. In that case, plugins need to call this method explicitly to resize the iframe.
   */
  readonly resize: (
    /** Width of the iframe of the widget. This field is only available for widgets that are not horizontally extended. */
    width: string | number | undefined,
    /** Height of the iframe of the widget. This field is only available for widgets that are not vertically extended. */
    height: string | number | undefined,
    /** Overrides whether the iframe is extended. This option is only available for widgets on an extendable area on the widget align system. */
    extended?: boolean | undefined,
  ) => void;
  readonly close: () => void;
};

export type Modal = {
  readonly show: (
    html: string,
    options?: {
      width?: number | string;
      height?: number | string;
      background?: string;
    },
  ) => void;
  readonly postMessage: (message: any) => void;
  readonly update: (options: {
    width?: number | string;
    height?: number | string;
    background?: string;
  }) => void;
  readonly close: () => void;
};

export type PopupPosition =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

export type PopupOffset =
  | number
  | {
      mainAxis?: number;
      crossAxis?: number;
      alignmentAxis?: number | null;
    };

export type Popup = {
  readonly show: (
    html: string,
    options?: {
      width?: number | string;
      height?: number | string;
      position?: PopupPosition;
      offset?: PopupOffset;
    },
  ) => void;
  readonly postMessage: (message: any) => void;
  readonly update: (options: {
    width?: number | string;
    height?: number | string;
    position?: PopupPosition;
    offset?: PopupOffset;
  }) => void;
  readonly close: () => void;
};

/** Deprecated. */
export type Visualizer = {
  /** use `reearth.engine` instead. */
  readonly engine: string;
  /** use `reearth.camera` instead. */
  readonly camera: Camera;
  /** use `reearth.scene.property` instead. */
  readonly property?: any;
  /** use `reearth.scene.overrideProperty` instead. */
  readonly overrideProperty: (property: any) => void;
};

export type ViewportSize = {
  readonly width: number;
  readonly height: number;
  readonly isMobile: boolean;
};

export type Viewport = ViewportSize & {
  readonly query: Record<string, string>;
};

type Rect = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type Camera = {
  /** Current camera position */
  readonly position: CameraPosition | undefined;
  readonly viewport: Rect | undefined;
  readonly zoomIn: (amount: number, options?: CameraOptions) => void;
  readonly zoomOut: (amount: number, options?: CameraOptions) => void;
  /** Moves the camera position to the specified destination. */
  readonly flyTo: (destination: FlyToDestination, options?: CameraOptions) => void;
  /** Moves the camera position to look at the specified destination. */
  readonly lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
  /** Rotate the camera around the center of earth. */
  readonly rotateRight: (radian: number) => void;
  /** Move the angle of camera around the center of earth. */
  readonly orbit: (radian: number) => void;
  readonly enableScreenSpaceController: (enabled: boolean) => void;
  readonly lookHorizontal: (amount: number) => void;
  readonly lookVertical: (amount: number) => void;
  readonly moveForward: (amount: number) => void;
  readonly moveBackward: (amount: number) => void;
  readonly moveUp: (amount: number) => void;
  readonly moveDown: (amount: number) => void;
  readonly moveLeft: (amount: number) => void;
  readonly moveRight: (amount: number) => void;
  readonly moveOverTerrain: (offset?: number) => void;
  readonly flyToGround: (
    destination: FlyToDestination,
    options?: CameraOptions,
    offset?: number,
  ) => void;
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
  animation?: boolean;
};

/** Cesium API: available only when the plugin is a primitive */
export type Cesium = {};

export type Clock = {
  startTime: Date;
  stopTime: Date;
  currentTime: Date;
  playing: boolean;
  paused: boolean;
  /** Speed of time. Specifies a multiplier for the speed of time in reality. Default is 1. */
  speed: number;
  readonly tick: () => Date;
  readonly play: () => void;
  readonly pause: () => void;
};

export type ClientStorage = {
  readonly getAsync: (key: string) => Promise<any>;
  readonly setAsync: (key: string, value: any) => Promise<void>;
  readonly deleteAsync: (key: string) => Promise<void>;
  readonly keysAsync: () => Promise<string[]>;
};
