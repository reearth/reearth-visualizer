// TODO: Refactor: move cesium related code to engine.
import { feature } from "@turf/helpers";
import { useMachine } from "@xstate/react";
import { Cartesian2, Cartesian3 } from "cesium";
import { Feature, MultiPolygon, Polygon } from "geojson";
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

import {
  EngineRef,
  LayersRef,
  MouseEventCallback,
  MouseEventProps,
  SketchRef,
  SketchType,
} from "../types";

import { GeometryOptions, createGeometry } from "./createGeometry";
import { createSketchMachine } from "./sketchMachine";
import { SketchGeometryType } from "./types";
import { useWindowEvent } from "./utils";

export type SketchFeatureCallback = (feature: Feature<Polygon | MultiPolygon> | null) => void;

type Props = {
  ref: ForwardedRef<SketchRef>;
  layersRef: RefObject<LayersRef>;
  engineRef: RefObject<EngineRef>;
};

const sketchMachine = createSketchMachine();
// let positionScratch = new Cartesian3();

export default function useHooks({ ref, engineRef }: Props) {
  const [state, send] = useMachine(sketchMachine);
  const [type, updateType] = useState<SketchType>();
  const [disableInteraction, setDisableInteraction] = useState(false);

  const [geometryOptions, setGeometryOptions] = useState<GeometryOptions | null>(null);
  const [extrudedHeight, setExtrudedHeight] = useState(0);
  const pointerPositionRef = useRef<Cartesian2>();
  const pointerLocationRef = useRef<[lng: number, lat: number, height: number]>();

  const onFeatureCreateRef = useRef<SketchFeatureCallback>();

  const enable = useCallback((enable: boolean) => {
    setDisableInteraction(!enable);
  }, []);

  const setType = useCallback((type: SketchType) => {
    updateType(type);
  }, []);

  useEffect(() => {
    console.log("type change", type);
  }, [type]);

  const createFeature = useCallback(() => {
    if (geometryOptions == null) {
      return null;
    }
    const geometry = createGeometry(geometryOptions);
    if (geometry == null || geometry.type === "LineString") {
      return null;
    }
    return feature(geometry, {
      id: uuidv4(),
      type: geometryOptions.type,
      positions: geometryOptions.controlPoints.map(({ x, y, z }): [number, number, number] => [
        x,
        y,
        z,
      ]),
      extrudedHeight,
    });
  }, [extrudedHeight, geometryOptions]);

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
        // ellipsoid: scene.globe.ellipsoid,
      });
    },
    [state, setGeometryOptions, setExtrudedHeight],
  );

  const onFeatureCreate = useCallback((cb: SketchFeatureCallback) => {
    onFeatureCreateRef.current = cb;
  }, []);

  useImperativeHandle(ref, () => ({ setType, enable, onFeatureCreate }), [
    enable,
    setType,
    onFeatureCreate,
  ]);

  const handleFeatureCreate = useCallback(
    (
      feature: Feature<
        Polygon | MultiPolygon,
        {
          id: string;
          type: SketchGeometryType;
          positions: [number, number, number][];
          extrudedHeight: number;
        }
      > | null,
    ) => {
      onFeatureCreateRef.current?.(feature);
      console.log(feature);
    },
    [],
  );

  const handleLeftDown = useCallback(
    (props: MouseEventProps) => {
      console.log("left down", disableInteraction, type, props.lng, props.lat, props.height);
      if (
        disableInteraction ||
        !type ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined
      ) {
        return;
      }
      if (!state.matches("idle")) {
        return;
      }
      invariant(state.context.lastControlPoint == null);
      const controlPoint = new Cartesian3(
        ...(engineRef.current?.toXYZ(props.lng, props.lat, props.height) ?? []),
      );
      // positionScratch = controlPoint?.clone();
      if (controlPoint == null) {
        return;
      }
      console.log("send");
      send({
        type: {
          circle: "CIRCLE" as const,
          rectangle: "RECTANGLE" as const,
          polygon: "POLYGON" as const,
          marker: "MARKER" as const,
          polyline: "POLYLINE" as const,
        }[type],
        pointerPosition: new Cartesian2(props.x, props.y),
        controlPoint,
      });
      setGeometryOptions(null);
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
        props.y === undefined
      ) {
        return;
      }
      pointerPositionRef.current = new Cartesian2(props.x, props.y);
      pointerLocationRef.current = [props.lng, props.lat, props.height];
      if (state.matches("drawing")) {
        invariant(state.context.type != null);
        invariant(state.context.controlPoints != null);
        const controlPoint = new Cartesian3(
          ...(engineRef.current?.toXYZ(props.lng, props.lat, props.height) ?? []),
        );
        // positionScratch = controlPoint?.clone();
        if (controlPoint == null || hasDuplicate(controlPoint, state.context.controlPoints)) {
          return;
        }
        updateGeometryOptions(controlPoint);
      } else if (state.matches("extruding")) {
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
    },
    [disableInteraction, state, engineRef, updateGeometryOptions, setExtrudedHeight],
  );

  const handleLeftUp = useCallback(
    (props: MouseEventProps) => {
      if (
        disableInteraction ||
        props.lng === undefined ||
        props.lat === undefined ||
        props.height === undefined
      ) {
        return;
      }
      if (
        state.context.controlPoints?.length === 1 &&
        state.context.lastPointerPosition != null &&
        Cartesian2.equalsEpsilon(
          new Cartesian2(props.x, props.y),
          state.context.lastPointerPosition,
          0,
          5, // Epsilon in pixels
        )
      ) {
        return; // Too close to the first position user clicked.
      }
      if (state.matches("drawing")) {
        const controlPoint = new Cartesian3(
          ...(engineRef.current?.toXYZ(props.lng, props.lat, props.height) ?? []),
        );
        // positionScratch = controlPoint?.clone();
        if (controlPoint == null || hasDuplicate(controlPoint, state.context.controlPoints)) {
          return;
        }
        send({
          type: "NEXT",
          pointerPosition: new Cartesian2(props.x, props.y),
          controlPoint,
        });
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
        props.height === undefined
      ) {
        return;
      }
      if (state.matches("drawing.polygon")) {
        const controlPoint = new Cartesian3(
          ...(engineRef.current?.toXYZ(props.lng, props.lat, props.height) ?? []),
        );
        if (controlPoint == null || hasDuplicate(controlPoint, state.context.controlPoints)) {
          return;
        }
        send({
          type: "EXTRUDE",
          pointerPosition: new Cartesian2(props.x, props.y),
          controlPoint,
        });
      }
    },
    [disableInteraction, state, engineRef, send],
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

  // TEMP: add a mock sketch layer on initialize
  // useEffect(() => {
  //   const layer = layersRef.current?.add({
  //     type: "simple",
  //     data: {
  //       type: "geojson",
  //       value: {
  //         // GeoJSON
  //         type: "Feature",
  //         geometry: {
  //           coordinates: [-15.209829106984472, 20.323569554406248, 10000],
  //           type: "Point",
  //         },
  //       },
  //     },
  //     marker: {},
  //   });
  //   console.log(layer?.id);
  //   setTimeout(() => {
  //     layersRef.current?.select(layer?.id);
  //   }, 100);
  // }, [layersRef]);

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
