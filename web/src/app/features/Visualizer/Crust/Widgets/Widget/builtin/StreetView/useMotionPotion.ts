import {
  animate,
  useMotionValue,
  useTransform,
  type MotionValue,
  type ValueAnimationTransition
} from "framer-motion";

import { type Position } from "./types";

export interface MotionPosition extends MotionValue<[number, number, number]> {
  setPosition: (position: Position) => void;
  animatePosition: (position: Position) => () => void;
}

export function useMotionPosition(position?: Position): MotionPosition {
  const motionX = useMotionValue(position?.x ?? 0);
  const motionY = useMotionValue(position?.y ?? 0);
  const motionZ = useMotionValue(position?.z ?? 0);

  return Object.assign(
    useTransform(
      [motionX, motionY, motionZ],
      (values) => values as [number, number, number]
    ),
    {
      setPosition: (position: Position) => {
        motionX.set(position.x);
        motionY.set(position.y);
        motionZ.set(position.z);
      },
      animatePosition: (
        position: Position,
        options: ValueAnimationTransition<number> = {
          type: "tween",
          ease: "easeOut",
          duration: 0.3
        }
      ) => {
        const stops = [
          animate(motionX, position.x, options).stop,
          animate(motionY, position.y, options).stop,
          animate(motionZ, position.z, options).stop
        ];
        return () => {
          stops.forEach((stop) => {
            stop();
          });
        };
      }
    }
  );
}
