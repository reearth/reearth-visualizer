import { SketchAppearance, SketchType } from "@reearth/core";

export declare type Sketch = {
  readonly type: SketchType | undefined;
  readonly setType?: (type: SketchType | undefined) => void;
  readonly options: {
    readonly color: string;
    readonly appearance: SketchAppearance;
    readonly dataOnly: boolean;
    readonly disableShadow: boolean;
    readonly enableRelativeHeight: boolean;
    readonly allowRightClickToAbort: boolean;
    readonly allowAutoResetInteractionMode: boolean;
  };
  readonly overrideOptions?: (options: {
    readonly color?: string;
    readonly appearance?: SketchAppearance;
    readonly dataOnly?: boolean;
    readonly disableShadow?: boolean;
    readonly enableRelativeHeight?: boolean;
    readonly allowRightClickToAbort?: boolean;
    readonly allowAutoResetInteractionMode?: boolean;
  }) => void;
};
