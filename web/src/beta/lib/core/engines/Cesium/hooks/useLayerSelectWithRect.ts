import { Viewer } from "cesium";
import { RefObject, useCallback, useMemo, useRef } from "react";
import { CesiumComponentRef, CesiumMovementEvent } from "resium";

import { EngineRef } from "../..";
import { INTERACTION_MODES } from "../../../Crust";
import {
  LayerSelectWithRect,
  LayerSelectWithRectEnd,
  LayerSelectWithRectMove,
  LayerSelectWithRectStart,
} from "../../../Map";
import { makeMouseEventProps } from "../utils/mouse";

export const useLayerSelectWithRect = ({
  cesium,
  engineAPI,
  featureFlags,
  onLayerSelectWithRectStart,
  onLayerSelectWithRectMove,
  onLayerSelectWithRectEnd,
}: {
  cesium: RefObject<CesiumComponentRef<Viewer>>;
  engineAPI: EngineRef;
  featureFlags: number;
  onLayerSelectWithRectStart?: (e: LayerSelectWithRectStart) => void;
  onLayerSelectWithRectMove?: (e: LayerSelectWithRectMove) => void;
  onLayerSelectWithRectEnd?: (e: LayerSelectWithRectEnd) => void;
}) => {
  const startPositionRef = useRef<[x: number, y: number]>([0, 0]);
  const isDragMovingRef = useRef(false);
  const isDragStartingRef = useRef(false);
  const handleLayerSelectWithRectStart = useCallback(
    (e: CesiumMovementEvent, pressedKey?: LayerSelectWithRect["pressedKey"]) => {
      if (isDragMovingRef.current || isDragStartingRef.current) return;
      if (featureFlags !== INTERACTION_MODES.selection) return;
      if (!cesium.current?.cesiumElement || cesium.current.cesiumElement.isDestroyed()) return;
      const mouseProps = makeMouseEventProps(cesium.current.cesiumElement, e) ?? {};
      startPositionRef.current = [mouseProps.x ?? 0, mouseProps.y ?? 0];
      isDragStartingRef.current = true;
      isDragMovingRef.current = false;
      onLayerSelectWithRectStart?.({ ...mouseProps, pressedKey });
    },
    [onLayerSelectWithRectStart, cesium, featureFlags],
  );
  const handleLayerSelectWithRectMove = useCallback(
    (
      e: CesiumMovementEvent,
      pressedKey?: LayerSelectWithRect["pressedKey"],
      ignoreEvent?: boolean,
    ): LayerSelectWithRectMove | undefined => {
      if (!isDragStartingRef.current) return;
      if (!cesium.current?.cesiumElement || cesium.current.cesiumElement.isDestroyed()) return;

      const mouseProps = makeMouseEventProps(cesium.current.cesiumElement, e) ?? {};

      let [x1, y1] = startPositionRef.current;
      let [x2, y2] = [mouseProps.x ?? 0, mouseProps.y ?? 0];

      if (x2 - x1 === 0 && y2 - y1 === 0) return mouseProps;

      if (!ignoreEvent) {
        isDragMovingRef.current = true;
      }

      if (x1 > x2) {
        [x2, x1] = [x1, x2];
      }
      if (y1 > y2) {
        [y2, y1] = [y1, y2];
      }

      const props = {
        ...mouseProps,
        pressedKey,
        x: x2,
        y: y2,
        startX: x1,
        startY: y1,
        width: x2 - x1,
        height: y2 - y1,
      };

      onLayerSelectWithRectMove?.(props);

      return props;
    },
    [onLayerSelectWithRectMove, cesium],
  );
  const handleLayerSelectWithRectEnd = useCallback(
    (e: CesiumMovementEvent, pressedKey?: LayerSelectWithRect["pressedKey"]) => {
      if (!isDragStartingRef.current) return;
      if (!cesium.current?.cesiumElement || cesium.current.cesiumElement.isDestroyed()) return;
      const mouseProps = handleLayerSelectWithRectMove(e, pressedKey, true);

      const { startX = 0, startY = 0, x = 0, y = 0, width = 0, height = 0 } = mouseProps ?? {};
      const [centerX, centerY] = [startX + width / 2, startY + height / 2];

      const features = isDragMovingRef.current
        ? engineAPI.pickManyFromViewport([centerX, centerY], width, height)
        : engineAPI.pickManyFromViewport([x, y], 1, 1);
      onLayerSelectWithRectEnd?.({
        ...mouseProps,
        pressedKey,
        features: features ?? [],
        isClick: !isDragMovingRef.current,
      });

      isDragMovingRef.current = false;
      isDragStartingRef.current = false;
    },
    [onLayerSelectWithRectEnd, cesium, engineAPI, handleLayerSelectWithRectMove],
  );

  const eventHandlers = useMemo(() => {
    type Events = {
      [K in "start" | "move" | "end"]: {
        handler: (
          e: CesiumMovementEvent,
          pressedKey?: LayerSelectWithRect["pressedKey"],
        ) => unknown;
        keys: NonNullable<LayerSelectWithRect["pressedKey"]>[];
      };
    };
    const events: Events = {
      start: {
        handler: handleLayerSelectWithRectStart,
        keys: ["shift"],
      },
      move: {
        handler: handleLayerSelectWithRectMove,
        keys: ["shift"],
      },
      end: {
        handler: handleLayerSelectWithRectEnd,
        keys: ["shift"],
      },
    };
    return Object.fromEntries(
      Object.entries(events).map(([k, v]) => [
        k,
        {
          handler: v.handler,
          ...Object.fromEntries(v.keys.map(k => [k, (e: CesiumMovementEvent) => v.handler(e, k)])),
        },
      ]),
    ) as {
      [K in keyof Events]: { handler: Events[K]["handler"] } & {
        [KEY in Events[K]["keys"][number]]: (
          e: CesiumMovementEvent,
        ) => ReturnType<Events[K]["handler"]>;
      };
    };
  }, [handleLayerSelectWithRectEnd, handleLayerSelectWithRectMove, handleLayerSelectWithRectStart]);

  return eventHandlers;
};
