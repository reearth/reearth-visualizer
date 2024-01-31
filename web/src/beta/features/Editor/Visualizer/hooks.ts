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

  const layers = useMemo(() => {
    const processedLayers = processLayers(nlsLayers, layerStyles);
    if (!showStoryPanel) return processedLayers;
    return processedLayers?.map(layer => ({
      ...layer,
      visible: true,
    }));
  }, [nlsLayers, layerStyles, showStoryPanel]);

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

  const handleInfoboxBlockMove = useCallback(
    async (id: string, targetIndex: number) => {
      if (!selectedLayer) return;
      console.log("Block has been moved!", id, targetIndex);
    },
    [selectedLayer],
  );

  const handleInfoboxBlockRemove = useCallback(
    async (id: string) => {
      if (!selectedLayer) return;
      console.log("Block has been removed!", id);
    },
    [selectedLayer],
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
    isVisualizerReady,
    zoomedLayerId,
    handleLayerSelect,
    handleLayerDrop,
    handleStoryPageChange,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
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
