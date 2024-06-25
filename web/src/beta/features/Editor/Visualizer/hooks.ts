import { useMemo, useEffect, useCallback, useState, MutableRefObject } from "react";

import type { Alignment, Location } from "@reearth/beta/features/Visualizer/Crust";
import {
  convertData,
  sceneProperty2ViewerPropertyMapping,
} from "@reearth/beta/utils/convert-object";
import { Camera } from "@reearth/beta/utils/value";
import type { LatLng, ComputedLayer, ComputedFeature, ViewerProperty } from "@reearth/core";
import {
  useLayersFetcher,
  useSceneFetcher,
  useWidgetsFetcher,
  useStorytellingFetcher,
  usePropertyFetcher,
  useLayerStylesFetcher,
  useInfoboxFetcher,
} from "@reearth/services/api";
import { config } from "@reearth/services/config";

import { useCurrentCamera } from "../atoms";
import type { LayerSelectProps, SelectedLayer } from "../hooks/useLayers";

import { convertWidgets, processLayers, processProperty } from "./convert";
import { convertStory } from "./convert-story";

export default ({
  sceneId,
  storyId,
  isBuilt,
  showStoryPanel,
  selectedLayer,
  isVisualizerResizing,
  onCoreLayerSelect,
  onVisualizerReady,
  setSelectedStoryPageId,
}: {
  sceneId?: string;
  storyId?: string;
  isBuilt?: boolean;
  showStoryPanel?: boolean;
  selectedLayer?: SelectedLayer | undefined;
  isVisualizerResizing?: MutableRefObject<boolean>;
  onCoreLayerSelect: (props: LayerSelectProps) => void;
  onVisualizerReady: (value: boolean) => void;
  setSelectedStoryPageId: (value: string | undefined) => void;
}) => {
  const { useUpdateWidget, useUpdateWidgetAlignSystem } = useWidgetsFetcher();
  const { useGetLayersQuery } = useLayersFetcher();
  const { useGetLayerStylesQuery } = useLayerStylesFetcher();
  const { useSceneQuery } = useSceneFetcher();
  const { useCreateStoryBlock, useDeleteStoryBlock } = useStorytellingFetcher();
  const { useUpdatePropertyValue, useAddPropertyItem, useMovePropertyItem, useRemovePropertyItem } =
    usePropertyFetcher();
  const {
    useInstallableInfoboxBlocksQuery,
    useCreateInfoboxBlock,
    useDeleteInfoboxBlock,
    useMoveInfoboxBlock,
  } = useInfoboxFetcher();

  const { nlsLayers } = useGetLayersQuery({ sceneId });
  const { layerStyles } = useGetLayerStylesQuery({ sceneId });

  const { scene } = useSceneQuery({ sceneId });

  const [zoomedLayerId, zoomToLayer] = useState<string | undefined>(undefined);

  const { viewerProperty, cesiumIonAccessToken } = useMemo(() => {
    const sceneProperty = processProperty(scene?.property);
    const cesiumIonAccessToken = sceneProperty?.default?.ion;
    return {
      viewerProperty: sceneProperty
        ? (convertData(sceneProperty, sceneProperty2ViewerPropertyMapping) as ViewerProperty)
        : undefined,
      cesiumIonAccessToken,
    };
  }, [scene?.property]);

  const { installableInfoboxBlocks } = useInstallableInfoboxBlocksQuery({ sceneId });

  const infoboxBlockNames = useMemo(
    () =>
      installableInfoboxBlocks
        ?.map(ib => ({ [ib.extensionId]: ib.name }))
        .filter((bn): bn is { [key: string]: string } => !!bn)
        .reduce((result, obj) => ({ ...result, ...obj }), {}),
    [installableInfoboxBlocks],
  );

  const layers = useMemo(() => {
    const processedLayers = processLayers(nlsLayers, layerStyles, undefined, infoboxBlockNames);
    if (!showStoryPanel) return processedLayers;
    return processedLayers?.map(layer => ({
      ...layer,
      visible: true,
    }));
  }, [nlsLayers, layerStyles, infoboxBlockNames, showStoryPanel]);

  const handleCoreLayerSelect = useCallback(
    (layerId?: string, computedLayer?: ComputedLayer, computedFeature?: ComputedFeature) => {
      if (
        (!layerId && !computedFeature && !selectedLayer) ??
        (layerId === selectedLayer?.layer?.id || !computedFeature)
      )
        return;

      if (layerId) {
        onCoreLayerSelect({ layerId, computedLayer, computedFeature });
      } else {
        onCoreLayerSelect(undefined);
      }
    },
    [selectedLayer, onCoreLayerSelect],
  );

  const handleLayerDrop = useCallback(
    async (_propertyId: string, propertyKey: string, _position?: LatLng) => {
      // propertyKey will be "default.location" for example
      const [_schemaGroupId, _fieldId] = propertyKey.split(".", 2);
    },
    [],
  );

  // Widgets
  const widgets = useMemo(() => convertWidgets(scene), [scene]);

  const handleWidgetUpdate = useCallback(
    async (id: string, update: { location?: Location; extended?: boolean; index?: number }) => {
      await useUpdateWidget(id, update, sceneId);
    },
    [sceneId, useUpdateWidget],
  );

  const handleWidgetAlignSystemUpdate = useCallback(
    async (location: Location, align: Alignment) => {
      await useUpdateWidgetAlignSystem(
        { zone: location.zone, section: location.section, area: location.area, align },
        sceneId,
      );
    },
    [sceneId, useUpdateWidgetAlignSystem],
  );

  // Plugin
  const pluginProperty = useMemo(
    () =>
      scene?.plugins.reduce<{ [key: string]: any }>(
        (a, b) => ({ ...a, [b.pluginId]: processProperty(b.property) }),
        {},
      ),
    [scene?.plugins],
  );

  const handleInfoboxBlockCreate = useCallback(
    async (pluginId: string, extensionId: string, index?: number) => {
      if (!selectedLayer?.layer?.id) return;
      await useCreateInfoboxBlock({
        layerId: selectedLayer.layer.id,
        pluginId,
        extensionId,
        index,
      });
    },
    [selectedLayer, useCreateInfoboxBlock],
  );

  const handleInfoboxBlockMove = useCallback(
    async (id: string, targetIndex: number) => {
      if (!selectedLayer?.layer?.id) return;
      await useMoveInfoboxBlock({
        layerId: selectedLayer.layer.id,
        infoboxBlockId: id,
        index: targetIndex,
      });
    },
    [selectedLayer, useMoveInfoboxBlock],
  );

  const handleInfoboxBlockRemove = useCallback(
    async (id?: string) => {
      if (!selectedLayer?.layer?.id || !id) return;
      await useDeleteInfoboxBlock({
        layerId: selectedLayer.layer.id,
        infoboxBlockId: id,
      });
    },
    [selectedLayer, useDeleteInfoboxBlock],
  );

  // Story
  const story = useMemo(() => convertStory(scene, storyId), [storyId, scene]);

  const handleStoryPageChange = useCallback(
    (pageId?: string) => {
      if (isVisualizerResizing?.current) return;
      setSelectedStoryPageId(pageId);
    },
    [isVisualizerResizing, setSelectedStoryPageId],
  );

  const handleStoryBlockCreate = useCallback(
    async (pageId?: string, extensionId?: string, pluginId?: string, index?: number) => {
      if (!extensionId || !pluginId || !storyId || !pageId) return;
      await useCreateStoryBlock({
        pluginId,
        extensionId,
        storyId,
        pageId,
        index,
      });
    },
    [storyId, useCreateStoryBlock],
  );

  const handleStoryBlockDelete = useCallback(
    async (pageId?: string, blockId?: string) => {
      if (!blockId || !storyId || !pageId) return;
      await useDeleteStoryBlock({ blockId, pageId, storyId });
    },
    [storyId, useDeleteStoryBlock],
  );

  const handlePropertyValueUpdate = useCallback(
    async (
      propertyId?: string,
      schemaItemId?: string,
      fieldId?: string,
      itemId?: string,
      vt?: any,
      v?: any,
    ) => {
      if (!propertyId || !schemaItemId || !fieldId || !vt) return;
      await useUpdatePropertyValue(propertyId, schemaItemId, itemId, fieldId, "en", v, vt);
    },
    [useUpdatePropertyValue],
  );

  const handlePropertyItemAdd = useCallback(
    async (propertyId?: string, schemaGroupId?: string) => {
      if (!propertyId || !schemaGroupId) return;
      await useAddPropertyItem(propertyId, schemaGroupId);
    },
    [useAddPropertyItem],
  );

  const handlePropertyItemMove = useCallback(
    async (propertyId?: string, schemaGroupId?: string, itemId?: string, index?: number) => {
      if (!propertyId || !schemaGroupId || !itemId || index === undefined) return;
      await useMovePropertyItem(propertyId, schemaGroupId, itemId, index);
    },
    [useMovePropertyItem],
  );

  const handlePropertyItemDelete = useCallback(
    async (propertyId?: string, schemaGroupId?: string, itemId?: string) => {
      if (!propertyId || !schemaGroupId || !itemId) return;
      await useRemovePropertyItem(propertyId, schemaGroupId, itemId);
    },
    [useRemovePropertyItem],
  );

  const engineMeta = useMemo(
    () => ({
      cesiumIonAccessToken:
        typeof cesiumIonAccessToken === "string" && cesiumIonAccessToken
          ? cesiumIonAccessToken
          : config()?.cesiumIonAccessToken,
    }),
    [cesiumIonAccessToken],
  );

  // TODO: Use GQL value
  const title = "TITLE";
  useEffect(() => {
    if (!isBuilt || !title) return;
    document.title = title;
  }, [isBuilt, title]);

  const handleMount = useCallback(() => onVisualizerReady(true), [onVisualizerReady]);

  // Camera
  const [currentCamera, setCurrentCamera] = useCurrentCamera();
  const handleCameraUpdate = useCallback(
    (camera: Camera) => {
      setCurrentCamera(camera);
    },
    [setCurrentCamera],
  );

  return {
    viewerProperty,
    pluginProperty,
    layers,
    widgets,
    story,
    engineMeta,
    zoomedLayerId,
    installableInfoboxBlocks,
    currentCamera,
    handleCameraUpdate,
    handleCoreLayerSelect,
    handleLayerDrop,
    handleStoryPageChange,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handleInfoboxBlockCreate,
    handleInfoboxBlockMove,
    handleInfoboxBlockRemove,
    handleWidgetUpdate,
    handleWidgetAlignSystemUpdate,
    handlePropertyValueUpdate,
    handlePropertyItemAdd,
    handlePropertyItemDelete,
    handlePropertyItemMove,
    handleMount,
    zoomToLayer,
  };
};
