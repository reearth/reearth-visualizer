import { useReactiveVar } from "@apollo/client";
import { useMemo, useEffect, useCallback } from "react";

import type { Alignment, Location } from "@reearth/beta/lib/core/Crust";
import type { LatLng, Tag, ValueTypes, ComputedLayer } from "@reearth/beta/lib/core/mantle";
import type { Layer, LayerSelectionReason, Cluster } from "@reearth/beta/lib/core/Map";
import type { ValueType } from "@reearth/beta/utils/value";
import {
  useLayersFetcher,
  useSceneFetcher,
  useWidgetsFetcher,
  useStorytellingFetcher,
  usePropertyFetcher,
  useLayerStylesFetcher,
} from "@reearth/services/api";
import type { Page } from "@reearth/services/api/storytellingApi/utils";
import { config } from "@reearth/services/config";
import {
  useSceneMode,
  useIsCapturing,
  useSelectedBlock,
  useWidgetAlignEditorActivated,
  selectedWidgetAreaVar,
  isVisualizerReadyVar,
  useZoomedLayerId,
  selectedLayerVar,
} from "@reearth/services/state";

import { convertWidgets, processLayers } from "./convert";
import { convertStory } from "./convert-story";
import type { BlockType } from "./type";

export default ({
  sceneId,
  storyId,
  isBuilt,
  currentPage,
  showStoryPanel,
}: {
  sceneId?: string;
  storyId?: string;
  isBuilt?: boolean;
  currentPage?: Page;
  showStoryPanel?: boolean;
}) => {
  const { useUpdateWidget, useUpdateWidgetAlignSystem } = useWidgetsFetcher();
  const { useGetLayersQuery } = useLayersFetcher();
  const { useGetLayerStylesQuery } = useLayerStylesFetcher();
  const { useSceneQuery } = useSceneFetcher();
  const { useCreateStoryBlock, useDeleteStoryBlock } = useStorytellingFetcher();
  const { useUpdatePropertyValue } = usePropertyFetcher();

  const { nlsLayers } = useGetLayersQuery({ sceneId });
  const { layerStyles } = useGetLayerStylesQuery({ sceneId });

  const { scene } = useSceneQuery({ sceneId });

  const [sceneMode, setSceneMode] = useSceneMode();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [widgetAlignEditorActivated] = useWidgetAlignEditorActivated();
  const [zoomedLayerId, zoomToLayer] = useZoomedLayerId();

  const selectedLayer = useReactiveVar(selectedLayerVar);

  const selectedWidgetArea = useReactiveVar(selectedWidgetAreaVar);
  const isVisualizerReady = useReactiveVar(isVisualizerReadyVar);

  const handleMount = useCallback(() => isVisualizerReadyVar(true), []);

  const onBlockMove = useCallback(
    async (_id: string, _fromIndex: number, _toIndex: number) => {
      if (!selectedLayer) return;
      console.log("Block has been moved!");
    },
    [selectedLayer],
  );

  const onBlockRemove = useCallback(
    async (_id: string) => {
      if (!selectedLayer) return;
      console.log("Block has been removed!");
    },
    [selectedLayer],
  );

  // convert data
  const layers = useMemo(() => {
    const processedLayers = processLayers(nlsLayers, layerStyles);
    if (!showStoryPanel) return processedLayers;
    return processedLayers?.map(layer => ({
      ...layer,
      visible: currentPage?.layersIds?.includes(layer.id),
    }));
  }, [nlsLayers, layerStyles, showStoryPanel, currentPage?.layersIds]);

  // TODO: Use GQL value
  const rootLayerId = "";

  const widgets = convertWidgets(scene);
  // TODO: Fix to use exact type through GQL typing
  const sceneProperty: any = useMemo(
    () => ({
      tiles: [
        {
          id: "default",
          tile_type: "default",
        },
      ],
    }),
    [],
  );
  const tags: Tag | undefined = useMemo(() => undefined, []);

  const clusters: Cluster[] = [];

  const pluginProperty = useMemo(() => undefined, []);

  const selectLayer = useCallback(
    async (
      id?: string,
      featureId?: string,
      layer?: () => Promise<ComputedLayer | undefined>,
      layerSelectionReason?: LayerSelectionReason,
    ) => {
      if (id === selectedLayer?.layerId && featureId === selectedLayer?.featureId) return;

      selectedLayerVar(
        id ? { layerId: id, featureId, layer: await layer?.(), layerSelectionReason } : undefined,
      );
    },
    [selectedLayer],
  );

  const onBlockChange = useCallback(
    async <T extends keyof ValueTypes>(
      blockId: string,
      _schemaGroupId: string,
      _fid: string,
      _v: ValueTypes[T],
      vt: T,
      selectedLayer?: Layer,
    ) => {
      const propertyId = (selectedLayer?.infobox?.blocks?.find(b => b.id === blockId) as any)
        ?.propertyId as string | undefined;
      if (!propertyId) return;

      console.log("Block has been changed!");
    },
    [],
  );

  // const onFovChange = useCallback(
  //   (fov: number) => camera && onCameraChange({ ...camera, fov }),
  //   [camera, onCameraChange],
  // );

  useEffect(() => {
    sceneProperty?.default?.sceneMode && setSceneMode(sceneProperty?.default?.sceneMode);
  }, [sceneProperty, setSceneMode]);

  // block selector
  const blocks: BlockType[] = useMemo(() => [], []);
  const onBlockInsert = (bi: number, _i: number, _p?: "top" | "bottom") => {
    const b = blocks?.[bi];
    if (b?.pluginId && b?.extensionId && selectedLayer) {
      console.log("Block has been inserted!");
    }
  };

  // TODO: Use GQL value
  const title = "TITLE";
  useEffect(() => {
    if (!isBuilt || !title) return;
    document.title = title;
  }, [isBuilt, title]);

  const handleDropLayer = useCallback(
    async (_propertyId: string, propertyKey: string, _position?: LatLng) => {
      // propertyKey will be "default.location" for example
      const [_schemaGroupId, _fieldId] = propertyKey.split(".", 2);
    },
    [],
  );

  const onWidgetUpdate = useCallback(
    async (id: string, update: { location?: Location; extended?: boolean; index?: number }) => {
      await useUpdateWidget(id, update, sceneId);
    },
    [sceneId, useUpdateWidget],
  );

  const onWidgetAlignSystemUpdate = useCallback(
    async (location: Location, align: Alignment) => {
      await useUpdateWidgetAlignSystem(
        { zone: location.zone, section: location.section, area: location.area, align },
        sceneId,
      );
    },
    [sceneId, useUpdateWidgetAlignSystem],
  );

  const story = useMemo(
    () => convertStory(scene?.stories.find(s => s.id === storyId)),
    [storyId, scene?.stories],
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
      vt?: ValueType,
      v?: ValueTypes[ValueType],
    ) => {
      if (!propertyId || !schemaItemId || !fieldId || !vt) return;
      await useUpdatePropertyValue(propertyId, schemaItemId, itemId, fieldId, "en", v, vt);
    },
    [useUpdatePropertyValue],
  );

  const engineMeta = useMemo(
    () => ({
      cesiumIonAccessToken: config()?.cesiumIonAccessToken,
    }),
    [],
  );

  const useExperimentalSandbox = useMemo(() => {
    return !!sceneProperty?.experimental?.experimental_sandbox;
  }, [sceneProperty]);

  return {
    sceneId,
    rootLayerId,
    selectedBlockId: selectedBlock,
    sceneProperty,
    pluginProperty,
    clusters,
    tags,
    widgets,
    layers,
    story,
    blocks,
    isCapturing,
    sceneMode,
    selectedWidgetArea,
    widgetAlignEditorActivated,
    engineMeta,
    useExperimentalSandbox,
    isVisualizerReady,
    selectWidgetArea: selectedWidgetAreaVar,
    zoomedLayerId,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handlePropertyValueUpdate,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
    onIsCapturingChange,
    handleDropLayer,
    handleMount,
    zoomToLayer,
  };
};
