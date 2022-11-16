import {
  Cartesian3,
  Cesium3DTileset as Cesium3DTilesetType,
  Cesium3DTileStyle,
  ClippingPlaneCollection as CesiumClippingPlaneCollection,
  HeadingPitchRoll,
  IonResource,
  Matrix3,
  Matrix4,
  Transforms,
} from "cesium";
import ClippingPlane from "cesium/Source/Scene/ClippingPlane";
import { FC, useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Cesium3DTileset, CesiumComponentRef, useCesium } from "resium";

import { EXPERIMENTAL_clipping, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { shadowMode, layerIdField } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    sourceType?: "url" | "osm";
    tileset?: string;
    styleUrl?: string;
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
    edgeWidth?: number;
    edgeColor?: string;
    experimental_clipping?: EXPERIMENTAL_clipping;
  };
};

const Tileset: FC<PrimitiveProps<Property>> = memo(function TilesetPresenter({ layer }) {
  const { viewer } = useCesium();
  const { isVisible, property } = layer ?? {};
  const { sourceType, tileset, styleUrl, shadows, edgeColor, edgeWidth, experimental_clipping } =
    (property as Property | undefined)?.default ?? {};
  const {
    width,
    height,
    length,
    location,
    heading,
    roll,
    pitch,
    planes: _planes,
  } = experimental_clipping || {};
  const [style, setStyle] = useState<Cesium3DTileStyle>();
  const prevPlanes = useRef(_planes);
  const planes = useMemo(() => {
    if (
      !prevPlanes.current?.length ||
      !prevPlanes.current?.every(
        (p, i) =>
          p.normal?.x === _planes?.[i].normal?.x &&
          p.normal?.y === _planes?.[i].normal?.y &&
          p.normal?.z === _planes?.[i].normal?.z &&
          p.distance === _planes?.[i].distance,
      )
    ) {
      prevPlanes.current = _planes;
    }
    return prevPlanes.current;
  }, [_planes]);
  // Create immutable object
  const [clippingPlanes] = useState(
    () =>
      new CesiumClippingPlaneCollection({
        planes: planes?.map(
          plane =>
            new ClippingPlane(
              new Cartesian3(plane.normal?.x, plane.normal?.y, plane.normal?.z),
              (plane.distance || 0) * -1,
            ),
        ),
        edgeWidth: edgeWidth,
        edgeColor: toColor(edgeColor),
      }),
  );
  const tilesetRef = useRef<Cesium3DTilesetType>();

  const ref = useCallback(
    (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
      if (layer?.id && tileset?.cesiumElement) {
        (tileset?.cesiumElement as any)[layerIdField] = layer.id;
      }
      tilesetRef.current = tileset?.cesiumElement;
    },
    [layer?.id],
  );

  useEffect(() => {
    const prepareClippingPlanes = async () => {
      if (!tilesetRef.current) {
        return;
      }

      await tilesetRef.current?.readyPromise;

      const clippingPlanesOriginMatrix = Transforms.eastNorthUpToFixedFrame(
        tilesetRef.current.boundingSphere.center.clone(),
      );

      const dimensions = new Cartesian3(width || 100, length || 100, height || 100);

      const position = Cartesian3.fromDegrees(
        location?.lng || 0,
        location?.lat || 0,
        location?.height,
      );

      const hpr =
        heading && pitch && roll ? HeadingPitchRoll.fromDegrees(heading, pitch, roll) : undefined;
      const boxTransform = Matrix4.multiply(
        hpr
          ? Matrix4.fromRotationTranslation(Matrix3.fromHeadingPitchRoll(hpr), position)
          : Transforms.eastNorthUpToFixedFrame(position),
        Matrix4.fromScale(dimensions, new Matrix4()),
        new Matrix4(),
      );

      const inverseOriginalModelMatrix = Matrix4.inverse(clippingPlanesOriginMatrix, new Matrix4());

      Matrix4.multiply(inverseOriginalModelMatrix, boxTransform, clippingPlanes.modelMatrix);
    };

    prepareClippingPlanes();
  }, [width, length, height, location?.lng, location?.lat, location?.height, heading, pitch, roll, clippingPlanes.modelMatrix]);

  useEffect(() => {
    if (!styleUrl) {
      setStyle(undefined);
      return;
    }
    (async () => {
      const res = await fetch(styleUrl);
      if (!res.ok) return;
      setStyle(new Cesium3DTileStyle(await res.json()));
    })();
  }, [styleUrl]);

  const tilesetUrl = useMemo(() => {
    return sourceType === "osm" && isVisible
      ? IonResource.fromAssetId(96188) //https://github.com/CesiumGS/cesium/blob/1.69/Source/Scene/createOsmBuildings.js#L50
      : isVisible && tileset
      ? tileset
      : null;
  }, [isVisible, sourceType, tileset]);

  return !isVisible || (!tileset && !sourceType) || !tilesetUrl ? null : (
    <Cesium3DTileset
      ref={ref}
      url={tilesetUrl}
      style={style}
      shadows={shadowMode(shadows)}
      onReady={_debugFlight ? t => viewer?.zoomTo(t) : undefined}
      clippingPlanes={clippingPlanes}
    />
  );
});

const _debugFlight = true;

export default Tileset;
