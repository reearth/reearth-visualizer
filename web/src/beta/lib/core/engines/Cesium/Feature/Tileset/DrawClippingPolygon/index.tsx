import { Cartesian3, PolygonHierarchy } from "cesium";
import { Position } from "geojson";
import { isEqual } from "lodash-es";
import { FC, useMemo } from "react";
import { PolygonGraphics } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { EntityExt, toColor } from "../../utils";

type DrawClippingPolygonProps = {
  coordiantes: Position[];
  top?: number;
  bottom?: number;
  visible?: boolean;
  ready?: boolean;
};

export const DrawClippingPolygon: FC<DrawClippingPolygonProps> = ({
  coordiantes,
  top = 0,
  bottom = 0,
  visible,
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

  const strokeColor = useMemo(() => toColor("#00bebe"), []);
  const fillColor = useMemo(() => toColor("#00bebe11"), []);

  return (
    <EntityExt hideIndicator>
      <PolygonGraphics
        hierarchy={hierarchy}
        fill={true}
        material={fillColor}
        outline={true}
        outlineColor={strokeColor}
        height={bottom}
        extrudedHeight={top}
        show={visible && ready}
      />
    </EntityExt>
  );
};
