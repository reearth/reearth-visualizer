import { useMemo, useEffect, useCallback } from "react";

import type { Alignment, Location } from "@reearth/classic/core/Crust";
import {
  convertLegacyLayer,
  convertLegacyCluster,
  type ComputedLayer,
  type LegacyCluster,
} from "@reearth/classic/core/mantle";
import type { Layer, LayerSelectionReason } from "@reearth/classic/core/Map";
import {
  useGetLayersQuery,
  useGetEarthWidgetsQuery,
  useMoveInfoboxFieldMutation,
  useRemoveInfoboxFieldMutation,
  useUpdatePropertyValueMutation,
  useAddInfoboxFieldMutation,
  useGetBlocksQuery,
  useUpdateWidgetMutation,
  useUpdateWidgetAlignSystemMutation,
  type WidgetZoneType,
  type WidgetSectionType,
  type WidgetAreaType,
  type WidgetAreaAlign,
  ValueType,
} from "@reearth/classic/gql";
import {
  valueTypeToGQL,
  type ValueTypes,
  valueToGQL,
  type LatLng,
} from "@reearth/classic/util/value";
import { config } from "@reearth/services/config";
import { useLang } from "@reearth/services/i18n";
import {
  useSceneId,
  useSceneMode,
  useIsCapturing,
  useCamera,
  useSelected,
  useSelectedBlock,
  useWidgetAlignEditorActivated,
  useZoomedLayerId,
  useSelectedWidgetArea,
} from "@reearth/services/state";

import {
  convertWidgets,
  convertToBlocks,
  processSceneTags,
  processLayer,
  processProperty,
  extractDatasetSchemas,
  RawLayer,
} from "../../CanvasArea/convert";
import { useDatasets } from "../../CanvasArea/hooks_dataset";

export default (isBuilt?: boolean) => {
  const lang = useLang();
  const [sceneId] = useSceneId();
  const [sceneMode, setSceneMode] = useSceneMode();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [camera, onCameraChange] = useCamera();
  const [selected, select] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [selectedWidgetArea, selectWidgetArea] = useSelectedWidgetArea();
  const [widgetAlignEditorActivated] = useWidgetAlignEditorActivated();
  const [zoomedLayerId, zoomToLayer] = useZoomedLayerId();

  const [moveInfoboxField] = useMoveInfoboxFieldMutation();
  const [removeInfoboxField] = useRemoveInfoboxFieldMutation();
  const [updatePropertyValue] = useUpdatePropertyValueMutation();

  const onBlockMove = useCallback(
    async (id: string, _fromIndex: number, toIndex: number) => {
      if (selected?.type !== "layer") return;
      await moveInfoboxField({
        variables: {
          layerId: selected.layerId,
          infoboxFieldId: id,
          index: toIndex,
          lang,
        },
      });
    },
    [lang, moveInfoboxField, selected],
  );

  const onBlockRemove = useCallback(
    async (id: string) => {
      if (selected?.type !== "layer") return;
      await removeInfoboxField({
        variables: {
          layerId: selected.layerId,
          infoboxFieldId: id,
          lang,
        },
      });
    },
    [lang, removeInfoboxField, selected],
  );

  const { data: layerData } = useGetLayersQuery({
    variables: { sceneId: sceneId ?? "", lang: lang },
    skip: !sceneId,
  });
  const { data: sceneData } = useGetEarthWidgetsQuery({
    variables: { sceneId: sceneId ?? "", lang: lang },
    skip: !sceneId,
  });

  const rootLayerId =
    layerData?.node?.__typename === "Scene" ? layerData.node.rootLayer?.id : undefined;
  const scene = sceneData?.node?.__typename === "Scene" ? sceneData.node : undefined;

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

  // datasets
  const datasetSchemaIds = useMemo(
    () =>
      layerData?.node && layerData.node.__typename === "Scene" && layerData.node.rootLayer
        ? extractDatasetSchemas(layerData.node.rootLayer as RawLayer)
        : undefined,
    [layerData],
  );

  const { datasets, loaded: datasetLoaded } = useDatasets(datasetSchemaIds);

  const layers = useMemo(() => {
    const l =
      datasetLoaded &&
      layerData?.node &&
      layerData.node.__typename === "Scene" &&
      layerData.node.rootLayer
        ? convertLegacyLayer(
            processLayer(layerData?.node.rootLayer as RawLayer, undefined, datasets),
          )
        : undefined;
    return l ? [l] : undefined;
  }, [datasetLoaded, datasets, layerData?.node]);

  const widgets = useMemo(() => convertWidgets(sceneData), [sceneData]);
  const sceneProperty = useMemo(() => processProperty(scene?.property), [scene?.property]);
  const tags = useMemo(() => processSceneTags(scene?.tags ?? []), [scene?.tags]);

  const legacyClusters = useMemo<LegacyCluster[]>(
    () =>
      scene?.clusters
        .map((a): any => ({ ...processProperty(a.property), id: a.id }))
        .filter((c): c is LegacyCluster => !!c) ?? [],
    [scene?.clusters],
  );
  const clusters = convertLegacyCluster(legacyClusters);

  const pluginProperty = useMemo(
    () =>
      scene?.plugins.reduce<{ [key: string]: any }>(
        (a, b) => ({ ...a, [b.pluginId]: processProperty(b.property) }),
        {},
      ),
    [scene?.plugins],
  );

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
      schemaGroupId: string,
      fid: string,
      v: ValueTypes[T],
      vt: T,
      selectedLayer?: Layer,
    ) => {
      const propertyId = (selectedLayer?.infobox?.blocks?.find(b => b.id === blockId) as any)
        ?.propertyId as string | undefined;
      if (!propertyId) return;

      const gvt = valueTypeToGQL(vt);
      if (!gvt) return;

      await updatePropertyValue({
        variables: {
          propertyId,
          schemaGroupId,
          fieldId: fid,
          type: gvt,
          value: valueToGQL(v, vt),
          lang,
        },
      });
    },
    [updatePropertyValue, lang],
  );

  const onFovChange = useCallback(
    (fov: number) => camera && onCameraChange({ ...camera, fov }),
    [camera, onCameraChange],
  );

  useEffect(() => {
    sceneProperty?.default?.sceneMode && setSceneMode(sceneProperty?.default?.sceneMode);
  }, [sceneProperty, setSceneMode]);

  // block selector
  const [addInfoboxField] = useAddInfoboxFieldMutation();
  const { data: blockData } = useGetBlocksQuery({
    variables: { sceneId: sceneId ?? "", lang: lang },
    skip: !sceneId,
  });
  const blocks = useMemo(() => convertToBlocks(blockData), [blockData]);
  const onBlockInsert = (bi: number, i: number, p?: "top" | "bottom") => {
    const b = blocks?.[bi];
    if (b?.pluginId && b?.extensionId && selected?.type === "layer") {
      addInfoboxField({
        variables: {
          layerId: selected.layerId,
          pluginId: b.pluginId,
          extensionId: b.extensionId,
          index: p ? i + (p === "bottom" ? 1 : 0) : undefined,
          lang,
        },
      });
    }
  };

  const title = scene?.project?.publicTitle;
  useEffect(() => {
    if (!isBuilt || !title) return;
    document.title = title;
  }, [isBuilt, title]);

  const handleDropLayer = useCallback(
    async (propertyId: string, propertyKey: string, position?: LatLng) => {
      // propertyKey will be "default.location" for example
      const [schemaGroupId, fieldId] = propertyKey.split(".", 2);

      await updatePropertyValue({
        variables: {
          propertyId,
          schemaGroupId,
          fieldId,
          type: ValueType.Latlng,
          value: {
            lat: position?.lat,
            lng: position?.lng,
          },
        },
      });
    },
    [updatePropertyValue],
  );

  const [updateWidgetMutation] = useUpdateWidgetMutation();
  const onWidgetUpdate = useCallback(
    async (id: string, update: { location?: Location; extended?: boolean; index?: number }) => {
      if (!sceneId) return;

      await updateWidgetMutation({
        variables: {
          sceneId,
          widgetId: id,
          enabled: true,
          location: update.location
            ? {
                zone: update.location.zone?.toUpperCase() as WidgetZoneType,
                section: update.location.section?.toUpperCase() as WidgetSectionType,
                area: update.location.area?.toUpperCase() as WidgetAreaType,
              }
            : undefined,
          extended: update.extended,
          index: update.index,
        },
        refetchQueries: ["GetEarthWidgets"],
      });
    },
    [sceneId, updateWidgetMutation],
  );

  const [updateWidgetAlignSystemMutation] = useUpdateWidgetAlignSystemMutation();
  const onWidgetAlignSystemUpdate = useCallback(
    async (location: Location, align: Alignment) => {
      if (!sceneId) return;

      updateWidgetAlignSystemMutation({
        variables: {
          sceneId,
          location: {
            zone: location.zone.toUpperCase() as WidgetZoneType,
            section: location.section.toUpperCase() as WidgetSectionType,
            area: location.area.toUpperCase() as WidgetAreaType,
          },
          align: align?.toUpperCase() as WidgetAreaAlign,
        },
      });
    },
    [sceneId, updateWidgetAlignSystemMutation],
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
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    selectWidgetArea,
    onWidgetAlignSystemUpdate,
    onIsCapturingChange,
    onCameraChange,
    onFovChange,
    handleDropLayer,
    zoomToLayer,
  };
};
