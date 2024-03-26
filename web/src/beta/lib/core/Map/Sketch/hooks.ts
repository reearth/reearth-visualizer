import { feature } from "@turf/helpers";
import { useMachine } from "@xstate/react";
import { Feature as GeojsonFeature, MultiPolygon, Polygon, Point, LineString } from "geojson";
import { cloneDeep, merge } from "lodash-es";
import {
  ForwardedRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import invariant from "tiny-invariant";
import { v4 as uuidv4 } from "uuid";

import { InteractionModeType } from "../../Crust";
import { LayerSimple, LazyLayer } from "../Layers";
import {
  Feature,
  EngineRef,
  LayersRef,
  MouseEventCallback,
  MouseEventProps,
  SketchRef,
} from "../types";

import { PRESET_APPEARANCE } from "./preset";
import { Position3d, createSketchMachine } from "./sketchMachine";
import {
  GeometryOptionsXYZ,
  SketchType,
  SketchFeature,
  SketchAppearance,
  SketchEventProps,
} from "./types";
import { useWindowEvent } from "./utils";

import { OnLayerSelectType } from ".";

export type SketchFeatureCallback = (
  feature: GeojsonFeature<Polygon | MultiPolygon | Point | LineString> | null,
) => void;

type Props = {
  ref: ForwardedRef<SketchRef>;
  layersRef: RefObject<LayersRef>;
  engineRef: RefObject<EngineRef>;
  interactionMode: InteractionModeType;
  selectedFeature?: Feature;
  overrideInteractionMode?: (mode: InteractionModeType) => void;
  onSketchTypeChange?: (type: SketchType | undefined, from?: "editor" | "plugin") => void;
  onSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  onPluginSketchFeatureCreated?: (props: SketchEventProps) => void;
  onLayerSelect?: OnLayerSelectType;
};

const PLUGIN_LAYER_ID_LENGTH = 36;

const sketchMachine = createSketchMachine();

export default function useHooks({
  ref,
  engineRef,
  layersRef,
  selectedFeature,
  overrideInteractionMode,
  onSketchTypeChange,
  onSketchFeatureCreate,
  onPluginSketchFeatureCreated,
  onLayerSelect,
}: Props) {
  const [state, send] = useMachine(sketchMachine);
  const [type, updateType] = useState<SketchType | undefined>();
  const [from, updateFrom] = useState<"editor" | "plugin">("editor");
  const [color, updateColor] = useState<string>();
  const [disableShadow, updateDisableShadow] = useState(false);
  const [enableRelativeHeight, updateEnableRelativeHeight] = useState(false);
  const [disableInteraction, setDisableInteraction] = useState(false);
  const [defaultAppearance, updateDefaultAppearance] = useState<SketchAppearance | undefined>(
    PRESET_APPEARANCE,
  );
  const createDataOnlyForPluginEnabledRef = useRef(false);
  const allowRightClickToAbortEnabledRef = useRef(true);
  const allowAutoResetInteractionModeRef = useRef(true);

  const [geometryOptions, setGeometryOptions] = useState<GeometryOptionsXYZ | null>(null);
  const [extrudedHeight, setExtrudedHeight] = useState(0);
  const markerGeometryRef = useRef<GeometryOptionsXYZ | null>(null);
  const pointerLocationRef = useRef<[lng: number, lat: number, height: number]>();

  const setType = useCallback((type: SketchType | undefined, from?: "editor" | "plugin") => {
    updateType(type);
    updateFrom(from ?? "editor");
  }, []);

  const setColor = useCallback((color: string) => {
    updateColor(color);
  }, []);

  const setDisableShadow = useCallback((disable: boolean) => {
    updateDisableShadow(!!disable);
  }, []);

  const setEnableRelativeHeight = useCallback((enable: boolean) => {
    updateEnableRelativeHeight(!!enable);
  }, []);

  const setDefaultAppearance = useCallback((appearance: SketchAppearance) => {
    updateDefaultAppearance(merge(cloneDeep(PRESET_APPEARANCE), appearance));
  }, []);

  const createDataOnly = useCallback((dataOnly: boolean) => {
    createDataOnlyForPluginEnabledRef.current = !!dataOnly;
  }, []);

  const allowRightClickToAbort = useCallback((allow: boolean) => {
    allowRightClickToAbortEnabledRef.current = !!allow;
  }, []);

  const allowAutoResetInteractionMode = useCallback((allow: boolean) => {
    allowAutoResetInteractionModeRef.current = !!allow;
  }, []);

  const createFeature = useCallback(() => {
    const geoOptions = type === "marker" ? markerGeometryRef.current : geometryOptions;
    if (geoOptions == null) {
      return null;
    }
    const geometry = engineRef.current?.createGeometry(geoOptions);
    if (geometry == null || (type !== "polyline" && geometry.type === "LineString")) {
      return null;
    }
    return feature(geometry, {
      id: uuidv4(),
      type: geoOptions.type,
      positions: geoOptions.controlPoints,
      extrudedHeight,
    });
  }, [extrudedHeight, geometryOptions, markerGeometryRef, type, engineRef]);

  const updateGeometryOptions = useCallback(
    (controlPoint?: Position3d) => {
      setExtrudedHeight(0);
      if (state.context.type == null || state.context.controlPoints == null) {
        setGeometryOptions(null);
        return;
      }
      setGeometryOptions({
        type: state.context.type,
        controlPoints:
          controlPoint != null
            ? [...state.context.controlPoints, controlPoint]
            : state.context.controlPoints,
      });
    },
    [state, setGeometryOptions, setExtrudedHeight],
  );

  const pluginSketchLayerCreate = useCallback(
    (feature: SketchFeature) => {
      const newLayer = layersRef.current?.add({
        type: "simple",
        data: {
          type: "geojson",
          isSketchLayer: true,
          value: {
            type: "FeatureCollection",
            features: [{ ...feature, id: feature.properties.id }],
          },
        },
        ...defaultAppearance,
      });
      return { layerId: newLayer?.id, featureId: feature.properties.id };
    },
    [layersRef, defaultAppearance],
  );

  const pluginSketchLayerFeatureAdd = useCallback(
    (layer: LazyLayer, feature: SketchFeature) => {
      if (layer.type !== "simple") return {};
      layersRef.current?.override(layer.id, {
        data: {
          ...layer.data,
          type: "geojson",
          value: {
            type: "FeatureCollection",
            features: [
              ...((layer.computed?.layer as LayerSimple)?.data?.value?.features ?? []),
              { ...feature, id: feature.properties.id },
            ],
          },
        },
      });
      return { layerId: layer.id, featureId: feature.properties.id };
    },
    [layersRef],
  );

  const pluginSketchLayerFeatureRemove = useCallback(
    (layer: LazyLayer, featureId: string) => {
      if (layer.type !== "simple" || layer.computed?.layer.type !== "simple") return;
      layersRef.current?.override(layer.id, {
        data: {
          ...layer.data,
          type: "geojson",
          value: {
            type: "FeatureCollection",
            features: [
              ...(layer.computed?.layer?.data?.value?.features ?? []).filter(
                (feature: GeojsonFeature) => feature.id !== featureId,
              ),
            ],
          },
        },
      });
    },
    [layersRef],
  );

  const handleFeatureCreate = useCallback(
    (feature: SketchFeature) => {
      updateType(undefined);
      if (from === "editor") {
        onSketchFeatureCreate?.(feature);
        return;
      }

      if (!createDataOnlyForPluginEnabledRef.current) {
        const selectedLayer = layersRef.current?.selectedLayer();
        const { layerId, featureId } =
          selectedLayer?.id?.length !== PLUGIN_LAYER_ID_LENGTH ||
          selectedLayer.type !== "simple" ||
          selectedLayer.computed?.layer.type !== "simple"
            ? pluginSketchLayerCreate(feature)
            : pluginSketchLayerFeatureAdd(selectedLayer, feature);

        if (layerId && featureId) {
          requestAnimationFrame(() => {
            onLayerSelect?.(
              layerId,
              featureId,
              layerId
                ? () =>
                    new Promise(resolve => {
                      // Wait until computed feature is ready
                      queueMicrotask(() => {
                        resolve(layersRef.current?.findById?.(layerId)?.computed);
                      });
                    })
                : undefined,
              undefined,
              undefined,
            );
          });
          onPluginSketchFeatureCreated?.({ layerId, featureId, feature });
        }
      } else {
        onPluginSketchFeatureCreated?.({ feature });
      }
    },
    [
      layersRef,
      from,
      pluginSketchLayerCreate,
      pluginSketchLayerFeatureAdd,
      onSketchFeatureCreate,
      onPluginSketchFeatureCreated,
      onLayerSelect,
    ],
  );

  const handleLeftDown = useCallback(
    (props: MouseEventProps) => {
      if (
        disableInteraction ||
        !type ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined ||
        props.x === undefined ||
        props.y === undefined
      ) {
        return;
      }
      if (!state.matches("idle")) {
        return;
      }
      invariant(state.context.lastControlPoint == null);
      const controlPoint = engineRef.current?.toXYZ(props.lng, props.lat, props.height);
      if (controlPoint == null) {
        return;
      }

      send({
        type: {
          marker: "MARKER" as const,
          polyline: "POLYLINE" as const,
          circle: "CIRCLE" as const,
          rectangle: "RECTANGLE" as const,
          polygon: "POLYGON" as const,
          extrudedCircle: "EXTRUDED_CIRCLE" as const,
          extrudedRectangle: "EXTRUDED_RECTANGLE" as const,
          extrudedPolygon: "EXTRUDED_POLYGON" as const,
        }[type],
        pointerPosition: [props.x, props.y],
        controlPoint,
      });
      setGeometryOptions(null);
      markerGeometryRef.current = null;
    },
    [state, disableInteraction, type, engineRef, send],
  );

  const handleMouseMove = useCallback(
    (props: MouseEventProps) => {
      if (
        disableInteraction ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined ||
        props.x === undefined ||
        props.y === undefined ||
        !engineRef.current
      ) {
        return;
      }
      pointerLocationRef.current = [props.lng, props.lat, props.height];
      if (state.matches("drawing")) {
        invariant(state.context.type != null);
        invariant(state.context.controlPoints != null);
        const controlPoint = engineRef.current?.toXYZ(props.lng, props.lat, props.height);
        if (
          controlPoint == null ||
          hasDuplicate(engineRef.current.equalsEpsilon3d, controlPoint, state.context.controlPoints)
        ) {
          return;
        }
        updateGeometryOptions(controlPoint);
      } else if (state.matches("extruding")) {
        invariant(state.context.lastControlPoint != null);
        const extrudedHeight = engineRef.current?.getExtrudedHeight(
          state.context.lastControlPoint,
          [props.x, props.y],
        );
        if (extrudedHeight != null) {
          setExtrudedHeight(extrudedHeight);
        }
      }
    },
    [disableInteraction, state, engineRef, updateGeometryOptions, setExtrudedHeight],
  );

  const handleLeftUp = useCallback(
    (props: MouseEventProps) => {
      if (
        disableInteraction ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined ||
        props.x === undefined ||
        props.y === undefined ||
        !engineRef.current
      ) {
        return;
      }
      if (
        state.context.controlPoints?.length === 1 &&
        state.context.lastPointerPosition != null &&
        state.context.type !== "marker" &&
        engineRef.current?.equalsEpsilon2d(
          [props.x, props.y],
          state.context.lastPointerPosition,
          0,
          5,
        )
      ) {
        return; // Too close to the first position user clicked.
      }

      if (state.matches("drawing")) {
        const controlPoint = engineRef.current?.toXYZ(props.lng, props.lat, props.height);
        if (controlPoint == null) return;

        if (state.context.type === "marker") {
          markerGeometryRef.current = {
            type: state.context.type,
            controlPoints: [controlPoint],
          };
          const feature = createFeature();
          markerGeometryRef.current = null;
          if (feature == null) {
            return;
          }
          handleFeatureCreate(feature);
          send({ type: "CREATE" });
          setGeometryOptions(null);
          return;
        }
        if (
          hasDuplicate(
            engineRef.current?.equalsEpsilon3d,
            controlPoint,
            state.context.controlPoints,
          )
        ) {
          return;
        }
        if (
          state.context.type === "circle" ||
          (state.context.type === "rectangle" && state.context.controlPoints?.length === 2)
        ) {
          const feature = createFeature();
          if (feature == null) {
            return;
          }
          handleFeatureCreate(feature);
          send({ type: "CREATE" });
          setGeometryOptions(null);
          return;
        } else {
          if (props.x === undefined || props.y === undefined) return;
          send({
            type: "NEXT",
            pointerPosition: [props.x, props.y],
            controlPoint,
          });
        }
      } else if (state.matches("extruding")) {
        const feature = createFeature();
        if (feature == null) {
          return;
        }
        handleFeatureCreate(feature);
        send({ type: "CREATE" });
        setGeometryOptions(null);
      }
    },
    [
      disableInteraction,
      state,
      engineRef,
      send,
      setGeometryOptions,
      createFeature,
      handleFeatureCreate,
    ],
  );

  const handleDoubleClick = useCallback(
    (props: MouseEventProps) => {
      if (
        disableInteraction ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined ||
        props.x === undefined ||
        props.y === undefined
      ) {
        return;
      }
      if (state.matches("drawing.extrudedPolygon")) {
        const controlPoint = engineRef.current?.toXYZ(props.lng, props.lat, props.height);
        if (controlPoint == null) return;
        send({
          type: "EXTRUDE",
          pointerPosition: [props.x, props.y],
          controlPoint,
        });
      } else if (state.matches("drawing.polyline") || state.matches("drawing.polygon")) {
        const feature = createFeature();
        if (feature == null) {
          return;
        }
        handleFeatureCreate(feature);
        send({ type: "CREATE" });
        setGeometryOptions(null);
      }
    },
    [disableInteraction, state, engineRef, send, handleFeatureCreate, createFeature],
  );

  const handleRightClick = useCallback(() => {
    if (!allowRightClickToAbortEnabledRef.current) {
      return;
    }
    if (type !== undefined) {
      updateType(undefined);
    }
    if (state.matches("idle")) return;
    send({ type: "ABORT" });
    updateGeometryOptions(undefined);
  }, [type, state, send, updateGeometryOptions]);

  const mouseDownEventRef = useRef<MouseEventCallback>(handleLeftDown);
  mouseDownEventRef.current = handleLeftDown;
  const mouseMoveEventRef = useRef<MouseEventCallback>(handleMouseMove);
  mouseMoveEventRef.current = handleMouseMove;
  const mouseUpEventRef = useRef<MouseEventCallback>(handleLeftUp);
  mouseUpEventRef.current = handleLeftUp;
  const mouseDoubleClickEventRef = useRef<MouseEventCallback>(handleDoubleClick);
  mouseDoubleClickEventRef.current = handleDoubleClick;
  const mouseRightClickEventRef = useRef<() => void>(handleRightClick);
  mouseRightClickEventRef.current = handleRightClick;

  const onMouseDown = useCallback(
    (props: MouseEventProps) => {
      mouseDownEventRef.current?.(props);
    },
    [mouseDownEventRef],
  );

  const onMouseMove = useCallback(
    (props: MouseEventProps) => {
      mouseMoveEventRef.current?.(props);
    },
    [mouseMoveEventRef],
  );

  const onMouseUp = useCallback(
    (props: MouseEventProps) => {
      mouseUpEventRef.current?.(props);
    },
    [mouseUpEventRef],
  );

  const onMouseDoubleClick = useCallback(
    (props: MouseEventProps) => {
      mouseDoubleClickEventRef.current?.(props);
    },
    [mouseDoubleClickEventRef],
  );

  const onMouseRightClick = useCallback(() => {
    mouseRightClickEventRef.current?.();
  }, [mouseRightClickEventRef]);

  useEffect(() => {
    engineRef.current?.onMouseDown(onMouseDown);
    engineRef.current?.onMouseMove(onMouseMove);
    engineRef.current?.onMouseUp(onMouseUp);
    engineRef.current?.onDoubleClick(onMouseDoubleClick);
    engineRef.current?.onRightClick(onMouseRightClick);
  }, [engineRef, onMouseDown, onMouseMove, onMouseUp, onMouseDoubleClick, onMouseRightClick]);

  useWindowEvent("keydown", event => {
    if (type === undefined) return;
    if (event.code === "Space") {
      setDisableInteraction(true);
      overrideInteractionMode?.("move");
    } else {
      if (disableInteraction) {
        return;
      }
      if (event.key === "Escape") {
        send({ type: "CANCEL" });
        const controlPoint =
          pointerLocationRef.current != null
            ? engineRef.current?.toXYZ(...pointerLocationRef.current)
            : undefined;
        updateGeometryOptions(controlPoint);
      } else if (event.key === "Delete" && state.matches("idle") && selectedFeature?.id) {
        const selectedLayer = layersRef.current?.selectedLayer();
        if (selectedLayer?.id?.length === PLUGIN_LAYER_ID_LENGTH) {
          pluginSketchLayerFeatureRemove(selectedLayer, selectedFeature.id);
        }
      }
    }
  });

  useWindowEvent("keyup", event => {
    if (type === undefined) return;
    if (event.code === "Space") {
      overrideInteractionMode?.("sketch");
      setDisableInteraction(false);
    }
  });

  useEffect(() => {
    if (type === undefined) {
      send({ type: "ABORT" });
      updateGeometryOptions(undefined);
    }
  }, [type, send, updateGeometryOptions]);

  useEffect(() => {
    if (type) {
      overrideInteractionMode?.("sketch");
    } else if (allowAutoResetInteractionModeRef.current) {
      overrideInteractionMode?.("default");
    }

    onSketchTypeChange?.(type, from);
  }, [type, from, overrideInteractionMode, onSketchTypeChange]);

  useImperativeHandle(
    ref,
    () => ({
      setType,
      setColor,
      setDefaultAppearance,
      createDataOnly,
      disableShadow: setDisableShadow,
      enableRelativeHeight: setEnableRelativeHeight,
      allowRightClickToAbort,
      allowAutoResetInteractionMode,
    }),
    [
      setType,
      setColor,
      setDisableShadow,
      setEnableRelativeHeight,
      setDefaultAppearance,
      createDataOnly,
      allowRightClickToAbort,
      allowAutoResetInteractionMode,
    ],
  );

  return {
    state,
    extrudedHeight,
    geometryOptions,
    color,
    disableShadow,
    enableRelativeHeight,
  };
}

function hasDuplicate(
  equalFunction: (
    point1: Position3d,
    point2: Position3d,
    relativeEpsilon: number | undefined,
    absoluteEpsilon: number | undefined,
  ) => boolean,
  controlPoint: Position3d,
  controlPoints?: readonly Position3d[],
): boolean {
  return controlPoints?.some(another => equalFunction(controlPoint, another, 0, 1e-7)) === true;
}
