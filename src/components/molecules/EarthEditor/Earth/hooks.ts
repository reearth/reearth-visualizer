import { useRef, useEffect, useMemo } from "react";
import { useDrop, DropOptions } from "@reearth/util/use-dnd";
import { Ref } from "@reearth/components/molecules/Common/Cesium";

export interface EarthRef {
  getLocationFromScreenXY: (
    x: number,
    y: number,
  ) => { lat: number; lng: number; height: number } | undefined;
}

export default ({
  rootLayerId,
  onDroppableChange,
}: {
  isBuilt?: boolean;
  rootLayerId?: string;
  onDroppableChange?: (droppable: boolean) => void;
}) => {
  const cesiumRef = useRef<Ref>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ref: dropRef, isDroppable } = useDrop(
    useMemo(
      (): DropOptions => ({
        accept: ["primitive", "datasetSchema"],
        drop(_item, context) {
          if (!rootLayerId) return;
          const loc = context.position
            ? cesiumRef.current?.getLocationFromScreenXY(context.position.x, context.position.y)
            : undefined;
          return {
            type: "earth",
            layerId: rootLayerId,
            position: loc ? { lat: loc.lat, lng: loc.lng, height: loc.height } : undefined,
          };
        },
        wrapperRef,
      }),
      [rootLayerId],
    ),
  );
  dropRef(wrapperRef);

  useEffect(() => {
    onDroppableChange?.(isDroppable);
  }, [isDroppable, onDroppableChange]);

  useEffect(() => {
    cesiumRef.current?.requestRender();
  });

  return {
    cesiumRef,
    wrapperRef,
    isDroppable,
  };
};
