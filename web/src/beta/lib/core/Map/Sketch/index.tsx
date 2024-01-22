import { ForwardRefRenderFunction, RefObject, forwardRef } from "react";

import { InteractionModeType } from "../../Crust";
import { EngineRef, LayersRef, SketchRef } from "../types";

import DynamicSketchObject from "./DynamicSketchObject";
import useHooks from "./hooks";

type Props = {
  layersRef: RefObject<LayersRef>;
  engineRef: RefObject<EngineRef>;
  interactionMode: InteractionModeType;
  // overrideInteractionMode: (mode: InteractionModeType) => void;
};

const Sketch: ForwardRefRenderFunction<SketchRef, Props> = (
  { layersRef, engineRef, interactionMode },
  ref,
) => {
  const { state, extrudedHeight, geometryOptions } = useHooks({
    ref,
    layersRef,
    engineRef,
    interactionMode,
    // overrideInteractionMode,
  });
  if (state.matches("idle")) {
    return null;
  }
  return (
    <DynamicSketchObject
      geometryOptions={geometryOptions}
      {...(state.matches("extruding") && {
        extrudedHeight,
      })}
    />
  );
};

export default forwardRef(Sketch);
