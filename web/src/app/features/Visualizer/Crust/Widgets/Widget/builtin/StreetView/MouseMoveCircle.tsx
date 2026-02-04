import { useVisualizer } from "@reearth/core";
import { animate, useMotionValue, usePresence } from "framer-motion";
import { useMemo, type FC, useEffect, useState, useRef } from "react";

import { XYZ } from "./types";
import { MotionPosition } from "./useMotionPotion";

export interface MouseMoveCircleProps {
  motionPosition: MotionPosition;
  offset?: XYZ;
  radius?: number;
}

export const MouseMoveCircle: FC<MouseMoveCircleProps> = ({
  motionPosition,
  offset,
  radius = 100
}) => {
  const visualizer = useVisualizer();
  const engine = visualizer?.current?.engine;
  const layers = visualizer?.current?.layers;

  const motionLevitation = useMotionValue(0);
  const [present, safeToRemove] = usePresence();
  const safeToRemoveRef = useRef(safeToRemove);
  safeToRemoveRef.current = safeToRemove;
  useEffect(() => {
    return animate(motionLevitation, present ? 1 : 0, {
      type: "tween",
      duration: 0.2,
      onComplete: () => {
        if (!present) {
          safeToRemoveRef.current?.();
        }
      }
    }).stop;
  }, [motionLevitation, present]);

  const [levitation, setLevitation] = useState(0);
  useEffect(() => {
    return motionLevitation.on("change", (latest) => {
      setLevitation(latest);
    });
  }, [motionLevitation]);

  const coordinates = useMemo(() => {
    const [posX, posY, posZ] = motionPosition.get();
    const nextPosition = [
      posX + (offset?.x || 0),
      posY + (offset?.y || 0),
      posZ + (offset?.z || 0)
    ] as const;
    
    if (nextPosition.every((v) => v === 0)) {
      return undefined;
    }
    const result = engine?.toLngLatHeight?.(
      posX + (offset?.x || 0),
      posY + (offset?.y || 0),
      posZ + (offset?.z || 0),
      { useGlobeEllipsoid: true }
    ) ?? [0, 0, 0];
    return result;
  }, [ motionPosition, offset]); // eslint-disable-line react-hooks/exhaustive-deps

  const semiAxisProperty = useMemo(
    () => Math.max(0.1, levitation * radius),
    [radius, levitation]
  );
  const position = useMemo(() => {
    if (!coordinates) return undefined;

    const [lng, lat, height] = coordinates;
    return { lng, lat, height };
  }, [coordinates]);



  console.log("coordinates", coordinates);
  return coordinates ? <>testing</> : null;
};
