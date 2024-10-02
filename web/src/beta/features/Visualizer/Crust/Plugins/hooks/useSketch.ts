import { SketchOptions, SketchType } from "@reearth/core";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { SketchEventType } from "../pluginAPI/types";
import { Props } from "../types";
import { events } from "../utils/events";

export default ({
  mapRef,
  onSketchPluginFeatureCreate,
  onSketchPluginFeatureUpdate,
  onSketchTypeChange
}: Pick<
  Props,
  | "mapRef"
  | "onSketchPluginFeatureCreate"
  | "onSketchPluginFeatureUpdate"
  | "onSketchTypeChange"
>) => {
  const getSketchTool = useCallback(
    () => mapRef?.current?.sketch?.getType(),
    [mapRef]
  );

  const setSketchTool = useCallback(
    (type: SketchType | undefined) =>
      mapRef?.current?.sketch?.setType(type, "plugin"),
    [mapRef]
  );

  const getSketchOptions = useCallback(
    () => mapRef?.current?.sketch?.getOptions(),
    [mapRef]
  );

  const overrideSketchOptions = useCallback(
    (options: SketchOptions) =>
      mapRef?.current?.sketch?.overrideOptions(options),
    [mapRef]
  );

  const [sketchEvents, emit] = useMemo(() => events<SketchEventType>(), []);

  const sketchPluginFeatureCreateEventBinded = useRef(false);
  useEffect(() => {
    if (
      !sketchPluginFeatureCreateEventBinded.current &&
      onSketchPluginFeatureCreate
    ) {
      onSketchPluginFeatureCreate?.((e) => {
        emit("create", e);
      });
      sketchPluginFeatureCreateEventBinded.current = true;
    }
  }, [emit, onSketchPluginFeatureCreate]);

  const sketchPluginFeatureUpdateEventBinded = useRef(false);
  useEffect(() => {
    if (
      !sketchPluginFeatureUpdateEventBinded.current &&
      onSketchPluginFeatureUpdate
    ) {
      onSketchPluginFeatureUpdate?.((e) => {
        emit("update", e);
      });
      sketchPluginFeatureUpdateEventBinded.current = true;
    }
  }, [emit, onSketchPluginFeatureUpdate]);

  const sketchTypeChangeEventBinded = useRef(false);
  useEffect(() => {
    if (!sketchTypeChangeEventBinded.current && onSketchTypeChange) {
      onSketchTypeChange?.((e) => {
        emit("toolChange", e);
      });
      sketchTypeChangeEventBinded.current = true;
    }
  }, [emit, onSketchTypeChange]);

  const sketchEventsOn = useCallback(
    <T extends keyof SketchEventType>(
      type: T,
      callback: (...args: SketchEventType[T]) => void,
      options?: { once?: boolean }
    ) => {
      return options?.once
        ? sketchEvents.once(type, callback)
        : sketchEvents.on(type, callback);
    },
    [sketchEvents]
  );

  const sketchEventsOff = useCallback(
    <T extends keyof SketchEventType>(
      type: T,
      callback: (...args: SketchEventType[T]) => void
    ) => {
      return sketchEvents.off(type, callback);
    },
    [sketchEvents]
  );

  return {
    getSketchTool,
    setSketchTool,
    getSketchOptions,
    overrideSketchOptions,
    sketchEventsOn,
    sketchEventsOff,
    sketchEvents
  };
};
