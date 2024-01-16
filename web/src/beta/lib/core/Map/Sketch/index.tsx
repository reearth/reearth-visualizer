import { ForwardRefRenderFunction, RefObject, forwardRef } from "react";

import { EngineRef, LayersRef, SketchRef } from "../types";

import DynamicSketchObject from "./DynamicSketchObject";
import useHooks from "./hooks";

type Props = {
  layersRef: RefObject<LayersRef>;
  engineRef: RefObject<EngineRef>;
};

const Sketch: ForwardRefRenderFunction<SketchRef, Props> = ({ layersRef, engineRef }, ref) => {
  const { state, extrudedHeight, geometryOptions } = useHooks({ ref, layersRef, engineRef });
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
