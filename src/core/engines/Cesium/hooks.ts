import {
  Color,
  Entity,
  Cesium3DTileFeature,
  Cartesian3,
  Ion,
  Cesium3DTileset,
  JulianDate,
  Cesium3DTilePointFeature,
  Model,
  Cartographic,
  SunLight,
  DirectionalLight,
} from "cesium";
import type { Viewer as CesiumViewer } from "cesium";
import CesiumDnD, { Context } from "cesium-dnd";
import { isEqual } from "lodash-es";
import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import type { CesiumComponentRef, CesiumMovementEvent, RootEventTarget } from "resium";
import { useCustomCompareCallback } from "use-custom-compare";

import { e2eAccessToken, setE2ECesiumViewer } from "@reearth/config";
import { ComputedFeature, DataType, SelectedFeatureInfo } from "@reearth/core/mantle";
import { LayersRef } from "@reearth/core/Map";

import type {
  Camera,
  LatLng,
  LayerSelectionReason,
  EngineRef,
  SceneProperty,
  MouseEvent,
  MouseEvents,
  LayerEditEvent,
} from "..";

import { useCameraLimiter } from "./cameraLimiter";
import { getCamera, isDraggable, isSelectable, getLocationFromScreen } from "./common";
import { getTag, type Context as FeatureContext } from "./Feature";
import { InternalCesium3DTileFeature } from "./types";
import useEngineRef from "./useEngineRef";
import { convertCartesian3ToPosition, findEntity, getEntityContent } from "./utils";

export default ({
  ref,
  property,
  camera,
  selectedLayerId,
  selectionReason,
  isLayerDraggable,
  meta,
  layersRef,
  onLayerSelect,
  onCameraChange,
  onLayerDrag,
  onLayerDrop,
  onLayerEdit,
}: {
  ref: React.ForwardedRef<EngineRef>;
  property?: SceneProperty;
  camera?: Camera;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  layersRef?: RefObject<LayersRef>;
  selectionReason?: LayerSelectionReason;
  isLayerDraggable?: boolean;
  meta?: Record<string, unknown>;
  onLayerSelect?: (
    layerId?: string,
    featureId?: string,
    options?: LayerSelectionReason,
    info?: SelectedFeatureInfo,
  ) => void;
  onCameraChange?: (camera: Camera) => void;
  onLayerDrag?: (layerId: string, featureId: string | undefined, position: LatLng) => void;
  onLayerDrop?: (
    layerId: string,
    featureId: string | undefined,
    position: LatLng | undefined,
  ) => void;
  onLayerEdit?: (e: LayerEditEvent) => void;
}) => {
  const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const cesiumIonDefaultAccessToken =
    typeof meta?.cesiumIonAccessToken === "string" && meta.cesiumIonAccessToken
      ? meta.cesiumIonAccessToken
      : Ion.defaultAccessToken;
  const cesiumIonAccessToken = property?.default?.ion || cesiumIonDefaultAccessToken;

  // expose ref
  const engineAPI = useEngineRef(ref, cesium);

  const backgroundColor = useMemo(
    () =>
      property?.default?.bgcolor ? Color.fromCssColorString(property.default.bgcolor) : undefined,
    [property?.default?.bgcolor],
  );

  const light = useMemo(() => {
    let light;
    if (property?.light?.type === "sunLight") {
      light = new SunLight({
        color: property.light?.color ? Color.fromCssColorString(property.light.color) : undefined,
        intensity: property.light?.intensity,
      });
    } else if (property?.light?.type === "directionalLight") {
      light = new DirectionalLight({
        direction: new Cartesian3(
          property?.light?.direction_x ?? 1,
          property?.light?.direction_y ?? 0,
          property?.light?.direction_z ?? 0,
        ),
        color: property.light?.color ? Color.fromCssColorString(property.light.color) : undefined,
        intensity: property.light?.intensity,
      });
    }
    return light;
  }, [
    property?.light?.type,
    property?.light?.color,
    property?.light?.direction_x,
    property?.light?.direction_y,
    property?.light?.direction_z,
    property?.light?.intensity,
  ]);

  useEffect(() => {
    engineAPI.changeSceneMode(property?.default?.sceneMode, 0);
  }, [property?.default?.sceneMode, engineAPI]);

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

  // cache the camera data emitted from viewer camera change
  const emittedCamera = useRef<Camera[]>([]);
  const updateCamera = useCallback(() => {
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !onCameraChange) return;

    const c = getCamera(viewer);
    if (c && !isEqual(c, camera)) {
      emittedCamera.current.push(c);
      // The state change is not sync now. This number is how many state updates can actually happen to be merged within one re-render.
      if (emittedCamera.current.length > 10) {
        emittedCamera.current.shift();
      }
      onCameraChange?.(c);
    }
  }, [camera, onCameraChange]);

  const handleCameraChange = useCallback(() => {
    updateCamera();
  }, [updateCamera]);

  const handleCameraMoveEnd = useCallback(() => {
    updateCamera();
  }, [updateCamera]);

  useEffect(() => {
    if (camera && !emittedCamera.current.includes(camera)) {
      engineAPI.flyTo(camera, { duration: 0 });
      emittedCamera.current = [];
    }
  }, [camera, engineAPI]);

  const prevSelectedEntity = useRef<Entity | Cesium3DTileset | InternalCesium3DTileFeature>();
  // manage layer selection
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const prevTag = getTag(prevSelectedEntity.current);
    if (
      (!prevTag?.featureId &&
        prevTag?.layerId &&
        selectedLayerId?.layerId &&
        prevTag?.layerId === selectedLayerId.layerId) ||
      (prevTag?.featureId &&
        selectedLayerId?.featureId &&
        prevTag?.featureId === selectedLayerId.featureId)
    )
      return;

    const entity =
      findEntity(viewer, undefined, selectedLayerId?.featureId) ||
      findEntity(viewer, selectedLayerId?.layerId);
    if (!entity || entity instanceof Entity) {
      viewer.selectedEntity = entity;
    }
    if (prevSelectedEntity.current === entity) return;
    prevSelectedEntity.current = entity;

    if (!entity && selectedLayerId?.featureId) {
      // Find ImageryLayerFeature
      const ImageryLayerDataTypes: DataType[] = ["mvt"];
      const layers = layersRef?.current?.findAll(
        layer =>
          layer.type === "simple" &&
          !!layer.data?.type &&
          ImageryLayerDataTypes.includes(layer.data?.type),
      );

      if (layers?.length) {
        // TODO: Get ImageryLayerFeature from `viewer.imageryLayers`.(But currently didn't find the way)
        const [feature, layerId] =
          ((): [ComputedFeature, string] | void => {
            for (const layer of layers) {
              const f = layer.computed?.features.find(
                feature => feature.id !== selectedLayerId?.featureId,
              );
              if (f) {
                return [f, layer.id];
              }
            }
          })() || [];
        onLayerSelect?.(layerId, feature?.id);
      }
    }

    const tag = getTag(entity);
    if (tag?.unselectable) return;

    if (entity && entity instanceof Cesium3DTileFeature) {
      const tag = getTag(entity);
      if (tag) {
        const content = tileProperties(entity);
        onLayerSelect?.(
          tag.layerId,
          String(tag.featureId),
          content.length
            ? {
                defaultInfobox: {
                  title: entity.getProperty("name"),
                  content: {
                    type: "table",
                    value: content,
                  },
                },
              }
            : undefined,
          { feature: tag.computedFeature },
        );
      }
      return;
    }

    if (entity) {
      const layer = tag?.layerId
        ? layersRef?.current?.overriddenLayers().find(l => l.id === tag.layerId) ??
          layersRef?.current?.findById(tag.layerId)
        : undefined;
      // Sometimes only featureId is specified, so we need to sync entity tag.
      onLayerSelect?.(
        tag?.layerId,
        tag?.featureId,
        entity instanceof Entity && (entity.description || entity.properties)
          ? {
              defaultInfobox: {
                title: entity.name,
                content: getEntityContent(
                  entity,
                  cesium.current?.cesiumElement?.clock.currentTime ?? new JulianDate(),
                  tag?.layerId ? layer?.infobox?.property?.default?.defaultContent : undefined,
                ),
              },
            }
          : undefined,
      );
    }
  }, [cesium, selectedLayerId, onLayerSelect, layersRef]);

  const handleMouseEvent = useCallback(
    (type: keyof MouseEvents, e: CesiumMovementEvent, target: RootEventTarget) => {
      if (engineAPI.mouseEventCallbacks[type]) {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const position = e.position || e.startPosition;
        const props: MouseEvent = {
          x: position?.x,
          y: position?.y,
          ...(position
            ? getLocationFromScreen(viewer.scene, position.x, position.y, true) ?? {}
            : {}),
        };
        const layerId = getLayerId(target);
        if (layerId) props.layerId = layerId;
        engineAPI.mouseEventCallbacks[type]?.(props);
      }
    },
    [engineAPI],
  );

  const handleMouseWheel = useCallback(
    (delta: number) => {
      engineAPI.mouseEventCallbacks.wheel?.({ delta });
    },
    [engineAPI],
  );

  const mouseEventHandles = useMemo(() => {
    const mouseEvents: { [index in keyof MouseEvents]: undefined | any } = {
      click: undefined,
      doubleclick: undefined,
      mousedown: undefined,
      mouseup: undefined,
      rightclick: undefined,
      rightdown: undefined,
      rightup: undefined,
      middleclick: undefined,
      middledown: undefined,
      middleup: undefined,
      mousemove: undefined,
      mouseenter: undefined,
      mouseleave: undefined,
      wheel: undefined,
    };
    (Object.keys(mouseEvents) as (keyof MouseEvents)[]).forEach(type => {
      mouseEvents[type] =
        type === "wheel"
          ? (delta: number) => {
              handleMouseWheel(delta);
            }
          : (e: CesiumMovementEvent, target: RootEventTarget) => {
              handleMouseEvent(type as keyof MouseEvents, e, target);
            };
    });
    return mouseEvents;
  }, [handleMouseEvent, handleMouseWheel]);

  const handleClick = useCallback(
    async (e: CesiumMovementEvent, target: RootEventTarget) => {
      mouseEventHandles.click?.(e, target);
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return;

      if (target && "id" in target && target.id instanceof Entity && isSelectable(target.id)) {
        const tag = getTag(target.id);
        const layer = tag?.layerId
          ? layersRef?.current?.overriddenLayers().find(l => l.id === tag.layerId) ??
            layersRef?.current?.findById(tag.layerId)
          : undefined;
        onLayerSelect?.(
          tag?.layerId,
          tag?.featureId,
          !!target.id.description || !!target.id.properties
            ? {
                defaultInfobox: {
                  title: layer?.title ?? target.id.name,
                  content: getEntityContent(
                    target.id,
                    viewer.clock.currentTime ?? new JulianDate(),
                    tag?.layerId ? layer?.infobox?.property?.default?.defaultContent : undefined,
                  ),
                },
              }
            : undefined,
        );
        prevSelectedEntity.current = target.id;
        viewer.selectedEntity = target.id;
        return;
      }

      if (
        target &&
        (target instanceof Cesium3DTileFeature || target instanceof Cesium3DTilePointFeature)
      ) {
        const tag = getTag(target);
        if (tag) {
          const content = tileProperties(target);
          onLayerSelect?.(
            tag.layerId,
            String(tag.featureId),
            content.length
              ? {
                  defaultInfobox: {
                    title: target.getProperty("name"),
                    content: {
                      type: "table",
                      value: tileProperties(target),
                    },
                  },
                }
              : undefined,
            { feature: tag.computedFeature },
          );
          prevSelectedEntity.current = target;
        }
        return;
      }

      if (
        target &&
        "content" in target &&
        target.content &&
        typeof target.content === "object" &&
        "_model" in target.content &&
        target.content._model instanceof Model
      ) {
        const model = target.content._model;
        const tag = getTag(model);
        if (tag) {
          onLayerSelect?.(tag.layerId, String(tag.featureId));
          prevSelectedEntity.current = model;
        }
        return;
      }

      // Check imagery layer
      // ref: https://github.com/CesiumGS/cesium/blob/96b978e0c53aba3bc4f1191111e0be61781ae9dd/packages/widgets/Source/Viewer/Viewer.js#L167
      if (target === undefined && e.position) {
        const scene = viewer.scene;
        const pickRay = scene.camera.getPickRay(e.position);

        if (pickRay) {
          const l = await scene.imageryLayers.pickImageryLayerFeatures(pickRay, scene);
          if (l && !!l.length) {
            l.map(f => {
              const pos = f.position;
              if (pos) {
                // NOTE: Instantiate temporal Cesium.Entity to display indicator.
                // Although we want to use `viewer.selectionIndicator.viewModel.position` and `animateAppear`, Cesium reset selection position if `viewer.selectedEntity` is not set.
                // ref: https://github.com/CesiumGS/cesium/blob/9295450e64c3077d96ad579012068ea05f97842c/packages/widgets/Source/Viewer/Viewer.js#L1843-L1876
                // issue: https://github.com/CesiumGS/cesium/issues/7965
                requestAnimationFrame(() => {
                  viewer.selectedEntity = new Entity({
                    position: Cartographic.toCartesian(pos),
                  });
                });
              }

              const tag = getTag(f.imageryLayer);
              const layer = tag?.layerId
                ? layersRef?.current?.overriddenLayers().find(l => l.id === tag.layerId) ??
                  layersRef?.current?.findById(tag.layerId)
                : undefined;
              const content = getEntityContent(
                f.data.feature ?? f,
                viewer.clock.currentTime ?? new JulianDate(),
                tag?.layerId ? layer?.infobox?.property?.default?.defaultContent : undefined,
              );
              onLayerSelect?.(
                f.data.layerId,
                f.data.featureId,
                content.value.length
                  ? {
                      defaultInfobox: {
                        title: layer?.title ?? f.name,
                        content,
                      },
                    }
                  : undefined,
                {
                  feature: f.data.feature,
                },
              );
            });
            return;
          }
        }
      }

      viewer.selectedEntity = undefined;
      onLayerSelect?.();
    },
    [onLayerSelect, mouseEventHandles, layersRef],
  );

  // E2E test
  useEffect(() => {
    if (e2eAccessToken()) {
      setE2ECesiumViewer(cesium.current?.cesiumElement);
      return () => {
        setE2ECesiumViewer(undefined);
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

  const handleUpdate = useCallback(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.scene.requestRender();
  }, []);

  // enable Drag and Drop Layers
  const handleLayerDrag = useCallback(
    (e: Entity, position: Cartesian3 | undefined, _context: Context): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed() || !isSelectable(e) || !isDraggable(e)) return false;

      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      if (!pos) return false;

      const tag = getTag(e);
      if (!tag) return false;

      onLayerDrag?.(tag.layerId || "", tag.featureId, pos);
    },
    [onLayerDrag],
  );

  const handleLayerDrop = useCallback(
    (e: Entity, position: Cartesian3 | undefined): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return false;

      const tag = getTag(e);
      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      onLayerDrop?.(tag?.layerId || "", tag?.featureId || "", pos);

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
  const { cameraViewBoundaries, cameraViewOuterBoundaries, cameraViewBoundariesMaterial } =
    useCameraLimiter(cesium, camera, property?.cameraLimiter);

  const context = useMemo<FeatureContext>(
    () => ({
      selectionReason,
      flyTo: engineAPI.flyTo,
      getCamera: engineAPI.getCamera,
      onLayerEdit,
    }),
    [selectionReason, engineAPI, onLayerEdit],
  );

  const handleTick = useCallback(
    (d: Date, clock: { start: Date; stop: Date }) => {
      engineAPI.tickEventCallback?.current?.forEach(e => e(d, clock));
    },
    [engineAPI],
  );

  return {
    backgroundColor,
    cesium,
    cameraViewBoundaries,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
    cesiumIonAccessToken,
    mouseEventHandles,
    context,
    light,
    handleMount,
    handleUnmount,
    handleUpdate,
    handleClick,
    handleCameraChange,
    handleCameraMoveEnd,
    handleTick,
  };
};

function tileProperties(
  t: Cesium3DTileFeature | Cesium3DTilePointFeature,
): { key: string; value: any }[] {
  return t
    .getPropertyIds()
    .reduce<{ key: string; value: any }[]>(
      (a, b) => [...a, { key: b, value: t.getProperty(b) }],
      [],
    );
}

function getLayerId(target: RootEventTarget): string | undefined {
  if (target && "id" in target && target.id instanceof Entity) {
    return getTag(target.id)?.layerId;
  } else if (target && target instanceof Cesium3DTileFeature) {
    return getTag(target.tileset)?.layerId;
  }
  return undefined;
}
