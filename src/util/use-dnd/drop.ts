import { useMemo, useCallback } from "react";
import { useDrop as useDndDrop, DropTargetHookSpec, DropTargetMonitor } from "react-dnd";

import { Item, ItemType, Dropper } from "./types";

export interface Context {
  position?: { x: number; y: number; w: number; h: number };
  canDrop: boolean;
}

export interface DropOptions<T extends ItemType = ItemType, E extends HTMLElement = HTMLElement> {
  accept: T | T[];
  canDrop?: (item: Item<T>) => boolean;
  hover?: (item: Item<T>, context: Context) => void;
  drop?: (item: Item<T>, context: Context) => Dropper | undefined;
  shallow?: boolean;
  disabled?: boolean;
  wrapperRef?: React.RefObject<E>;
}

export const useDrop = <T extends ItemType = ItemType, E extends HTMLElement = HTMLElement>({
  accept,
  hover,
  canDrop,
  drop,
  shallow,
  disabled,
  wrapperRef,
}: DropOptions<T, E>) => {
  const calcContext = useCallback(
    (monitor: DropTargetMonitor) => {
      const offset = wrapperRef?.current ? monitor.getClientOffset() : undefined;
      const wrapperOffset = wrapperRef?.current
        ? wrapperRef.current.getBoundingClientRect()
        : undefined;
      const position =
        offset && wrapperOffset
          ? {
              x: offset.x - wrapperOffset.left,
              y: offset.y - wrapperOffset.top,
              w: wrapperOffset.width,
              h: wrapperOffset.height,
            }
          : undefined;
      return {
        canDrop: monitor.canDrop(),
        position,
      };
    },
    [wrapperRef],
  );

  const options = useMemo<
    DropTargetHookSpec<
      Item<T>,
      Dropper,
      {
        isOver: boolean;
        canDrop: boolean;
        isDroppable: boolean;
        isNotDroppable: boolean;
      }
    >
  >(
    () => ({
      accept,
      hover: hover
        ? (item: Item<T>, monitor) => {
            hover(item, calcContext(monitor));
          }
        : undefined,
      canDrop: (item: Item<T>, monitor) =>
        !disabled && (!shallow || monitor.isOver({ shallow: true })) && (!canDrop || canDrop(item)),
      drop: drop ? (item: Item<T>, monitor) => drop(item, calcContext(monitor)) : undefined,
      collect(monitor) {
        const isOver = monitor.isOver({ shallow });
        const canDrop = monitor.canDrop();
        return {
          isOver,
          canDrop,
          isDroppable: isOver && canDrop,
          isNotDroppable: isOver && !canDrop,
        };
      },
    }),
    [accept, calcContext, canDrop, disabled, drop, hover, shallow],
  );

  const [{ isOver, canDrop: canDrop2, isDroppable, isNotDroppable }, ref] = useDndDrop(options);
  return { ref, isOver, canDrop: canDrop2, isDroppable, isNotDroppable };
};
