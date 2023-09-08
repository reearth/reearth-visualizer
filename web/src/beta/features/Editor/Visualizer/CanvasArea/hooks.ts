import { useReactiveVar } from "@apollo/client";
import { useMemo, useEffect, useCallback, useState } from "react";

import type { Alignment, Location } from "@reearth/beta/lib/core/Crust";
import type { LatLng, Tag, ValueTypes, ComputedLayer } from "@reearth/beta/lib/core/mantle";
import type { Layer, LayerSelectionReason, Cluster } from "@reearth/beta/lib/core/Map";
import { useLayersFetcher, useSceneFetcher, useWidgetsFetcher } from "@reearth/services/api";
import { config } from "@reearth/services/config";
import {
  useSceneMode,
  useIsCapturing,
  useCamera,
  useSelected,
  useSelectedBlock,
  useWidgetAlignEditorActivated,
  useZoomedLayerId,
  selectedWidgetAreaVar,
} from "@reearth/services/state";

import { convertWidgets, processLayers } from "./convert";
import { BlockType } from "./type";

export default ({ sceneId, isBuilt }: { sceneId?: string; isBuilt?: boolean }) => {
  const { useUpdateWidget, useUpdateWidgetAlignSystem } = useWidgetsFetcher();
  const { useGetLayersQuery } = useLayersFetcher();
  const { nlsLayers } = useGetLayersQuery({ sceneId });
  const { useSceneQuery } = useSceneFetcher();
  const { scene } = useSceneQuery({ sceneId });

  const [sceneMode, setSceneMode] = useSceneMode();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [camera, onCameraChange] = useCamera();
  const [selected, select] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const selectedWidgetArea = useReactiveVar(selectedWidgetAreaVar);
  const [widgetAlignEditorActivated] = useWidgetAlignEditorActivated();
  const [zoomedLayerId, zoomToLayer] = useZoomedLayerId();

  const [isVisualizerReady, setIsVisualizerReady] = useState(false);
  const handleMount = useCallback(() => {
    setIsVisualizerReady(true);
  }, []);

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

  const onFovChange = useCallback(
    (fov: number) => camera && onCameraChange({ ...camera, fov }),
    [camera, onCameraChange],
  );

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
    blocks,
    isCapturing,
    sceneMode,
    camera,
    selectedWidgetArea,
    widgetAlignEditorActivated,
    engineMeta,
    layerSelectionReason,
    useExperimentalSandbox,
    isVisualizerReady,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    selectWidgetArea: selectedWidgetAreaVar,
    onWidgetAlignSystemUpdate,
    onIsCapturingChange,
    onCameraChange,
    onFovChange,
    handleDropLayer,
    zoomToLayer,
    handleMount,
  };
};
