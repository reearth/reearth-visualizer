import * as turf from "@turf/turf";
import { BoundingSphere, Intersect, PerspectiveFrustum, Rectangle, Cartesian3 } from "cesium";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useCesium } from "resium";
import invariant from "tiny-invariant";

import { HeatMapAppearance } from "@reearth/beta/lib/core/mantle";

import { usePreRender } from "../../hooks/useSceneEvent";
import { useContext } from "../context";
import { FeatureComponentConfig, FeatureProps } from "../utils";

import { flareColorMapLUT } from "./constants";
import { fetchImageAndCreateMeshImageData, MeshImageData } from "./createMeshImageData";
import { HeatmapMesh, HeatmapMeshHandle } from "./HeatmapMesh";

export type Props = FeatureProps<Property>;

export type Property = HeatMapAppearance;

export default memo(function HeatMap({ property, isVisible, layer, feature }: Props) {
  const {
    valueMap,
    colorMap = flareColorMapLUT,
    width,
    height,
    bounds,
    cropBounds,
    minValue,
    maxValue,
    opacity = 0.8,
    contourThickness = 1,
    contourAlpha = 0.2,
    logarithmic = false,
  } = property ?? {};
  const { scene } = useCesium();

  const ctx = useContext();

  // Bounds is nested object, and this cause unnecessary render frequently, so wrap with useMemo.
  const boudsRef = useMemo(
    () => [bounds?.west ?? 0, bounds?.south ?? 0, bounds?.east ?? 0, bounds?.north ?? 0] as const,
    [bounds?.west, bounds?.south, bounds?.east, bounds?.north],
  );

  const boundingSphere = useMemo(
    () => BoundingSphere.fromRectangle3D(Rectangle.fromDegrees(...boudsRef)),
    [boudsRef],
  );

  const [visible, setVisible] = useState(false);

  const checkVisiblity = (): boolean => {
    if (scene && !scene.camera) {
      return false;
    }

    const camera = scene?.camera;
    const frustum = camera?.frustum;
    invariant(
      frustum instanceof PerspectiveFrustum,
      "Frustum should be a PerspectiveFrustum instance",
    );

    const cullingVolume = frustum.computeCullingVolume(
      camera?.position || Cartesian3.ONE,
      camera?.direction || Cartesian3.ONE,
      camera?.up || Cartesian3.ONE,
    );
    return cullingVolume.computeVisibility(boundingSphere) !== Intersect.OUTSIDE;
  };

  const heatmapMeshRef = useRef<HeatmapMeshHandle>(null);

  useEffect(() => {
    if (heatmapMeshRef.current) {
      heatmapMeshRef.current.sendToBack();
    }
  }, []);

  usePreRender(() => {
    const currentVisibility = checkVisiblity();
    if (currentVisibility !== visible) {
      setVisible(currentVisibility);
      if (ctx?.onLayerVisibility && layer?.id) {
        ctx.onLayerVisibility({ layerId: layer.id });
      }
    }
  });

  useEffect(() => {
    return () => {
      if (!scene?.isDestroyed()) {
        scene?.requestRender();
      }
    };
  }, [scene]);

  const [meshImageData, setMeshImageData] = useState<MeshImageData>();
  const reversingImageNeeded = property?.maxValue == null && property?.minValue == null;
  useEffect(() => {
    if (!visible || !valueMap) return;
    fetchImageAndCreateMeshImageData(valueMap, reversingImageNeeded)
      .then(meshImageData => {
        setMeshImageData(meshImageData);
      })
      .catch(() => {});
  }, [reversingImageNeeded, valueMap, visible]);

  const hasBounds = !!bounds;

  const geometry = useMemo(
    () =>
      meshImageData != null && hasBounds
        ? turf.bboxPolygon([boudsRef[0], boudsRef[1], boudsRef[2], boudsRef[3]]).geometry
        : undefined,
    [hasBounds, boudsRef, meshImageData],
  );

  if (!scene) {
    return null;
  }

  const {
    contourSpacing = maxValue != null
      ? Math.max(10, maxValue / 20)
      : Math.max(10, (meshImageData?.outlierThreshold || 0) / 20),
  } = property ?? {};

  const colorRange =
    minValue != null && maxValue != null
      ? [minValue, maxValue]
      : extendRange([0, 100], [0, meshImageData?.outlierThreshold || 0]);

  if (!isVisible || meshImageData == null || geometry == null) {
    return null;
  }
  return (
    <HeatmapMesh
      layer={layer}
      feature={feature}
      boundingSphere={boundingSphere}
      meshImageData={meshImageData}
      geometry={geometry}
      colorMapLUT={colorMap}
      opacity={opacity}
      minValue={colorRange[0]}
      maxValue={colorRange[1]}
      contourSpacing={contourSpacing}
      contourThickness={contourThickness}
      contourAlpha={contourAlpha}
      bound={bounds}
      ref={heatmapMeshRef}
      cropBound={cropBounds}
      logarithmic={logarithmic}
      width={width || meshImageData.width}
      height={height || meshImageData.height}
    />
  );
});

function extendRange(a: number[], b: number[]): [number, number] {
  invariant(a.length === 2);
  invariant(b.length === 2);
  return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
