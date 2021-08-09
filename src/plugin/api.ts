export type globalThis = {
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
  readonly plugin: Plugin;
  readonly primitives: Primitives;
  readonly ui: UI;
  readonly visualizer: Visualizer;
  readonly primitive?: Primitive;
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
  onupdate?: () => void;
};

export type ReearthEventType = {
  update: [];
  close: [];
  cameramove: [camera: Camera];
  select: [target?: Primitive];
  message: [message: any];
};

/** Access to the metadata of this plugin and extension currently executed. */
export type Plugin = {
  readonly id: string;
  readonly extensionId: string;
  readonly extensionType: string;
  readonly property?: any;
};

/** You can operate and get data about primitives. */
export type Primitives = {
  readonly primitives: Primitive[];
  readonly selected?: Primitive;
  readonly selectionReason?: string;
  /** Selects the primitive with the specified ID; if the ID is undefined, the currently selected primitive will be deselected. */
  readonly select: (id?: string, options?: { reason?: string }) => void;
  readonly show: (...id: string[]) => void;
  readonly hide: (...id: string[]) => void;
};

/** Primitive is acutually displayed data on the map in which layers are flattened. All properties are stored with all dataset links, etc. resolved. */
export type Primitive = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  title?: string;
  property?: any;
  infobox?: Infobox;
  isVisible?: boolean;
};

export type Infobox = {
  property?: any;
  blocks?: Block[];
};

export type Block = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: any;
};

export type Widget = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: any;
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
  /** Current camera position and state. */
  readonly camera: Camera | undefined;
  /** Current scene property */
  readonly property?: any;
  readonly zoomIn: (amount: number) => void;
  readonly zoomOut: (amount: number) => void;
  /** Moves the camera position to the specified destination. */
  readonly flyTo: (destination: FlyToDestination, options?: CameraOptions) => void;
  /** Moves the camera position to look at the specified destination. */
  readonly lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
};

/** Represents the camera position and state */
export type Camera = {
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
  /** Expressed in milliseconds. Default is zero. */
  duration?: number;
  /** Easing function. */
  easing?: (time: number) => number;
};
