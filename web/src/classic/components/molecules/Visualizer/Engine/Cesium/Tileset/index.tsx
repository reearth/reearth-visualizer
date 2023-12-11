import {
  Cartesian3,
  GoogleMaps as CesiumGoogleMaps,
  Cesium3DTileset as Cesium3DTilesetType,
  Cesium3DTileStyle,
  ClippingPlane,
  ClippingPlaneCollection as CesiumClippingPlaneCollection,
  HeadingPitchRoll,
  IonResource,
  Matrix3,
  Matrix4,
  Transforms,
  TranslationRotationScale,
  defaultValue,
  Resource,
} from "cesium";
import { FC, useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Cesium3DTileset, CesiumComponentRef, useCesium } from "resium";

import { EXPERIMENTAL_clipping, toColor } from "@reearth/classic/util/value";

import { SceneProperty } from "../..";
import type { Props as PrimitiveProps } from "../../../Primitive";
import { shadowMode, layerIdField, sampleTerrainHeightFromCartesian } from "../common";
import { translationWithClamping } from "../utils";

import { GoogleMaps } from "./types";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    sourceType?: "url" | "osm" | "google-photorealistic";
    tileset?: string;
    styleUrl?: string;
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
    edgeWidth?: number;
    edgeColor?: string;
    apiKey?: string;
    experimental_clipping?: EXPERIMENTAL_clipping;
  };
};

const Tileset: FC<PrimitiveProps<Property, any, SceneProperty>> = memo(function TilesetPresenter({
  layer,
  sceneProperty,
  meta,
}) {
  const { viewer } = useCesium();
  const { isVisible, property } = layer ?? {};
  const {
    sourceType,
    tileset,
    styleUrl,
    shadows,
    edgeColor,
    edgeWidth,
    experimental_clipping,
    apiKey,
  } = (property as Property | undefined)?.default ?? {};
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
  const { allowEnterGround } = sceneProperty?.default || {};
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

  const [terrainHeightEstimate, setTerrainHeightEstimate] = useState(0);
  const inProgressSamplingTerrainHeight = useRef(false);
  const updateTerrainHeight = useCallback(
    (translation: Cartesian3) => {
      if (inProgressSamplingTerrainHeight.current) {
        return;
      }

      if (!allowEnterGround && viewer) {
        inProgressSamplingTerrainHeight.current = true;
        sampleTerrainHeightFromCartesian(viewer.scene, translation).then(v => {
          setTerrainHeightEstimate(v ?? 0);
          inProgressSamplingTerrainHeight.current = false;
        });
      }
    },
    [allowEnterGround, viewer],
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

      if (!allowEnterGround) {
        translationWithClamping(
          new TranslationRotationScale(position, undefined, dimensions),
          !!allowEnterGround,
          terrainHeightEstimate,
        );
      }

      const hpr = heading && pitch && roll ? new HeadingPitchRoll(heading, pitch, roll) : undefined;
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

    if (!allowEnterGround) {
      updateTerrainHeight(Matrix4.getTranslation(clippingPlanes.modelMatrix, new Cartesian3()));
    }
    prepareClippingPlanes();
  }, [
    width,
    length,
    height,
    location?.lng,
    location?.lat,
    location?.height,
    heading,
    pitch,
    roll,
    clippingPlanes.modelMatrix,
    updateTerrainHeight,
    allowEnterGround,
    terrainHeightEstimate,
  ]);

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

  const googleMapResource = useMemo(() => {
    if (sourceType !== "google-photorealistic" || !isVisible) return;
    // Ref: https://github.com/CesiumGS/cesium/blob/b208135a095073386e5f04a59956ee11a03aa847/packages/engine/Source/Scene/createGooglePhotorealistic3DTileset.js#L30
    const googleMaps = CesiumGoogleMaps as GoogleMaps;
    // Default key: https://github.com/CesiumGS/cesium/blob/b208135a095073386e5f04a59956ee11a03aa847/packages/engine/Source/Core/GoogleMaps.js#L6C36-L6C36
    const key = defaultValue(apiKey, googleMaps.defaultApiKey);
    const credit = googleMaps.getDefaultApiKeyCredit(key);
    return new Resource({
      url: `${googleMaps.mapTilesApiEndpoint}3dtiles/root.json`,
      queryParameters: { key },
      credits: credit ? [credit] : undefined,
    } as Resource.ConstructorOptions);
  }, [sourceType, isVisible, apiKey]);

  const tilesetUrl = useMemo(() => {
    return sourceType === "osm" && isVisible
      ? IonResource.fromAssetId(96188, {
          accessToken: meta?.cesiumIonAccessToken as string | undefined,
        }) //https://github.com/CesiumGS/cesium/blob/1.69/Source/Scene/createOsmBuildings.js#L50
      : googleMapResource
      ? googleMapResource
      : isVisible && tileset
      ? tileset
      : null;
  }, [isVisible, sourceType, tileset, meta, googleMapResource]);

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

const _debugFlight = false;

export default Tileset;
