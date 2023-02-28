import { memo, useMemo } from "react";
import { Cesium3DTileset } from "resium";

import type { Cesium3DTilesAppearance, ComputedLayer } from "../../..";
import { colorBlendModeFor3DTile, shadowMode } from "../../common";
import Box from "../Box";
import { type FeatureComponentConfig, type FeatureProps } from "../utils";

import { useHooks } from "./hooks";

export type Props = FeatureProps<Property>;

export type Property = Cesium3DTilesAppearance;

function Tileset({
  id,
  isVisible,
  property,
  layer,
  feature,
  sceneProperty,
  meta,
  evalFeature,
  onComputedFeatureFetch,
  onFeatureDelete,
  ...props
}: Props): JSX.Element | null {
  const { shadows, colorBlendMode } = property ?? {};
  const boxId = `${layer?.id}_box`;
  const { tilesetUrl, ref, style, clippingPlanes, builtinBoxProps } = useHooks({
    id,
    boxId,
    isVisible,
    layer,
    feature,
    property,
    sceneProperty,
    meta,
    evalFeature,
    onComputedFeatureFetch,
    onFeatureDelete,
  });
  const boxProperty = useMemo(
    () => ({
      ...(layer?.layer?.type === "simple" ? layer?.layer?.box : {}),
      ...(builtinBoxProps?.property || {}),
    }),
    [layer?.layer, builtinBoxProps?.property],
  );
  const boxLayer = useMemo(() => ({ ...layer, id: boxId }), [layer, boxId]);

  return !isVisible || !tilesetUrl ? null : (
    <>
      <Cesium3DTileset
        ref={ref}
        url={tilesetUrl}
        style={style}
        shadows={shadowMode(shadows)}
        clippingPlanes={clippingPlanes}
        colorBlendMode={colorBlendModeFor3DTile(colorBlendMode)}
      />
      {builtinBoxProps && (
        <Box
          {...props}
          id={boxId}
          sceneProperty={sceneProperty}
          property={boxProperty as any}
          geometry={builtinBoxProps.geometry}
          feature={feature}
          layer={boxLayer as ComputedLayer}
          isVisible={builtinBoxProps.visible}
          evalFeature={evalFeature}
          onComputedFeatureFetch={onComputedFeatureFetch}
          onFeatureDelete={onFeatureDelete}
          onLayerEdit={builtinBoxProps.handleLayerEdit}
        />
      )}
    </>
  );
}

export default memo(
  Tileset,
  (prev, next) =>
    prev.id === next.id &&
    prev.isVisible === next.isVisible &&
    prev.property === next.property &&
    prev.layer?.layer === next.layer?.layer &&
    prev.sceneProperty === next.sceneProperty &&
    prev.meta === next.meta &&
    prev.evalFeature === next.evalFeature &&
    prev.onComputedFeatureFetch === next.onComputedFeatureFetch &&
    prev.onFeatureDelete === next.onFeatureDelete,
);

export const config: FeatureComponentConfig = {
  noFeature: true,
};
