import { useMemo, useEffect, useCallback } from "react";

import type { Alignment, Location } from "@reearth/beta/lib/core/Crust";
import type { LatLng, ComputedLayer, ComputedFeature } from "@reearth/beta/lib/core/mantle";
import type { LayerSelectionReason } from "@reearth/beta/lib/core/Map";
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
import {
  useWidgetAlignEditorActivated,
  useSelectedWidgetArea,
  useIsVisualizerReady,
  useZoomedLayerId,
  useSelectedLayer,
  useSelectedStoryPageId,
  useSelectedLayerStyle,
  useSelectedSceneSetting,
} from "@reearth/services/state";

import { convertWidgets, processLayers, processProperty } from "./convert";
import { convertStory } from "./convert-story";

export default ({
  sceneId,
  storyId,
  isBuilt,
  showStoryPanel,
}: {
  sceneId?: string;
  storyId?: string;
  isBuilt?: boolean;
  showStoryPanel?: boolean;
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

  const [_, selectSelectedStoryPageId] = useSelectedStoryPageId();
  const [widgetAlignEditorActivated] = useWidgetAlignEditorActivated();
  const [zoomedLayerId, zoomToLayer] = useZoomedLayerId();

  const [selectedLayer, setSelectedLayer] = useSelectedLayer();
  const [, setSelectedLayerStyle] = useSelectedLayerStyle();
  const [, setSelectedSceneSetting] = useSelectedSceneSetting();

  const [selectedWidgetArea, setSelectedWidgetArea] = useSelectedWidgetArea();
  const [isVisualizerReady, setIsVisualizerReady] = useIsVisualizerReady();

  const handleMount = useCallback(() => setIsVisualizerReady(true), [setIsVisualizerReady]);

  // Scene property
  // TODO: Fix to use exact type through GQL typing
  const sceneProperty = useMemo(() => processProperty(scene?.property), [scene?.property]);

  // Layers
  const rootLayerId = useMemo(() => scene?.rootLayerId, [scene?.rootLayerId]);

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

  const handleLayerSelect = useCallback(
    async (
      id?: string,
      layer?: () => Promise<ComputedLayer | undefined>,
      feature?: ComputedFeature,
      layerSelectionReason?: LayerSelectionReason,
    ) => {
      if ((!id && !feature && !selectedLayer) ?? (id === selectedLayer?.layerId || !feature))
        return;
      if (id) {
        setSelectedLayerStyle(undefined);
        setSelectedSceneSetting(undefined);
      }
      setSelectedLayer(
        id ? { layerId: id, layer: await layer?.(), feature, layerSelectionReason } : undefined,
      );
    },
    [selectedLayer, setSelectedLayer, setSelectedLayerStyle, setSelectedSceneSetting],
  );

  const handleLayerDrop = useCallback(
    async (_propertyId: string, propertyKey: string, _position?: LatLng) => {
      // propertyKey will be "default.location" for example
      const [_schemaGroupId, _fieldId] = propertyKey.split(".", 2);
    },
    [],
  );

  // Widgets
  const widgets = convertWidgets(scene);

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
      if (!selectedLayer) return;
      await useCreateInfoboxBlock({
        layerId: selectedLayer.layerId,
        pluginId,
        extensionId,
        index,
      });
    },
    [selectedLayer, useCreateInfoboxBlock],
  );

  const handleInfoboxBlockMove = useCallback(
    async (id: string, targetIndex: number) => {
      if (!selectedLayer) return;
      await useMoveInfoboxBlock({
        layerId: selectedLayer.layerId,
        infoboxBlockId: id,
        index: targetIndex,
      });
    },
    [selectedLayer, useMoveInfoboxBlock],
  );

  const handleInfoboxBlockRemove = useCallback(
    async (id?: string) => {
      if (!selectedLayer || !id) return;
      await useDeleteInfoboxBlock({
        layerId: selectedLayer.layerId,
        infoboxBlockId: id,
      });
    },
    [selectedLayer, useDeleteInfoboxBlock],
  );

  // Story
  const story = useMemo(() => convertStory(scene, storyId), [storyId, scene]);

  const handleStoryPageChange = useCallback(
    (pageId?: string) => selectSelectedStoryPageId(pageId),
    [selectSelectedStoryPageId],
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
      cesiumIonAccessToken: config()?.cesiumIonAccessToken,
    }),
    [],
  );

  // TODO: Use GQL value
  const title = "TITLE";
  useEffect(() => {
    if (!isBuilt || !title) return;
    document.title = title;
  }, [isBuilt, title]);

  return {
    rootLayerId,
    sceneProperty,
    pluginProperty,
    layers,
    widgets,
    story,
    selectedWidgetArea,
    widgetAlignEditorActivated,
    engineMeta,
    useExperimentalSandbox: false, // TODO: test and use new sandbox in beta solely, removing old way too.
    isVisualizerReady, // Not being used (as of 2024/04)
    zoomedLayerId,
    installableInfoboxBlocks,
    handleLayerSelect,
    handleLayerDrop,
    handleStoryPageChange,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handleInfoboxBlockCreate,
    handleInfoboxBlockMove,
    handleInfoboxBlockRemove,
    handleWidgetUpdate,
    handleWidgetAlignSystemUpdate,
    selectWidgetArea: setSelectedWidgetArea,
    handlePropertyValueUpdate,
    handlePropertyItemAdd,
    handlePropertyItemDelete,
    handlePropertyItemMove,
    handleMount,
    zoomToLayer,
  };
};
