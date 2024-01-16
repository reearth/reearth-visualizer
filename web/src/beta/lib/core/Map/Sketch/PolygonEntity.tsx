import {
  CallbackProperty,
  ClassificationType,
  type Color,
  type PolygonHierarchy,
} from "@cesium/engine";
import { useMemo, useRef, type FC } from "react";

import { useConstant } from "@reearth/beta/utils/util";

import { useVisualizer } from "../../Visualizer";

import { Entity, type EntityProps } from "./Entity";

export interface PolygonEntityProps {
  dynamic?: boolean;
  hierarchy?: PolygonHierarchy;
  color?: Color;
}

export const PolygonEntity: FC<PolygonEntityProps> = ({
  dynamic = false,
  hierarchy: hierarchyProp,
  color,
}) => {
  const hierarchyRef = useRef(hierarchyProp);
  hierarchyRef.current = hierarchyProp;
  const hierarchyProperty = useConstant(
    () => new CallbackProperty(() => hierarchyRef.current, false),
  );
  const hierarchy = dynamic ? hierarchyProperty : hierarchyProp;

  const options = useMemo(
    (): EntityProps => ({
      polygon: {
        hierarchy,
        fill: true,
        material: color?.withAlpha(0.5),
        classificationType: ClassificationType.TERRAIN,
      },
    }),
    [color, hierarchy],
  );

  const visualizer = useVisualizer();
  visualizer.current?.engine.requestRender();

  return <Entity {...options} />;
};
