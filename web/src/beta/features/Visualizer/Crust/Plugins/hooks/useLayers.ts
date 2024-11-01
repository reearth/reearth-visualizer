import { ComputedFeature, NaiveLayer } from "@reearth/core";
import { useCallback, useEffect, useMemo } from "react";

import { useGet } from "../../utils";
import { LayersEventType } from "../pluginAPI/types";
import { Props } from "../types";
import { events, useEmit } from "../utils/events";

export default ({
  mapRef,
  selectedLayer,
  selectedFeature,
  onLayerEdit,
  onLayerVisibility,
  onLayerLoad
}: Pick<
  Props,
  | "mapRef"
  | "selectedLayer"
  | "selectedFeature"
  | "onLayerEdit"
  | "onLayerVisibility"
  | "onLayerLoad"
>) => {
  const layersRef = mapRef?.current?.layers;
  const engineRef = mapRef?.current?.engine;

  const getLayers = useGet(layersRef);

  const hideLayer = useCallback(
    (...args: string[]) => {
      layersRef?.hide(...args);
    },
    [layersRef]
  );

  const showLayer = useCallback(
    (...args: string[]) => {
      layersRef?.show(...args);
    },
    [layersRef]
  );

  const addLayer = useCallback(
    (layer: NaiveLayer) => {
      const layerId = layersRef?.add(layer)?.id;
      // TODO: handle infobox
      return layerId;
    },
    [layersRef]
  );

  const findFeatureById = useCallback(
    (layerId: string, featureId: string) => {
      return engineRef?.findFeatureById(layerId, featureId);
    },
    [engineRef]
  );

  const findFeaturesByIds = useCallback(
    (layerId: string, featureIds: string[]) => {
      return engineRef?.findFeaturesByIds(layerId, featureIds);
    },
    [engineRef]
  );

  const selectLayer = useCallback(
    (layerId: string | undefined) => {
      layersRef?.select(layerId);
    },
    [layersRef]
  );

  const selectFeature = useCallback(
    (layerId: string | undefined, featureId: string | undefined) => {
      layersRef?.selectFeature(layerId, featureId);
    },
    [layersRef]
  );

  const selectFeatures = useCallback(
    (layers: { layerId?: string; featureId?: string[] }[]) => {
      layersRef?.selectFeatures(layers);
    },
    [layersRef]
  );

  const getSelectedLayer = useGet(selectedLayer);
  const getSelectedFeature = useGet(selectedFeature);

  const getFeaturesInScreenRect = useCallback(
    (
      rect: [x: number, y: number, width: number, height: number],
      condition?: (f: ComputedFeature) => boolean
    ) => {
      return engineRef?.pickManyFromViewport(
        [rect[0], rect[1]],
        rect[2],
        rect[3],
        condition
      );
    },
    [engineRef]
  );

  const bringToFront = useCallback(
    (layerId: string) => {
      return engineRef?.bringToFront(layerId);
    },
    [engineRef]
  );

  const sendToBack = useCallback(
    (layerId: string) => {
      return engineRef?.sendToBack(layerId);
    },
    [engineRef]
  );

  // events
  const [layersEvents, emit] = useMemo(() => events<LayersEventType>(), []);

  useEmit<LayersEventType>(
    {
      select: useMemo<
        [layerId: string | undefined, featureId: string | undefined]
      >(
        () =>
          selectedLayer
            ? [selectedLayer.id, selectedFeature?.id]
            : [undefined, undefined],
        [selectedLayer, selectedFeature]
      )
    },
    emit
  );

  useEffect(() => {
    onLayerEdit?.((e) => {
      emit("edit", e);
    });
  }, [emit, onLayerEdit]);

  useEffect(() => {
    onLayerVisibility?.((e) => {
      emit("visible", e);
    });
  }, [emit, onLayerVisibility]);

  useEffect(() => {
    onLayerLoad?.((e) => {
      emit("load", e);
    });
  }, [emit, onLayerLoad]);

  const layersEventsOn = useCallback(
    <T extends keyof LayersEventType>(
      type: T,
      callback: (...args: LayersEventType[T]) => void,
      options?: { once?: boolean }
    ) => {
      return options?.once
        ? layersEvents.once(type, callback)
        : layersEvents.on(type, callback);
    },
    [layersEvents]
  );

  const layersEventsOff = useCallback(
    <T extends keyof LayersEventType>(
      type: T,
      callback: (...args: LayersEventType[T]) => void
    ) => {
      return layersEvents.off(type, callback);
    },
    [layersEvents]
  );

  return {
    getLayers,
    hideLayer,
    showLayer,
    addLayer,
    findFeatureById,
    findFeaturesByIds,
    selectLayer,
    selectFeature,
    selectFeatures,
    getSelectedLayer,
    getSelectedFeature,
    getFeaturesInScreenRect,
    bringToFront,
    sendToBack,
    layersEventsOn,
    layersEventsOff,
    layersEvents
  };
};
