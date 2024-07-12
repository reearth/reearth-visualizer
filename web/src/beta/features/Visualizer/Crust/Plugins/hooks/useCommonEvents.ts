import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  events,
  MouseEventHandles,
  MouseEvents,
  TickEventCallback,
  TimelineCommitter,
} from "@reearth/core";

import { useVisualizerCamera } from "../../../atoms";
import { CameraPosition, ReearthEventType, ViewportSize } from "../pluginAPI/types";
import { Props } from "../types";

export type CommonReearthEventType = Pick<
  ReearthEventType,
  | keyof MouseEvents
  | "cameramove"
  | "select"
  | "tick"
  | "timelinecommit"
  | "resize"
  | "layeredit"
  | "sketchfeaturecreated"
  | "sketchtoolchange"
  | "layerVisibility"
  | "layerload"
  | "layerSelectWithRectStart"
  | "layerSelectWithRectMove"
  | "layerSelectWithRectEnd"
>;

export type CommonEvents = {
  readonly on: <T extends keyof CommonReearthEventType>(
    type: T,
    callback: (...args: CommonReearthEventType[T]) => void,
  ) => void;
  readonly off: <T extends keyof CommonReearthEventType>(
    type: T,
    callback: (...args: CommonReearthEventType[T]) => void,
  ) => void;
  readonly once: <T extends keyof CommonReearthEventType>(
    type: T,
    callback: (...args: CommonReearthEventType[T]) => void,
  ) => void;
};

export default ({
  mapRef,
  timelineManagerRef,
  selectedLayer,
  selectedFeature,
  viewport,
  onLayerEdit,
  onLayerVisibility,
  onLayerLoad,
  onLayerSelectWithRectStart,
  onLayerSelectWithRectMove,
  onLayerSelectWithRectEnd,
  onSketchPluginFeatureCreate,
  onSketchTypeChange,
}: Pick<
  Props,
  | "mapRef"
  | "timelineManagerRef"
  | "selectedLayer"
  | "selectedFeature"
  | "viewport"
  | "onLayerEdit"
  | "onLayerVisibility"
  | "onLayerLoad"
  | "onLayerSelectWithRectStart"
  | "onLayerSelectWithRectMove"
  | "onLayerSelectWithRectEnd"
  | "onSketchPluginFeatureCreate"
  | "onSketchTypeChange"
>) => {
  const [camera] = useVisualizerCamera();

  const [commonEvents, emit] = useMemo(() => events<CommonReearthEventType>(), []);

  useEmit<CommonReearthEventType>(
    {
      select: useMemo<[layerId: string | undefined, featureId: string | undefined]>(
        () => (selectedLayer ? [selectedLayer.id, selectedFeature?.id] : [undefined, undefined]),
        [selectedLayer, selectedFeature],
      ),
      cameramove: useMemo<[camera: CameraPosition] | undefined>(
        () => (camera ? [camera] : undefined),
        [camera],
      ),
      resize: useMemo<[viewport: ViewportSize] | undefined>(
        () => [
          {
            width: viewport?.width,
            height: viewport?.height,
            isMobile: viewport?.isMobile,
          } as ViewportSize,
        ],
        [viewport?.width, viewport?.height, viewport?.isMobile],
      ),
    },
    emit,
  );

  const onTickEvent = useCallback(
    (fn: TickEventCallback) => {
      timelineManagerRef?.current?.onTick(fn);
    },
    [timelineManagerRef],
  );

  const onTimelineCommitEvent = useCallback(
    (fn: (committer: TimelineCommitter) => void) => {
      timelineManagerRef?.current?.onCommit(fn);
    },
    [timelineManagerRef],
  );

  const onMouseEvent = useCallback(
    (eventType: keyof MouseEventHandles, fn: any) => {
      mapRef?.current?.engine[eventType]?.(fn);
    },
    [mapRef],
  );

  useEffect(() => {
    const mouseEventHandles: {
      [index in keyof MouseEvents]: keyof MouseEventHandles;
    } = {
      click: "onClick",
      doubleclick: "onDoubleClick",
      mousedown: "onMouseDown",
      mouseup: "onMouseUp",
      rightclick: "onRightClick",
      rightdown: "onRightDown",
      rightup: "onRightUp",
      middleclick: "onMiddleClick",
      middledown: "onMiddleDown",
      middleup: "onMiddleUp",
      mousemove: "onMouseMove",
      mouseenter: "onMouseEnter",
      mouseleave: "onMouseLeave",
      wheel: "onWheel",
    };
    (Object.keys(mouseEventHandles) as (keyof MouseEvents)[]).forEach(
      (event: keyof MouseEvents) => {
        onMouseEvent(mouseEventHandles[event], (props: MouseEvent) => {
          emit(event, props);
        });
      },
    );
  }, [emit, onMouseEvent]);

  useEffect(() => {
    onLayerEdit?.(e => {
      emit("layeredit", e);
    });
  }, [emit, onLayerEdit]);

  useEffect(() => {
    onTickEvent(e => {
      emit("tick", e);
    });
  }, [emit, onTickEvent]);

  useEffect(() => {
    onTimelineCommitEvent(e => {
      emit("timelinecommit", e);
    });
  }, [emit, onTimelineCommitEvent]);

  useEffect(() => {
    onLayerVisibility?.(e => {
      emit("layerVisibility", e);
    });
  }, [emit, onLayerVisibility]);

  useEffect(() => {
    onLayerLoad?.(e => {
      emit("layerload", e);
    });
  }, [emit, onLayerLoad]);

  useEffect(() => {
    onLayerSelectWithRectStart?.(e => {
      emit("layerSelectWithRectStart", e);
    });
  }, [emit, onLayerSelectWithRectStart]);

  useEffect(() => {
    onLayerSelectWithRectMove?.(e => {
      emit("layerSelectWithRectMove", e);
    });
  }, [emit, onLayerSelectWithRectMove]);

  useEffect(() => {
    onLayerSelectWithRectEnd?.(e => {
      emit("layerSelectWithRectEnd", e);
    });
  }, [emit, onLayerSelectWithRectEnd]);

  // bind sketch plugin feature create event
  const sketchPluginFeatureCreateEventBinded = useRef(false);
  useEffect(() => {
    if (!sketchPluginFeatureCreateEventBinded.current && onSketchPluginFeatureCreate) {
      onSketchPluginFeatureCreate?.(e => {
        emit("sketchfeaturecreated", e);
      });
      sketchPluginFeatureCreateEventBinded.current = true;
    }
  }, [emit, onSketchPluginFeatureCreate]);

  // bind sketch type change event
  const sketchTypeChangeEventBinded = useRef(false);
  useEffect(() => {
    if (!sketchTypeChangeEventBinded.current && onSketchTypeChange) {
      onSketchTypeChange?.(e => {
        emit("sketchtoolchange", e);
      });
      sketchTypeChangeEventBinded.current = true;
    }
  }, [emit, onSketchTypeChange]);

  return {
    commonEvents,
  };
};

export function useEmit<T extends { [K in string]: any[] }>(
  values: { [K in keyof T]?: T[K] | undefined },
  emit: (<K extends keyof T>(key: K, ...args: T[K]) => void) | undefined,
) {
  for (const k of Object.keys(values)) {
    const args = values[k];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!args) return;
      emit?.(k, ...args);
    }, [emit, k, args]);
  }
}
