import { useState, useRef, useMemo } from "react";

import { useDrag, useDrop, DropOptions } from "@reearth/util/use-dnd";

export default ({
  id,
  index,
  onMove,
}: {
  id?: string;
  index?: number;
  onMove?: (blockId: string, fromIndex: number, toIndex: number) => void;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef<"top" | "bottom">();
  const [isHovered, setHovered] = useState<"top" | "bottom">();

  const {
    ref: dragRef,
    isDragging,
    previewRef,
  } = useDrag<"block">(
    id && typeof index === "number"
      ? {
          type: "block",
          id,
          index,
        }
      : undefined,
    false,
    (_item, dropper) => {
      if (!dropper || !onMove || !id || dropper.type !== "block" || typeof index !== "number")
        return;
      onMove(id, index, dropper.index);
    },
  );

  const { ref: dropRef } = useDrop(
    useMemo<DropOptions<"block">>(
      () => ({
        accept: ["block"],
        canDrop: item => item.id !== id,
        hover(_item, context) {
          if (!context.canDrop || !context.position) {
            isHoveredRef.current = undefined;
            setHovered(undefined);
            return;
          }

          const r = context.position.y / context.position.h;
          const hovered = r >= 0 && r <= 1 ? (r <= 0.5 ? "top" : "bottom") : undefined;

          setHovered(hovered);
          isHoveredRef.current = hovered;
        },
        drop(item) {
          const hovered = isHoveredRef.current;
          setHovered(undefined);
          isHoveredRef.current = undefined;
          if (item.type !== "block" || !id || typeof index !== "number") return;
          const newIndex = index + (item.index <= index ? 0 : hovered === "bottom" ? 1 : 0);
          if (newIndex === item.index) {
            return; // not moved
          }
          return {
            type: "block",
            id: id,
            index: newIndex,
          };
        },
        wrapperRef,
      }),
      [id, index],
    ),
  );

  dropRef(wrapperRef);

  return {
    isHovered,
    dragRef,
    dropRef: wrapperRef,
    previewRef,
    isDragging,
  };
};
