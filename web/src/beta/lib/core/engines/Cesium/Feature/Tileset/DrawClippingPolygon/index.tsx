import { Cartesian3, PolygonHierarchy } from "cesium";
import { Position } from "geojson";
import { isEqual } from "lodash-es";
import { FC, useMemo } from "react";
import { PolygonGraphics } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { EntityExt, toColor } from "../../utils";

export type ClippingPolygonStyle = {
  fill?: boolean;
  fillColor?: string;
  stroke?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
};

type DrawClippingPolygonProps = {
  coordiantes: Position[];
  top?: number;
  bottom?: number;
  visible?: boolean;
  style?: ClippingPolygonStyle;
  ready?: boolean;
};

const DEFAULT_CLIPPING_POLYGON_STYLE = {
  fill: true,
  fillColor: "#FFFFFF22",
  stroke: true,
  strokeColor: "#FFFFFF",
  strokeWidth: 1,
};

export const DrawClippingPolygon: FC<DrawClippingPolygonProps> = ({
  coordiantes,
  top = 0,
  bottom = 0,
  visible,
  style,
  ready,
}) => {
  const hierarchy = useCustomCompareMemo(
    () =>
      coordiantes
        ? new PolygonHierarchy(coordiantes.map(c => Cartesian3.fromDegrees(c[0], c[1], c[2] ?? 0)))
        : undefined,
    [coordiantes ?? []],
    isEqual,
  );

  const memoizedStyle = useMemo(
    () => ({
      ...DEFAULT_CLIPPING_POLYGON_STYLE,
      ...style,
      fillColor: toColor(style?.fillColor ?? DEFAULT_CLIPPING_POLYGON_STYLE.fillColor),
      strokeColor: toColor(style?.strokeColor ?? DEFAULT_CLIPPING_POLYGON_STYLE.strokeColor),
    }),
    [style],
  );

  return (
    <EntityExt hideIndicator>
      <PolygonGraphics
        hierarchy={hierarchy}
        fill={memoizedStyle.fill}
        material={memoizedStyle.fillColor}
        outline={memoizedStyle.stroke}
        outlineColor={memoizedStyle.strokeColor}
        outlineWidth={memoizedStyle.strokeWidth}
        height={bottom}
        extrudedHeight={top}
        show={visible && ready}
      />
    </EntityExt>
  );
};
