import { useCallback } from "react";

import { ComputedFeature, NaiveLayer } from "@reearth/core";

import { useGet } from "../../utils";
import { Props } from "../types";

export default ({
  mapRef,
  selectedLayer,
  selectedFeature,
}: Pick<Props, "mapRef" | "selectedLayer" | "selectedFeature">) => {
  const layersRef = mapRef?.current?.layers;
  const engineRef = mapRef?.current?.engine;

  const getLayers = useGet(layersRef);

  const hideLayer = useCallback(
    (...args: string[]) => {
      layersRef?.hide(...args);
    },
    [layersRef],
  );

  const showLayer = useCallback(
    (...args: string[]) => {
      layersRef?.show(...args);
    },
    [layersRef],
  );

  const addLayer = useCallback(
    (layer: NaiveLayer) => {
      return layersRef?.add(layer)?.id;
    },
    [layersRef],
  );

  const findFeatureById = useCallback(
    (layerId: string, featureId: string) => {
      return engineRef?.findFeatureById(layerId, featureId);
    },
    [engineRef],
  );

  const findFeaturesByIds = useCallback(
    (layerId: string, featureIds: string[]) => {
      return engineRef?.findFeaturesByIds(layerId, featureIds);
    },
    [engineRef],
  );

  const layersInViewport = useCallback(() => {
    return layersRef?.findAll(layer => !!engineRef?.inViewport(layer?.property?.default?.location));
  }, [engineRef, layersRef]);

  const selectLayer = useCallback(
    (layerId: string | undefined) => {
      layersRef?.select(layerId);
    },
    [layersRef],
  );

  const selectFeature = useCallback(
    (layerId: string | undefined, featureId: string | undefined) => {
      layersRef?.selectFeature(layerId, featureId);
    },
    [layersRef],
  );

  const selectFeatures = useCallback(
    (layers: { layerId?: string; featureId?: string[] }[]) => {
      layersRef?.selectFeatures(layers);
    },
    [layersRef],
  );

  const getSelectedLayer = useGet(selectedLayer);
  const getSelectedFeature = useGet(selectedFeature);

  const getFeaturesInScreenRect = useCallback(
    (
      rect: [x: number, y: number, width: number, height: number],
      condition?: (f: ComputedFeature) => boolean,
    ) => {
      return engineRef?.pickManyFromViewport([rect[0], rect[1]], rect[2], rect[3], condition);
    },
    [engineRef],
  );

  const bringToFront = useCallback(
    (layerId: string) => {
      return engineRef?.bringToFront(layerId);
    },
    [engineRef],
  );

  const sendToBack = useCallback(
    (layerId: string) => {
      return engineRef?.sendToBack(layerId);
    },
    [engineRef],
  );

  return {
    getLayers,
    hideLayer,
    showLayer,
    addLayer,
    findFeatureById,
    findFeaturesByIds,
    layersInViewport,
    selectLayer,
    selectFeature,
    selectFeatures,
    getSelectedLayer,
    getSelectedFeature,
    getFeaturesInScreenRect,
    bringToFront,
    sendToBack,
  };
};
