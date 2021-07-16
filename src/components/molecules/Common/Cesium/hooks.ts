import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { isEqual } from "lodash-es";
import { useDeepCompareEffect } from "react-use";
import { CesiumComponentRef } from "resium";
import {
  Viewer as CesiumViewer,
  PerspectiveFrustum,
  Math as CesiumMath,
  ImageryProvider,
  Cartesian3,
  TerrainProvider,
  createWorldTerrain,
  EllipsoidTerrainProvider,
  Color,
  Ion,
  Cartesian2,
  Scene as CesiumScene,
} from "cesium";
import { Camera, SceneProperty } from "@reearth/util/value";
import useEntitySelection from "./useEntitySelection";
import tiles from "./tiles";

export type Ref = {
  requestRender: () => void;
  getLocationFromScreenXY: (
    x: number,
    y: number,
  ) => { lat: number; lng: number; height: number } | undefined;
};

export default ({
  initialLoad,
  selectedEntityId,
  property,
  isCapturing,
  camera: cameraState,
  ref,
  onEntitySelect,
  onCameraChange,
}: {
  selectedEntityId?: string;
  property?: SceneProperty;
  isCapturing?: boolean;
  initialLoad?: boolean;
  camera?: Camera;
  ref: React.Ref<Ref>;
  onEntitySelect?: (id?: string) => void;
  onCameraChange?: (camera: Camera) => void;
}) => {
  const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const { ion } = property?.default ?? {};

  useImperativeHandle(
    ref,
    () => ({
      requestRender: () => cesium.current?.cesiumElement?.scene?.requestRender(),
      getLocationFromScreenXY: (x: number, y: number) =>
        getLocationFromScreenXY(cesium.current?.cesiumElement?.scene, x, y),
    }),
    [],
  );

  const { selected, selectEntity, selectViewerEntity } = useEntitySelection(
    cesium,
    selectedEntityId,
    onEntitySelect,
  );

  useEffect(() => {
    // For E2E test
    if (window.REEARTH_E2E_ACCESS_TOKEN) {
      window.REEARTH_E2E_CESIUM_VIEWER = cesium.current?.cesiumElement;
      return () => {
        delete window.REEARTH_E2E_CESIUM_VIEWER;
      };
    }
    return;
  }, [cesium.current?.cesiumElement]);

  useEffect(() => {
    cesium.current?.cesiumElement?.scene.requestRender();
  });

  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer) return;

    const watchCamera = () => {
      const camera = getCamera(viewer);
      if (camera) {
        onCameraChange?.(camera);
      }
    };

    viewer.camera.moveEnd.addEventListener(watchCamera);

    return () => {
      if (viewer.isDestroyed()) return;
      viewer.camera.moveEnd.removeEventListener(watchCamera);
    };
  }, [isCapturing, onCameraChange]);

  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer) return;
    if (!(viewer.camera.frustum instanceof PerspectiveFrustum)) return;

    const camera = getCamera(viewer);
    if (!camera) return;

    if (!cameraState) {
      onCameraChange?.(camera);
      return;
    }

    if (!isEqual(cameraState, camera)) {
      const { lng, lat, altitude, heading, pitch, roll, fov } = cameraState;
      const destination = Cartesian3.fromDegrees(lng, lat, altitude);
      const orientation = { heading, pitch, roll };

      viewer.camera.setView({ destination, orientation });
      viewer.camera.frustum.fov = fov;
    }
  }, [cameraState, onCameraChange]);

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
          type ? (url ? tiles[type](url) : tiles[type]()) : null,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.default?.terrain]);

  const backgroundColor = useMemo(
    () =>
      property?.default?.bgcolor ? Color.fromCssColorString(property.default.bgcolor) : undefined,
    [property?.default?.bgcolor],
  );

  const [cameraDest, cameraOrientation] = useMemo<[Cartesian3 | undefined, any | undefined]>(() => {
    const camera = property?.default?.camera;
    if (!camera) return [undefined, undefined];
    const { heading, pitch, roll } = camera;
    return [
      Cartesian3.fromDegrees(camera.lng, camera.lat, camera.altitude),
      { heading, pitch, roll },
    ];
  }, [property?.default?.camera]);

  useEffect(() => {
    const frustum = cesium.current?.cesiumElement?.camera?.frustum;
    if (!(frustum instanceof PerspectiveFrustum)) return;
    frustum.fov = property?.default?.camera?.fov ?? CesiumMath.toRadians(60.0);
  }, [property?.default?.camera?.fov]);

  // Ensure to set Cesium Ion access token before the first rendering
  // But it does not work well...
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!initialLoad) return;
    if (ion) {
      Ion.defaultAccessToken = ion;
    }
    if (ready) return;
    setReady(true);
  }, [ion, ready, initialLoad]);

  return {
    ready,
    cameraDest,
    cameraOrientation,
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selected,
    selectEntity,
    selectViewerEntity,
  };
};

const getLocationFromScreenXY = (scene: CesiumScene | undefined | null, x: number, y: number) => {
  if (!scene) return undefined;
  const camera = scene.camera;
  const ellipsoid = scene.globe.ellipsoid;
  const cartesian = camera?.pickEllipsoid(new Cartesian2(x, y), ellipsoid);
  if (!cartesian) return undefined;
  const { latitude, longitude, height } = ellipsoid.cartesianToCartographic(cartesian);
  return {
    lat: CesiumMath.toDegrees(latitude),
    lng: CesiumMath.toDegrees(longitude),
    height,
  };
};

const getCamera = (viewer: CesiumViewer) => {
  const { camera } = viewer;
  if (!(camera.frustum instanceof PerspectiveFrustum)) return;

  const ellipsoid = viewer.scene.globe.ellipsoid;
  const {
    latitude,
    longitude,
    height: altitude,
  } = ellipsoid.cartesianToCartographic(camera.position);
  const lat = CesiumMath.toDegrees(latitude);
  const lng = CesiumMath.toDegrees(longitude);
  const { heading, pitch, roll } = camera;
  const { fov } = camera.frustum;

  return { lng, lat, altitude, heading, pitch, roll, fov };
};
