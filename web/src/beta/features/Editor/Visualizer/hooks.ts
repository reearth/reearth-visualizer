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
} from "@reearth/services/api";
import { config } from "@reearth/services/config";
import {
  useSceneMode,
  useIsCapturing,
  useSelected,
  useSelectedBlock,
  useWidgetAlignEditorActivated,
  useZoomedLayerId,
  selectedWidgetAreaVar,
  isVisualizerReadyVar,
} from "@reearth/services/state";

import { convertStory, convertWidgets, processLayers } from "./convert";
import type { BlockType } from "./type";

export default ({
  sceneId,
  storyId,
  isBuilt,
}: {
  sceneId?: string;
  storyId?: string;
  isBuilt?: boolean;
}) => {
  const { useUpdateWidget, useUpdateWidgetAlignSystem } = useWidgetsFetcher();
  const { useGetLayersQuery } = useLayersFetcher();
  const { useSceneQuery } = useSceneFetcher();
  const { useCreateStoryBlock, useDeleteStoryBlock } = useStorytellingFetcher();
  const { useUpdatePropertyValue } = usePropertyFetcher();

  const { nlsLayers } = useGetLayersQuery({ sceneId });

  const { scene } = useSceneQuery({ sceneId });

  const [sceneMode, setSceneMode] = useSceneMode();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [selected, select] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [widgetAlignEditorActivated] = useWidgetAlignEditorActivated();
  const [zoomedLayerId, zoomToLayer] = useZoomedLayerId();

  const selectedWidgetArea = useReactiveVar(selectedWidgetAreaVar);
  const isVisualizerReady = useReactiveVar(isVisualizerReadyVar);

  const handleMount = useCallback(() => isVisualizerReadyVar(true), []);

  const onBlockMove = useCallback(
    async (_id: string, _fromIndex: number, _toIndex: number) => {
      if (selected?.type !== "layer") return;
      console.log("Block has been moved!");
    },
    [selected],
  );

  const onBlockRemove = useCallback(
    async (_id: string) => {
      if (selected?.type !== "layer") return;
      console.log("Block has been removed!");
    },
    [selected],
  );

  // convert data
  const selectedLayerId = useMemo(
    () =>
      selected?.type === "layer"
        ? { layerId: selected.layerId, featureId: selected.featureId }
        : undefined,
    [selected],
  );
  const layerSelectionReason = useMemo(
    () => (selected?.type === "layer" ? selected.layerSelectionReason : undefined),
    [selected],
  );

  const layers = useMemo(() => processLayers(nlsLayers), [nlsLayers]);

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

  // TODO: Don't forget handle featureId
  const selectLayer = useCallback(
    (
      id?: string,
      featureId?: string,
      _layer?: () => Promise<ComputedLayer | undefined>,
      layerSelectionReason?: LayerSelectionReason,
    ) => select(id ? { layerId: id, featureId, layerSelectionReason, type: "layer" } : undefined),
    [select],
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
    if (b?.pluginId && b?.extensionId && selected?.type === "layer") {
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

      console.log("Layer has been draped!");
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

  const story = useMemo(() => convertStory(scene, storyId), [scene, storyId]);

  const handleStoryBlockCreate = useCallback(
    (index?: number) => async (pageId?: string, extensionId?: string, pluginId?: string) => {
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
    selectedLayerId,
    zoomedLayerId,
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
    layerSelectionReason,
    useExperimentalSandbox,
    isVisualizerReady,
    selectWidgetArea: selectedWidgetAreaVar,
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
    zoomToLayer,
    handleMount,
  };
};
