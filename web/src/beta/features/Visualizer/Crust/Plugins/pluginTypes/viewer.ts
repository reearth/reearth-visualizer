import { InteractionModeType, ViewerProperty } from "@reearth/core";

export declare type Viewer = {
  readonly property: ViewerProperty;
  readonly overrideProperty: (property: ViewerProperty) => void;
  readonly viewPort: Viewport;
  readonly interactionMode: InteractionMode;
  readonly env: Env;
};

export declare type ViewportSize = {
  readonly width: number;
  readonly height: number;
  readonly isMobile: boolean;
};

export declare type Viewport = ViewportSize & {
  readonly query: Record<string, string>;
  readonly capture: (type?: string, encoderOptions?: number) => string | undefined;
};

export declare type InteractionMode = {
  mode: InteractionModeType;
  override?: (mode: InteractionModeType) => void;
};

export declare type Env = {
  inEditor: boolean;
};
