import { type RefObject, useImperativeHandle, useRef, type Ref } from "react";

import { EngineRef } from "./types";

export type MapRef = {
  engineRef: RefObject<EngineRef>;
};

export default function ({ ref }: { ref: Ref<MapRef> }) {
  const engineRef = useRef<EngineRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      engineRef,
      // layers
      // features
    }),
    [],
  );

  return {
    engineRef,
  };
}
