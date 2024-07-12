import { SketchAppearance, SketchType } from "@reearth/core";

export declare type Sketch = {
  readonly tool: SketchType | undefined;
  readonly setTool?: (type: SketchType | undefined) => void;
  readonly options: SketchOptions | undefined;
  readonly overrideOptions?: (options: SketchOptions) => void;
};

export declare type SketchOptions = {
  readonly color: string;
  readonly appearance: SketchAppearance;
  readonly dataOnly: boolean;
  readonly disableShadow: boolean;
  readonly enableRelativeHeight: boolean;
  readonly rightClickToAbort: boolean;
  readonly autoResetInteractionMode: boolean;
};
