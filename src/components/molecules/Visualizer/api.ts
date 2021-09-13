import { FlyToDestination, CameraOptions, LookAtDestination } from "@reearth/plugin";

import type { CommonGlobalThis } from "./context";
import { EngineRef } from "./Engine/ref";

export type Options = {
  engine: () => EngineRef | null;
  selectPrimitive: (id?: string, options?: { reason?: string }) => void;
  showPrimitive: (...id: string[]) => void;
  hidePrimitive: (...id: string[]) => void;
};

export default function (options: Options): CommonGlobalThis {
  const primitives = getPrimitives(options);
  const visualizer = getVisualizer(options);

  const consolelog = (...args: any[]) => {
    console.log(...args);
  };
  const consolerror = (...args: any[]) => {
    console.error(...args);
  };

  // use only static values to avoid "Lifetime not alive" error
  const api: CommonGlobalThis = {
    console: {
      log: consolelog,
      error: consolerror,
    },
    reearth: {
      get version() {
        return window.REEARTH_CONFIG?.version || "";
      },
      get apiVersion() {
        return 0;
      },
      primitives,
      visualizer,
    },
  };

  return api;
}

function getPrimitives({
  selectPrimitive,
  showPrimitive,
  hidePrimitive,
}: Options): CommonGlobalThis["reearth"]["primitives"] {
  return {
    select: selectPrimitive.bind(undefined),
    show: showPrimitive.bind(undefined),
    hide: hidePrimitive.bind(undefined),
  };
}

function getVisualizer({ engine }: Options): CommonGlobalThis["reearth"]["visualizer"] {
  const flyTo = (dest: FlyToDestination, options?: CameraOptions) => engine()?.flyTo(dest, options);
  const lookAt = (dest: LookAtDestination, options?: CameraOptions) =>
    engine()?.lookAt(dest, options);
  const zoomIn = (amount: number) => engine()?.zoomIn(amount);
  const zoomOut = (amount: number) => engine()?.zoomOut(amount);

  return {
    get engine() {
      return engine()?.name ?? "";
    },
    flyTo,
    lookAt,
    zoomIn,
    zoomOut,
  };
}
