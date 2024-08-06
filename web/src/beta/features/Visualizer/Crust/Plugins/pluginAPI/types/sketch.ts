import { LayerAppearanceTypes, SketchFeature } from "@reearth/core";

export declare type SketchAppearance = Partial<LayerAppearanceTypes>;
export declare type SketchEventProps = {
  layerId?: string;
  featureId?: string;
  feature?: SketchFeature;
};

export declare type SketchType =
  | "marker"
  | "polyline"
  | "circle"
  | "rectangle"
  | "polygon"
  | "extrudedCircle"
  | "extrudedRectangle"
  | "extrudedPolygon";

export declare type Sketch = {
  readonly tool: SketchType | undefined;
  readonly setTool?: (type: SketchType | undefined) => void;
  readonly options: SketchOptions | undefined;
  readonly overrideOptions?: (options: SketchOptions) => void;
  readonly on: SketchEvents["on"];
  readonly off: SketchEvents["off"];
};

export declare type SketchOptions = {
  readonly color?: string;
  readonly appearance?: SketchAppearance;
  readonly dataOnly?: boolean;
  readonly disableShadow?: boolean;
  readonly enableRelativeHeight?: boolean;
  readonly rightClickToAbort?: boolean;
  readonly autoResetInteractionMode?: boolean;
};

export declare type SketchEventType = {
  create: [props: SketchEventProps];
  toolChange: [props: SketchType | undefined];
};

export declare type SketchEvents = {
  readonly on: <T extends keyof SketchEventType>(
    type: T,
    callback: (...args: SketchEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof SketchEventType>(
    type: T,
    callback: (...args: SketchEventType[T]) => void,
  ) => void;
};
