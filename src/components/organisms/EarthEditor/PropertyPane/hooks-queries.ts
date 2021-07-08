import { useMemo } from "react";
import {
  useGetScenePropertyQuery,
  useGetLayerPropertyQuery,
  useGetLinkableDatasetsQuery,
  useGetLayersFromLayerIdQuery,
  AssetsQuery,
  useAssetsQuery,
} from "@reearth/gql";
import { convert, Pane, convertLinkableDatasets, convertLayers } from "./convert";

export type Mode = "infobox" | "scene" | "layer" | "block" | "widget";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

export default ({
  sceneId,
  rootLayerId,
  selectedLayer,
  selectedBlock,
  selectedWidgetId,
  teamId,
  mode,
}: {
  sceneId?: string;
  rootLayerId?: string;
  selectedLayer?: string;
  selectedBlock?: string;
  selectedWidgetId?: { pluginId: string; extensionId: string };
  teamId?: string;
  mode: Mode;
}) => {
  const {
    loading: layerLoading,
    error: layerError,
    data: layerData,
  } = useGetLayersFromLayerIdQuery({
    variables: { layerId: rootLayerId ?? "" },
    skip: !rootLayerId,
  });

  const {
    loading: scenePropertyLoading,
    error: scenePropertyError,
    data: scenePropertyData,
  } = useGetScenePropertyQuery({
    variables: { sceneId: sceneId || "" },
    skip: !sceneId || (mode !== "scene" && mode != "widget"),
  });

  const {
    loading: layerPropertyLoading,
    error: layerPropertyError,
    data: layerPropertyData,
  } = useGetLayerPropertyQuery({
    variables: { layerId: selectedLayer || "" },
    skip: !selectedLayer || (mode !== "layer" && mode !== "block" && mode !== "infobox"),
  });

  const { data: linkableDatasets } = useGetLinkableDatasetsQuery({
    variables: {
      sceneId: sceneId ?? "",
    },
    skip: !sceneId,
  });

  const { data: assetsData } = useAssetsQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });
  const assets = assetsData?.assets.nodes.filter(Boolean) as AssetNodes;

  const scene =
    scenePropertyData?.node?.__typename === "Scene" ? scenePropertyData.node : undefined;
  const sceneProperty = scene?.property;
  const layerProperty =
    mode === "layer" ? layerPropertyData?.layer?.property ?? undefined : undefined;
  const blockProperty =
    (selectedBlock && mode === "block"
      ? layerPropertyData?.layer?.infobox?.fields
      : undefined
    )?.find(f => f.id === selectedBlock)?.property ?? undefined;
  const infoboxProperty =
    mode === "infobox" && !selectedBlock
      ? layerPropertyData?.layer?.infobox?.property ?? undefined
      : undefined;
  const layerMergedProperty =
    mode === "layer" && layerPropertyData?.layer?.__typename === "LayerItem"
      ? layerPropertyData.layer.merged?.property ?? undefined
      : undefined;
  const infoboxMergedProperty =
    mode === "infobox" && layerPropertyData?.layer?.__typename === "LayerItem"
      ? layerPropertyData.layer.merged?.infobox?.property ?? undefined
      : undefined;
  const blockMergedProperty =
    (selectedBlock && mode === "block" && layerPropertyData?.layer?.__typename === "LayerItem"
      ? layerPropertyData.layer.merged?.infobox?.fields
      : undefined
    )?.find(f => f.originalId === selectedBlock)?.property ?? undefined;

  const property = sceneProperty ?? layerProperty ?? infoboxProperty ?? blockProperty;
  const propertyId = property?.id;
  const mergedProperty = layerMergedProperty ?? infoboxMergedProperty ?? blockMergedProperty;

  const items = useMemo(() => convert(property, mergedProperty), [property, mergedProperty]);

  const loading = scenePropertyLoading || layerPropertyLoading || layerLoading;
  const error = scenePropertyError ?? layerPropertyError ?? layerError;

  const isLayerGroup = layerPropertyData?.layer?.__typename === "LayerGroup";
  const linkedDatasetSchemaId =
    (layerPropertyData?.layer?.__typename === "LayerGroup"
      ? layerPropertyData.layer.linkedDatasetSchemaId
      : undefined) ??
    mergedProperty?.schema?.id ??
    undefined;
  const linkedDatasetId =
    layerPropertyData?.layer?.__typename === "LayerItem"
      ? layerPropertyData.layer.linkedDatasetId ?? undefined
      : undefined;
  const isInfoboxCreatable =
    !!selectedLayer && mode === "infobox" && !layerPropertyData?.layer?.infobox;
  const selectedWidget = useMemo(
    () =>
      selectedWidgetId
        ? scene?.widgets.find(
            w =>
              selectedWidgetId.pluginId === w.pluginId &&
              selectedWidgetId.extensionId === w.extensionId,
          )
        : undefined,
    [scene?.widgets, selectedWidgetId],
  );

  const pane = useMemo<Pane | undefined>(() => {
    if (mode === "scene") {
      return {
        id: "reearth/cesium",
        mode: "scene",
        propertyId,
        items,
        title: layerPropertyData?.layer?.name,
      };
    }

    if (mode === "widget") {
      if (!selectedWidgetId) return undefined;
      const w = scene?.widgets.find(
        w =>
          w.pluginId === selectedWidgetId.pluginId &&
          w.extensionId === selectedWidgetId.extensionId,
      );
      return {
        id: selectedWidgetId.pluginId + "/" + selectedWidgetId.extensionId,
        mode: "widget",
        propertyId: w?.property?.id,
        items: convert(w?.property, null),
        title: layerPropertyData?.layer?.name,
        enabled: !!w?.enabled,
      };
    }

    return {
      id: mode,
      mode,
      propertyId,
      items,
      title: layerPropertyData?.layer?.name,
      group: layerPropertyData?.layer?.__typename === "LayerGroup",
    };
  }, [items, mode, propertyId, scene?.widgets, selectedWidgetId, layerPropertyData?.layer]);
  const datasetSchemas = useMemo(
    () => convertLinkableDatasets(linkableDatasets),
    [linkableDatasets],
  );

  const layers = useMemo(() => convertLayers(layerData), [layerData]);

  return {
    loading,
    error,
    pane,
    isLayerGroup,
    linkedDatasetId,
    linkedDatasetSchemaId,
    isInfoboxCreatable,
    datasetSchemas,
    scene,
    layers,
    assets,
    selectedWidget,
  };
};
