import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  SpatialIdEventType,
  SpatialIdPickSpaceOptions
} from "../pluginAPI/types";
import { Props } from "../types";
import { events } from "../utils/events";

export default ({
  mapRef,
  mapAPIReady
}: Pick<Props, "mapRef" | "mapAPIReady">) => {
  const spatialIdPickSpace = useCallback(
    (options?: SpatialIdPickSpaceOptions) => {
      mapRef?.current?.spatialId?.pickSpace(options);
    },
    [mapRef]
  );

  const spatialIdExitPickSpace = useCallback(() => {
    mapRef?.current?.spatialId?.exitPickSpace();
  }, [mapRef]);

  const [spatialIdEvents, emit] = useMemo(
    () => events<SpatialIdEventType>(),
    []
  );

  const spacePickEventBinded = useRef(false);
  useEffect(() => {
    if (
      mapAPIReady &&
      !spacePickEventBinded.current &&
      mapRef?.current?.spatialId?.onSpacePick
    ) {
      mapRef.current.spatialId.onSpacePick((e) => {
        emit("spacePick", e);
      });
      spacePickEventBinded.current = true;
    }
  }, [emit, mapRef, mapAPIReady]);

  const spatialIdEventsOn = useCallback(
    <T extends keyof SpatialIdEventType>(
      type: T,
      callback: (...args: SpatialIdEventType[T]) => void,
      options?: { once?: boolean }
    ) => {
      return options?.once
        ? spatialIdEvents.once(type, callback)
        : spatialIdEvents.on(type, callback);
    },
    [spatialIdEvents]
  );

  const spatialIdEventsOff = useCallback(
    <T extends keyof SpatialIdEventType>(
      type: T,
      callback: (...args: SpatialIdEventType[T]) => void
    ) => {
      return spatialIdEvents.off(type, callback);
    },
    [spatialIdEvents]
  );

  return {
    spatialIdPickSpace,
    spatialIdExitPickSpace,
    spatialIdEventsOn,
    spatialIdEventsOff,
    spatialIdEvents
  };
};
