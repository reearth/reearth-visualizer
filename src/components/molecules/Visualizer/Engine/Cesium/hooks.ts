import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import {
  createWorldTerrain,
  Color,
  Entity,
  Ion,
  EllipsoidTerrainProvider,
  Cesium3DTileFeature,
  Cartesian2,
} from "cesium";
import { isEqual } from "lodash-es";
import type { CesiumComponentRef } from "resium";
import type { Viewer as CesiumViewer, ImageryProvider, TerrainProvider } from "cesium";

import { Camera } from "@reearth/util/value";

import type { SelectPrimitiveOptions, Ref as EngineRef, SceneProperty } from "..";
import imagery from "./imagery";
import useEngineRef from "./useEngineRef";
import { getCamera } from "./common";

export default ({
  ref,
  property,
  camera,
  selectedPrimitiveId,
  onPrimitiveSelect,
  onCameraChange,
}: {
  ref: React.ForwardedRef<EngineRef>;
  property?: SceneProperty;
  camera?: Camera;
  selectedPrimitiveId?: string;
  onPrimitiveSelect?: (id?: string, options?: SelectPrimitiveOptions) => void;
  onCameraChange?: (camera: Camera) => void;
}) => {
  const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);

  // Ensure to set Cesium Ion access token before the first rendering
  useLayoutEffect(() => {
    const { ion } = property?.default ?? {};
    if (ion) {
      Ion.defaultAccessToken = ion;
    }
  }, [property?.default]);

  // expose ref
  const engineAPI = useEngineRef(ref, cesium);

  // imagery layers
  const [imageryLayers, setImageryLayers] =
    useState<[string, ImageryProvider, number | undefined, number | undefined][]>();

  useDeepCompareEffect(() => {
    const newTiles = (property?.tiles?.length ? property.tiles : undefined)
      ?.map(
        t =>
          [t.id, t.tile_type || "default", t.tile_url, t.tile_minLevel, t.tile_maxLevel] as const,
      )
      .map<[string, ImageryProvider | null, number | undefined, number | undefined]>(
        ([id, type, url, min, max]) => [
          id,
          type ? (url ? imagery[type](url) : imagery[type]()) : null,
          min,
          max,
        ],
      )
      .filter(
        (t): t is [string, ImageryProvider, number | undefined, number | undefined] => !!t[1],
      );
    setImageryLayers(newTiles);
  }, [property?.tiles ?? []]);

  const terrainProvider = useMemo((): TerrainProvider | undefined => {
    return property?.default?.terrain ? createWorldTerrain() : new EllipsoidTerrainProvider();
  }, [property?.default?.terrain]);

  const backgroundColor = useMemo(
    () =>
      property?.default?.bgcolor ? Color.fromCssColorString(property.default.bgcolor) : undefined,
    [property?.default?.bgcolor],
  );

  // move to initial position at startup
  const initialCameraFlight = useRef(false);

  useEffect(() => {
    if (!property?.default?.camera || initialCameraFlight.current) return;
    initialCameraFlight.current = true;
    engineAPI.flyTo(property.default.camera, { duration: 0 });
  }, [engineAPI, property?.default?.camera]);

  useEffect(() => {
    if (initialCameraFlight.current && !property) {
      initialCameraFlight.current = false;
    }
  }, [property]);

  // call onCameraChange event after moving camera
  const onCameraMoveEnd = useCallback(() => {
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const c = getCamera(viewer);
    if (c && !isEqual(c, camera)) {
      onCameraChange?.(c);
    }
  }, [onCameraChange, camera]);

  // manage layer selection
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const entity = selectedPrimitiveId ? viewer.entities.getById(selectedPrimitiveId) : undefined;
    if (viewer.selectedEntity === entity || (entity && !selectable(entity))) return;

    viewer.selectedEntity = entity;
  }, [cesium, selectedPrimitiveId]);

  const selectViewerEntity = useCallback(
    (ev: { position: Cartesian2 } | { startPosition: Cartesian2; endPosition: Cartesian2 }) => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed() || !("position" in ev)) return;

      let target = viewer.scene.pick(ev.position);
      if (target && target.id instanceof Entity) {
        target = target.id;
      }

      if (target instanceof Entity && selectable(target)) {
        onPrimitiveSelect?.(target.id);
        return;
      }

      if (target instanceof Cesium3DTileFeature) {
        const primitiveId = (target.primitive as any)?.__resium_primitive_id as string | undefined;
        if (primitiveId) {
          onPrimitiveSelect?.(primitiveId, {
            overriddenInfobox: {
              title: target.getProperty("name"),
              content: tileProperties(target),
            },
          });
        }
        return;
      }

      onPrimitiveSelect?.();
    },
    [onPrimitiveSelect],
  );

  // E2E test
  useEffect(() => {
    if (window.REEARTH_E2E_ACCESS_TOKEN) {
      window.REEARTH_E2E_CESIUM_VIEWER = cesium.current?.cesiumElement;
      return () => {
        delete window.REEARTH_E2E_CESIUM_VIEWER;
      };
    }
    return;
  }, [cesium.current?.cesiumElement]);

  // update
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    viewer.scene.requestRender();
  });

  return {
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selectViewerEntity,
    onCameraMoveEnd,
  };
};

const tag = "reearth_unselectable";
const selectable = (e: Entity | undefined) => {
  if (!e) return false;
  const p = e.properties;
  return !p || !p.hasProperty(tag);
};

function tileProperties(t: Cesium3DTileFeature): { key: string; value: any }[] {
  return t
    .getPropertyNames()
    .reduce<{ key: string; value: any }[]>(
      (a, b) => [...a, { key: b, value: t.getProperty(b) }],
      [],
    );
}
