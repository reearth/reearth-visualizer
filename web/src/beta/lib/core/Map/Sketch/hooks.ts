// TODO: Refactor: move cesium related code to engine.
import { feature } from "@turf/helpers";
import { useMachine } from "@xstate/react";
import { Cartesian2, Cartesian3 } from "cesium";
import { Feature, MultiPolygon, Polygon, Point, LineString } from "geojson";
import {
  ForwardedRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import invariant from "tiny-invariant";
import { v4 as uuidv4 } from "uuid";

import { InteractionModeType } from "../../Crust";
import { EngineRef, LayersRef, MouseEventCallback, MouseEventProps, SketchRef } from "../types";

import { GeometryOptions, createGeometry } from "./createGeometry";
import { createSketchMachine } from "./sketchMachine";
import { SketchType } from "./types";
import { useWindowEvent } from "./utils";

export type SketchFeatureCallback = (
  feature: Feature<Polygon | MultiPolygon | Point | LineString> | null,
) => void;

type Props = {
  ref: ForwardedRef<SketchRef>;
  layersRef: RefObject<LayersRef>;
  engineRef: RefObject<EngineRef>;
  interactionMode: InteractionModeType;
};

const PLUGIN_LAYER_ID_LENGTH = 36;

const sketchMachine = createSketchMachine();

export default function useHooks({ ref, engineRef, layersRef, interactionMode }: Props) {
  const [state, send] = useMachine(sketchMachine);
  const [type, updateType] = useState<SketchType>();

  const disableInteraction = useMemo(() => interactionMode !== "sketch", [interactionMode]);

  const [geometryOptions, setGeometryOptions] = useState<GeometryOptions | null>(null);
  const [extrudedHeight, setExtrudedHeight] = useState(0);
  const markerGeometryRef = useRef<GeometryOptions | null>(null);
  const pointerPositionRef = useRef<Cartesian2>();
  const pointerLocationRef = useRef<[lng: number, lat: number, height: number]>();

  const onFeatureCreateRef = useRef<SketchFeatureCallback>();
  const onTypeChangeRef = useRef<(type: SketchType | undefined) => void>();

  const setType = useCallback(
    (type: SketchType) => {
      invariant(interactionMode === "sketch", 'Interaction mode must be "sketch"');
      updateType(type);
      onTypeChangeRef.current?.(type);
    },
    [interactionMode],
  );

  const createFeature = useCallback(() => {
    const geoOptions = type === "marker" ? markerGeometryRef.current : geometryOptions;
    if (geoOptions == null) {
      return null;
    }
    const geometry = createGeometry(geoOptions);
    if (geometry == null || (type !== "polyline" && geometry.type === "LineString")) {
      return null;
    }
    return feature(geometry, {
      id: uuidv4(),
      type: geoOptions.type,
      positions: geoOptions.controlPoints.map(({ x, y, z }): [number, number, number] => [x, y, z]),
      extrudedHeight,
    });
  }, [extrudedHeight, geometryOptions, markerGeometryRef, type]);

  const updateGeometryOptions = useCallback(
    (controlPoint?: Cartesian3) => {
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

  const onFeatureCreate = useCallback((cb: SketchFeatureCallback) => {
    onFeatureCreateRef.current = cb;
  }, []);

  const onTypeChange = useCallback((cb: (type: SketchType | undefined) => void) => {
    onTypeChangeRef.current = cb;
  }, []);

  const handleFeatureCreate = useCallback(
    (
      feature: Feature<
        Polygon | MultiPolygon | Point | LineString,
        {
          id: string;
          type: SketchType;
          positions: [number, number, number][];
          extrudedHeight: number;
        }
      > | null,
    ) => {
      const selectedLayer = layersRef.current?.selectedLayer();
      // Currently use id length to identify plugin layer
      // Plan to have a property to identify in the future
      if (
        selectedLayer?.id?.length === PLUGIN_LAYER_ID_LENGTH &&
        selectedLayer.type === "simple" &&
        selectedLayer.computed?.layer.type === "simple"
      ) {
        layersRef.current?.override(selectedLayer.id, {
          data: {
            ...selectedLayer.data,
            type: "geojson",
            value: {
              type: "FeatureCollection",
              features: [
                ...(selectedLayer.computed?.layer?.data?.value?.features ?? []),
                { ...feature, id: uuidv4() },
              ],
            },
          },
        });
      } else {
        onFeatureCreateRef.current?.(feature);
      }
    },
    [layersRef],
  );

  const handleLeftDown = useCallback(
    (props: MouseEventProps) => {
      console.log("handleLeftDown", props);

      if (
        disableInteraction ||
        !type ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined
      ) {
        return;
      }
      console.log("handleLeftDown-2");
      if (!state.matches("idle")) {
        return;
      }
      console.log("handleLeftDown-3");
      invariant(state.context.lastControlPoint == null);
      console.log("handleLeftDown-4");
      const controlPoint = new Cartesian3(
        ...(engineRef.current?.toXYZ(props.lng, props.lat, props.height) ?? []),
      );
      console.log("handleLeftDown-5", controlPoint);
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
        pointerPosition: new Cartesian2(props.x, props.y),
        controlPoint,
      });
      setGeometryOptions(null);
      markerGeometryRef.current = null;
      console.log("handleLeftDown-finish");
    },
    [state, disableInteraction, type, engineRef, send],
  );

  const handleMouseMove = useCallback(
    (props: MouseEventProps) => {
      // console.log("handleMouseMove", props);
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
      console.log("handleMouseMove-2");
      pointerPositionRef.current = new Cartesian2(props.x, props.y);
      pointerLocationRef.current = [props.lng, props.lat, props.height];

      if (state.matches("drawing")) {
        console.log("handleMouseMove-3");
        invariant(state.context.type != null);
        invariant(state.context.controlPoints != null);
        const controlPoint = new Cartesian3(
          ...(engineRef.current?.toXYZ(props.lng, props.lat, props.height) ?? []),
        );
        if (controlPoint == null || hasDuplicate(controlPoint, state.context.controlPoints)) {
          return;
        }
        updateGeometryOptions(controlPoint);
      } else if (state.matches("extruding")) {
        console.log("handleMouseMove-4");
        invariant(state.context.lastControlPoint != null);
        const extrudedHeight = engineRef.current?.getExtrudedHeight(
          [
            state.context.lastControlPoint.x,
            state.context.lastControlPoint.y,
            state.context.lastControlPoint.z,
          ],
          [props.x, props.y],
        );
        if (extrudedHeight != null) {
          setExtrudedHeight(extrudedHeight);
        }
      }
      console.log("handleMouseMove-finish");
    },
    [disableInteraction, state, engineRef, updateGeometryOptions, setExtrudedHeight],
  );

  const handleLeftUp = useCallback(
    (props: MouseEventProps) => {
      console.log("handleLeftUp", props);
      if (
        disableInteraction ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined
      ) {
        return;
      }

      console.log("handleLeftUp-2");
      if (
        state.context.controlPoints?.length === 1 &&
        state.context.lastPointerPosition != null &&
        state.context.type !== "marker" &&
        Cartesian2.equalsEpsilon(
          new Cartesian2(props.x, props.y),
          state.context.lastPointerPosition,
          0,
          5, // Epsilon in pixels
        )
      ) {
        console.log("handleLeftUp-Too close");
        return; // Too close to the first position user clicked.
      }

      if (state.matches("drawing")) {
        console.log("handleLeftUp-3");
        const controlPoint = new Cartesian3(
          ...(engineRef.current?.toXYZ(props.lng, props.lat, props.height) ?? []),
        );

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
        console.log("handleLeftUp-4");
        if (controlPoint == null || hasDuplicate(controlPoint, state.context.controlPoints)) {
          return;
        }
        console.log("handleLeftUp-5");
        if (
          state.context.type === "circle" ||
          (state.context.type === "rectangle" && state.context.controlPoints?.length === 2)
        ) {
          const feature = createFeature();
          console.log("handleLeftUp-6", feature);
          if (feature == null) {
            return;
          }
          handleFeatureCreate(feature);
          send({ type: "CREATE" });
          setGeometryOptions(null);
          return;
        } else {
          console.log("handleLeftUp-7");
          send({
            type: "NEXT",
            pointerPosition: new Cartesian2(props.x, props.y),
            controlPoint,
          });
        }
      } else if (state.matches("extruding")) {
        const feature = createFeature();
        console.log("handleLeftUp-8", feature);
        if (feature == null) {
          return;
        }
        handleFeatureCreate(feature);
        send({ type: "CREATE" });
        setGeometryOptions(null);
      }
      console.log("handleLeftUp-finish");
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
      console.log("handleDoubleClick", props);
      if (
        disableInteraction ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined
      ) {
        return;
      }
      console.log("handleDoubleClick-2");
      if (state.matches("drawing.extrudedPolygon")) {
        console.log("handleDoubleClick-3");
        const controlPoint = new Cartesian3(
          ...(engineRef.current?.toXYZ(props.lng, props.lat, props.height) ?? []),
        );
        if (controlPoint == null || hasDuplicate(controlPoint, state.context.controlPoints)) {
          return;
        }
        console.log("handleDoubleClick-4");
        send({
          type: "EXTRUDE",
          pointerPosition: new Cartesian2(props.x, props.y),
          controlPoint,
        });
      } else if (state.matches("drawing.polyline") || state.matches("drawing.polygon")) {
        const feature = createFeature();
        console.log("handleDoubleClick-5", feature);
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

  const mouseDownEventRef = useRef<MouseEventCallback>(handleLeftDown);
  mouseDownEventRef.current = handleLeftDown;
  const mouseMoveEventRef = useRef<MouseEventCallback>(handleMouseMove);
  mouseMoveEventRef.current = handleMouseMove;
  const mouseUpEventRef = useRef<MouseEventCallback>(handleLeftUp);
  mouseUpEventRef.current = handleLeftUp;
  const mouseDoubleClickEventRef = useRef<MouseEventCallback>(handleDoubleClick);
  mouseDoubleClickEventRef.current = handleDoubleClick;

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

  useEffect(() => {
    engineRef.current?.onMouseDown(onMouseDown);
    engineRef.current?.onMouseMove(onMouseMove);
    engineRef.current?.onMouseUp(onMouseUp);
    engineRef.current?.onDoubleClick(onMouseDoubleClick);
  }, [engineRef, onMouseDown, onMouseMove, onMouseUp, onMouseDoubleClick]);

  useWindowEvent("keydown", event => {
    if (disableInteraction) {
      return;
    }
    if (event.key === "Escape") {
      send({ type: "CANCEL" });
      const controlPoint =
        pointerLocationRef.current != null
          ? new Cartesian3(...(engineRef.current?.toXYZ(...pointerLocationRef.current) ?? []))
          : undefined;
      updateGeometryOptions(controlPoint);
    }
  });

  useEffect(() => {
    if (disableInteraction) {
      send({ type: "ABORT" });
      updateGeometryOptions(undefined);
    }
  }, [disableInteraction, send, updateGeometryOptions]);

  useImperativeHandle(ref, () => ({ setType, onTypeChange, onFeatureCreate }), [
    // enable,
    setType,
    onTypeChange,
    onFeatureCreate,
  ]);

  return {
    state,
    extrudedHeight,
    geometryOptions,
  };
}

function hasDuplicate(controlPoint: Cartesian3, controlPoints?: readonly Cartesian3[]): boolean {
  return (
    controlPoints?.some(another =>
      controlPoint.equalsEpsilon(
        another,
        0,
        1e-7, // Epsilon in radians
      ),
    ) === true
  );
}
