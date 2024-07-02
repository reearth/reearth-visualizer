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
  // readonly setColor?: (color: string) => void;
  // readonly setDefaultAppearance?: (appearance: SketchAppearance) => void;
  // readonly createDataOnly?: (dataOnly: boolean) => void;
  // readonly disableShadow?: (disable: boolean) => void;
  // readonly enableRelativeHeight?: (enable: boolean) => void;
  // readonly allowRightClickToAbort?: (allow: boolean) => void;
  // readonly allowAutoResetInteractionMode?: (allow: boolean) => void;
};
