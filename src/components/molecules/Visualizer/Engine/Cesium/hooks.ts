import {
  Color,
  Entity,
  Ion,
  Cesium3DTileFeature,
  Cartesian3,
  Cartographic,
  Camera as CesiumCamera,
  Math,
  EllipsoidGeodesic,
  Rectangle,
  PolylineDashMaterialProperty,
} from "cesium";
import type { Viewer as CesiumViewer, ImageryProvider, TerrainProvider } from "cesium";
import CesiumDnD, { Context } from "cesium-dnd";
import { isEqual } from "lodash-es";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import type { CesiumComponentRef, CesiumMovementEvent, RootEventTarget } from "resium";
import { useCustomCompareCallback } from "use-custom-compare";

import { Camera, LatLng } from "@reearth/util/value";

import type { SelectLayerOptions, Ref as EngineRef, SceneProperty } from "..";

import { getCamera, isDraggable, isSelectable, layerIdField } from "./common";
import imagery from "./imagery";
import terrain from "./terrain";
import useEngineRef from "./useEngineRef";
import { convertCartesian3ToPosition } from "./utils";

export default ({
  ref,
  property,
  camera,
  selectedLayerId,
  onLayerSelect,
  onCameraChange,
  isLayerDraggable,
  onLayerDrag,
  onLayerDrop,
}: {
  ref: React.ForwardedRef<EngineRef>;
  property?: SceneProperty;
  camera?: Camera;
  selectedLayerId?: string;
  onLayerSelect?: (id?: string, options?: SelectLayerOptions) => void;
  onCameraChange?: (camera: Camera) => void;
  isLayerDraggable?: boolean;
  onLayerDrag?: (layerId: string, position: LatLng) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
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

  // terrain
  const terrainProperty = useMemo(
    () => ({
      terrain: property?.terrain?.terrain || property?.default?.terrain,
      terrainType: property?.terrain?.terrainType || property?.default?.terrainType,
      terrainExaggeration:
        property?.terrain?.terrainExaggeration || property?.default?.terrainExaggeration,
      terrainExaggerationRelativeHeight:
        property?.terrain?.terrainExaggerationRelativeHeight ||
        property?.default?.terrainExaggerationRelativeHeight,
      depthTestAgainstTerrain:
        property?.terrain?.depthTestAgainstTerrain || property?.default?.depthTestAgainstTerrain,
    }),
    [
      property?.default?.terrain,
      property?.default?.terrainType,
      property?.default?.terrainExaggeration,
      property?.default?.terrainExaggerationRelativeHeight,
      property?.default?.depthTestAgainstTerrain,
      property?.terrain?.terrain,
      property?.terrain?.terrainType,
      property?.terrain?.terrainExaggeration,
      property?.terrain?.terrainExaggerationRelativeHeight,
      property?.terrain?.depthTestAgainstTerrain,
    ],
  );

  const terrainProvider = useMemo((): TerrainProvider | undefined => {
    return terrainProperty.terrain
      ? terrainProperty.terrainType
        ? terrain[terrainProperty.terrainType] || terrain.default
        : terrain.cesium
      : terrain.default;
  }, [terrainProperty.terrain, terrainProperty.terrainType]);

  const backgroundColor = useMemo(
    () =>
      property?.default?.bgcolor ? Color.fromCssColorString(property.default.bgcolor) : undefined,
    [property?.default?.bgcolor],
  );

  // move to initial position at startup
  const initialCameraFlight = useRef(false);

  const handleMount = useCustomCompareCallback(
    () => {
      if (initialCameraFlight.current) return;
      initialCameraFlight.current = true;
      if (
        property?.cameraLimiter?.cameraLimitterEnabled &&
        property?.cameraLimiter?.cameraLimitterTargetArea
      ) {
        engineAPI.flyTo(property?.cameraLimiter?.cameraLimitterTargetArea, { duration: 0 });
      } else if (property?.default?.camera) {
        engineAPI.flyTo(property.default.camera, { duration: 0 });
      }
      const camera = getCamera(cesium?.current?.cesiumElement);
      if (camera) {
        onCameraChange?.(camera);
      }
    },
    [
      engineAPI,
      onCameraChange,
      property?.default?.camera,
      property?.cameraLimiter?.cameraLimitterEnabled,
    ],
    (prevDeps, nextDeps) =>
      prevDeps[0] === nextDeps[0] &&
      prevDeps[1] === nextDeps[1] &&
      isEqual(prevDeps[2], nextDeps[2]) &&
      prevDeps[3] === nextDeps[3],
  );

  const handleUnmount = useCallback(() => {
    initialCameraFlight.current = false;
  }, []);

  // call onCameraChange event after moving camera
  const emittedCamera = useRef<Camera>();
  const handleCameraMoveEnd = useCallback(() => {
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !onCameraChange) return;

    const c = getCamera(viewer);
    if (c && !isEqual(c, camera)) {
      emittedCamera.current = c;
      onCameraChange?.(c);
    }
  }, [camera, onCameraChange]);

  // camera
  useEffect(() => {
    if (camera && (!emittedCamera.current || emittedCamera.current !== camera)) {
      engineAPI.flyTo(camera, { duration: 0 });
      emittedCamera.current = undefined;
    }
  }, [camera, engineAPI]);

  const geodsic = useMemo(():
    | undefined
    | { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic } => {
    const viewer = cesium.current?.cesiumElement;
    if (
      !viewer ||
      !viewer.scene ||
      viewer.isDestroyed() ||
      !property?.cameraLimiter ||
      !property?.cameraLimiter.cameraLimitterTargetArea
    )
      return undefined;
    const ellipsoid = viewer.scene.globe.ellipsoid;

    const centerPoint = Cartesian3.fromDegrees(
      property.cameraLimiter.cameraLimitterTargetArea.lng,
      property.cameraLimiter.cameraLimitterTargetArea.lat,
      0,
    );

    const cartographicCenterPoint = Cartographic.fromCartesian(centerPoint);
    const normal = ellipsoid.geodeticSurfaceNormal(centerPoint);
    const east = Cartesian3.normalize(
      Cartesian3.cross(Cartesian3.UNIT_Z, normal, new Cartesian3()),
      new Cartesian3(),
    );
    const north = Cartesian3.normalize(
      Cartesian3.cross(normal, east, new Cartesian3()),
      new Cartesian3(),
    );

    const geodesicVertical = new EllipsoidGeodesic(
      cartographicCenterPoint,
      Cartographic.fromCartesian(north),
      ellipsoid,
    );
    const geodesicHorizontal = new EllipsoidGeodesic(
      cartographicCenterPoint,
      Cartographic.fromCartesian(east),
      ellipsoid,
    );
    return { geodesicVertical, geodesicHorizontal };
  }, [property?.cameraLimiter]);

  // calculate inner limiter dimensions
  const targetWidth = 1000000;
  const targetLength = 1000000;
  const limiterDimensions = useMemo(():
    | undefined
    | {
        cartographicDimensions: {
          rightDemention: Cartographic;
          leftDemention: Cartographic;
          topDemention: Cartographic;
          bottomDemention: Cartographic;
        };
        cartesianArray: Cartesian3[];
      } => {
    const viewer = cesium.current?.cesiumElement;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !property?.cameraLimiter ||
      !property?.cameraLimiter.cameraLimitterTargetArea ||
      !geodsic
    )
      return undefined;
    const {
      cameraLimitterTargetWidth: width = targetWidth,
      cameraLimitterTargetLength: length = targetLength,
    } = property?.cameraLimiter ?? {};

    const { cartesianArray, cartographicDimensions } = calcBoundaryBox(
      geodsic,
      length / 2,
      width / 2,
    );

    return {
      cartographicDimensions,
      cartesianArray,
    };
  }, [property?.cameraLimiter, geodsic]);

  // calculate maximum camera view (outer boundaries)
  const [cameraViewOuterBoundaries, setCameraViewOuterBoundaries] = useState<
    Cartesian3[] | undefined
  >();

  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !property?.cameraLimiter?.cameraLimitterTargetArea ||
      !geodsic
    )
      return;

    const camera = new CesiumCamera(viewer.scene);
    camera.setView({
      destination: Cartesian3.fromDegrees(
        property.cameraLimiter.cameraLimitterTargetArea.lng,
        property.cameraLimiter.cameraLimitterTargetArea.lat,
        property.cameraLimiter.cameraLimitterTargetArea.height,
      ),
      orientation: {
        heading: property?.cameraLimiter?.cameraLimitterTargetArea.heading,
        pitch: property?.cameraLimiter?.cameraLimitterTargetArea.pitch,
        roll: property?.cameraLimiter?.cameraLimitterTargetArea.roll,
        up: camera.up,
      },
    });

    const computedViewRectangle = camera.computeViewRectangle();
    if (!computedViewRectangle) return;
    const rectangleHalfWidth = Rectangle.computeWidth(computedViewRectangle) * Math.PI * 1000000;
    const rectangleHalfHeight = Rectangle.computeHeight(computedViewRectangle) * Math.PI * 1000000;

    const {
      cameraLimitterTargetWidth: width = targetWidth,
      cameraLimitterTargetLength: length = targetLength,
    } = property?.cameraLimiter ?? {};

    const { cartesianArray } = calcBoundaryBox(
      geodsic,
      length / 2 + rectangleHalfHeight,
      width / 2 + rectangleHalfWidth,
    );

    setCameraViewOuterBoundaries(cartesianArray);
  }, [property?.cameraLimiter, geodsic, camera]);

  // Manage camera limiter conditions
  useEffect(() => {
    const camera = getCamera(cesium?.current?.cesiumElement);
    const viewer = cesium?.current?.cesiumElement;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !property?.cameraLimiter?.cameraLimitterEnabled ||
      !limiterDimensions
    )
      return;
    if (camera) {
      const cameraPosition = Cartographic.fromDegrees(camera?.lng, camera?.lat, camera?.height);

      const destination = new Cartographic(
        Math.clamp(
          cameraPosition.longitude,
          limiterDimensions.cartographicDimensions.leftDemention.longitude,
          limiterDimensions.cartographicDimensions.rightDemention.longitude,
        ),
        Math.clamp(
          cameraPosition.latitude,
          limiterDimensions.cartographicDimensions.bottomDemention.latitude,
          limiterDimensions.cartographicDimensions.topDemention.latitude,
        ),
        cameraPosition.height,
      );

      viewer.camera.setView({
        destination: Cartographic.toCartesian(destination),
        orientation: {
          heading: viewer.camera.heading,
          pitch: viewer.camera.pitch,
          roll: viewer.camera.roll,
          up: viewer.camera.up,
        },
      });
    }
  }, [camera, property?.cameraLimiter, limiterDimensions]);

  // manage layer selection
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const entity = findEntity(viewer, selectedLayerId);
    if (viewer.selectedEntity === entity || (entity && !isSelectable(entity))) return;
    viewer.selectedEntity = entity;
  }, [cesium, selectedLayerId]);

  const handleClick = useCallback(
    (_: CesiumMovementEvent, target: RootEventTarget) => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return;

      if (target && "id" in target && target.id instanceof Entity && isSelectable(target.id)) {
        onLayerSelect?.(target.id.id);
        return;
      }

      if (target && target instanceof Cesium3DTileFeature) {
        const layerId: string | undefined = (target.primitive as any)?.[layerIdField];
        if (layerId) {
          onLayerSelect?.(layerId, {
            overriddenInfobox: {
              title: target.getProperty("name"),
              content: tileProperties(target),
            },
          });
        }
        return;
      }

      onLayerSelect?.();
    },
    [onLayerSelect],
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

  // enable Drag and Drop Layers
  const handleLayerDrag = useCallback(
    (e: Entity, position: Cartesian3 | undefined, _context: Context): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed() || !isSelectable(e) || !isDraggable(e)) return false;

      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      if (!pos) return false;

      onLayerDrag?.(e.id, pos);
    },
    [onLayerDrag],
  );

  const handleLayerDrop = useCallback(
    (e: Entity, position: Cartesian3 | undefined): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return false;

      const key = isDraggable(e);
      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      onLayerDrop?.(e.id, key || "", pos);

      return false; // let apollo-client handle optimistic updates
    },
    [onLayerDrop],
  );

  const cesiumDnD = useRef<CesiumDnD>();
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;
    cesiumDnD.current = new CesiumDnD(viewer, {
      onDrag: handleLayerDrag,
      onDrop: handleLayerDrop,
      dragDelay: 1000,
      initialDisabled: !isLayerDraggable,
    });
    return () => {
      if (!viewer || viewer.isDestroyed()) return;
      cesiumDnD.current?.disable();
    };
  }, [handleLayerDrag, handleLayerDrop, isLayerDraggable]);

  return {
    terrainProvider,
    terrainProperty,
    backgroundColor,
    imageryLayers,
    cesium,
    limiterDimensions,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
    handleMount,
    handleUnmount,
    handleClick,
    handleCameraMoveEnd,
  };
};

function calcBoundaryBox(
  geodsic: { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic },
  halfLength: number,
  halfWidth: number,
): {
  cartographicDimensions: {
    rightDemention: Cartographic;
    leftDemention: Cartographic;
    topDemention: Cartographic;
    bottomDemention: Cartographic;
  };
  cartesianArray: Cartesian3[];
} {
  const topDemention = geodsic.geodesicVertical.interpolateUsingSurfaceDistance(halfLength);
  const bottomDemention = geodsic.geodesicVertical.interpolateUsingSurfaceDistance(-halfLength);
  const rightDemention = geodsic.geodesicHorizontal.interpolateUsingSurfaceDistance(halfWidth);
  const leftDemention = geodsic.geodesicHorizontal.interpolateUsingSurfaceDistance(-halfWidth);

  const rightTop = new Cartographic(rightDemention.longitude, topDemention.latitude, 0);
  const leftTop = new Cartographic(leftDemention.longitude, topDemention.latitude, 0);
  const rightBottom = new Cartographic(rightDemention.longitude, bottomDemention.latitude, 0);
  const leftBottom = new Cartographic(leftDemention.longitude, bottomDemention.latitude, 0);
  return {
    cartographicDimensions: {
      rightDemention,
      leftDemention,
      topDemention,
      bottomDemention,
    },
    cartesianArray: [
      Cartographic.toCartesian(rightTop),
      Cartographic.toCartesian(leftTop),
      Cartographic.toCartesian(leftBottom),
      Cartographic.toCartesian(rightBottom),
      Cartographic.toCartesian(rightTop),
    ],
  };
}

function tileProperties(t: Cesium3DTileFeature): { key: string; value: any }[] {
  return t
    .getPropertyNames()
    .reduce<{ key: string; value: any }[]>(
      (a, b) => [...a, { key: b, value: t.getProperty(b) }],
      [],
    );
}

const cameraViewBoundariesMaterial = new PolylineDashMaterialProperty({
  color: Color.RED,
});

function findEntity(viewer: CesiumViewer, layerId: string | undefined): Entity | undefined {
  let entity: Entity | undefined;
  if (layerId) {
    entity = viewer.entities.getById(layerId);
    if (!entity) {
      for (let i = 0; i < viewer.dataSources.length; i++) {
        const e = viewer.dataSources.get(i).entities.getById(layerId);
        if (e) {
          entity = e;
          break;
        }
      }
    }
  }
  return entity;
}
