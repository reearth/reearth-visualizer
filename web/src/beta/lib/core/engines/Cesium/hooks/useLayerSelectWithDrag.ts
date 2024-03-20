import { Viewer } from "cesium";
import { RefObject, useCallback, useMemo, useRef } from "react";
import { CesiumComponentRef, CesiumMovementEvent } from "resium";

import { EngineRef } from "../..";
import { INTERACTION_MODES } from "../../../Crust";
import {
  LayerSelectWithDrag,
  LayerSelectWithDragEnd,
  LayerSelectWithDragMove,
  LayerSelectWithDragStart,
} from "../../../Map";
import { makeMouseEventProps } from "../utils/mouse";

export const useLayerSelectWithDrag = ({
  cesium,
  engineAPI,
  featureFlags,
  onLayerSelectWithDragStart,
  onLayerSelectWithDragMove,
  onLayerSelectWithDragEnd,
}: {
  cesium: RefObject<CesiumComponentRef<Viewer>>;
  engineAPI: EngineRef;
  featureFlags: number;
  onLayerSelectWithDragStart?: (e: LayerSelectWithDragStart) => void;
  onLayerSelectWithDragMove?: (e: LayerSelectWithDragMove) => void;
  onLayerSelectWithDragEnd?: (e: LayerSelectWithDragEnd) => void;
}) => {
  const startPositionRef = useRef<[x: number, y: number]>([0, 0]);
  const isDragMovingRef = useRef(false);
  const isDragStartingRef = useRef(false);
  const handleLayerSelectWithDragStart = useCallback(
    (e: CesiumMovementEvent, pressedKey?: LayerSelectWithDrag["pressedKey"]) => {
      if (isDragMovingRef.current || isDragStartingRef.current) return;
      if (featureFlags !== INTERACTION_MODES.selection) return;
      if (!cesium.current?.cesiumElement || cesium.current.cesiumElement.isDestroyed()) return;
      const mouseProps = makeMouseEventProps(cesium.current.cesiumElement, e) ?? {};
      startPositionRef.current = [mouseProps.x ?? 0, mouseProps.y ?? 0];
      isDragStartingRef.current = true;
      isDragMovingRef.current = false;
      onLayerSelectWithDragStart?.({ ...mouseProps, pressedKey });
    },
    [onLayerSelectWithDragStart, cesium, featureFlags],
  );
  const handleLayerSelectWithDragMove = useCallback(
    (
      e: CesiumMovementEvent,
      pressedKey?: LayerSelectWithDrag["pressedKey"],
      ignoreEvent?: boolean,
    ): LayerSelectWithDragMove | undefined => {
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

      onLayerSelectWithDragMove?.(props);

      return props;
    },
    [onLayerSelectWithDragMove, cesium],
  );
  const handleLayerSelectWithDragEnd = useCallback(
    (e: CesiumMovementEvent, pressedKey?: LayerSelectWithDrag["pressedKey"]) => {
      if (!isDragStartingRef.current) return;
      if (!cesium.current?.cesiumElement || cesium.current.cesiumElement.isDestroyed()) return;
      const mouseProps = handleLayerSelectWithDragMove(e, pressedKey, true);

      const { startX = 0, startY = 0, x = 0, y = 0, width = 0, height = 0 } = mouseProps ?? {};
      const [centerX, centerY] = [startX + width / 2, startY + height / 2];

      const features = isDragMovingRef.current
        ? engineAPI.pickManyFromViewport([centerX, centerY], width, height)
        : engineAPI.pickManyFromViewport([x, y], 1, 1);
      onLayerSelectWithDragEnd?.({
        ...mouseProps,
        pressedKey,
        features: features ?? [],
        isClick: !isDragMovingRef.current,
      });

      isDragMovingRef.current = false;
      isDragStartingRef.current = false;
    },
    [onLayerSelectWithDragEnd, cesium, engineAPI, handleLayerSelectWithDragMove],
  );

  const eventHandlers = useMemo(() => {
    type Events = {
      [K in "start" | "move" | "end"]: {
        handler: (
          e: CesiumMovementEvent,
          pressedKey?: LayerSelectWithDrag["pressedKey"],
        ) => unknown;
        keys: NonNullable<LayerSelectWithDrag["pressedKey"]>[];
      };
    };
    const events: Events = {
      start: {
        handler: handleLayerSelectWithDragStart,
        keys: ["shift"],
      },
      move: {
        handler: handleLayerSelectWithDragMove,
        keys: ["shift"],
      },
      end: {
        handler: handleLayerSelectWithDragEnd,
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
  }, [handleLayerSelectWithDragEnd, handleLayerSelectWithDragMove, handleLayerSelectWithDragStart]);

  return eventHandlers;
};
