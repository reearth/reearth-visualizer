import { useMemo, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";

import { ClusterProperty } from "@reearth/components/molecules/Visualizer";
import {
  Location,
  Alignment,
} from "@reearth/components/molecules/Visualizer/WidgetAlignSystem/hooks";
import {
  useGetLayersQuery,
  useGetEarthWidgetsQuery,
  useMoveInfoboxFieldMutation,
  useRemoveInfoboxFieldMutation,
  useChangePropertyValueMutation,
  useAddInfoboxFieldMutation,
  useGetBlocksQuery,
  useUpdateWidgetMutation,
  useUpdateWidgetAlignSystemMutation,
  WidgetZoneType,
  WidgetSectionType,
  WidgetAreaType,
  WidgetAreaAlign,
  ValueType,
} from "@reearth/gql";
import {
  useSceneId,
  useIsCapturing,
  useCamera,
  useSelected,
  useSelectedBlock,
  useWidgetAlignEditorActivated,
} from "@reearth/state";
import { valueTypeToGQL, ValueTypes, valueToGQL, LatLng } from "@reearth/util/value";

import {
  convertLayers,
  convertWidgets,
  convertToBlocks,
  convertProperty,
  processSceneTags,
} from "./convert";

export default (isBuilt?: boolean) => {
  const intl = useIntl();
  const [sceneId] = useSceneId();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [camera, onCameraChange] = useCamera();
  const [selected, select] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [widgetAlignEditorActivated] = useWidgetAlignEditorActivated();

  const [moveInfoboxField] = useMoveInfoboxFieldMutation();
  const [removeInfoboxField] = useRemoveInfoboxFieldMutation();
  const [changePropertyValue] = useChangePropertyValueMutation();

  const onBlockMove = useCallback(
    async (id: string, _fromIndex: number, toIndex: number) => {
      if (selected?.type !== "layer") return;
      await moveInfoboxField({
        variables: {
          layerId: selected.layerId,
          infoboxFieldId: id,
          index: toIndex,
          lang: intl.locale,
        },
      });
    },
    [intl.locale, moveInfoboxField, selected],
  );

  const onBlockRemove = useCallback(
    async (id: string) => {
      if (selected?.type !== "layer") return;
      await removeInfoboxField({
        variables: {
          layerId: selected.layerId,
          infoboxFieldId: id,
          lang: intl.locale,
        },
      });
    },
    [intl.locale, removeInfoboxField, selected],
  );

  const { data: layerData } = useGetLayersQuery({
    variables: { sceneId: sceneId ?? "", lang: intl.locale },
    skip: !sceneId,
  });
  const { data: sceneData } = useGetEarthWidgetsQuery({
    variables: { sceneId: sceneId ?? "", lang: intl.locale },
    skip: !sceneId,
  });

  const rootLayerId =
    layerData?.node?.__typename === "Scene" ? layerData.node.rootLayer?.id : undefined;
  const scene = sceneData?.node?.__typename === "Scene" ? sceneData.node : undefined;

  // convert data
  const selectedLayerId = selected?.type === "layer" ? selected.layerId : undefined;
  const layers = useMemo(() => convertLayers(layerData), [layerData]);
  const selectedLayer = selectedLayerId ? layers?.findById(selectedLayerId) : undefined;
  const widgets = useMemo(() => convertWidgets(sceneData), [sceneData]);
  const sceneProperty = useMemo(() => convertProperty(scene?.property), [scene?.property]);
  const tags = useMemo(() => processSceneTags(scene?.tags ?? []), [scene?.tags]);

  const clusterProperty = useMemo<ClusterProperty[]>(
    () =>
      scene?.clusters
        .map((a): any => ({ ...convertProperty(a.property), id: a.id }))
        .filter((c): c is ClusterProperty => !!c) ?? [],
    [scene?.clusters],
  );

  const pluginProperty = useMemo(
    () =>
      scene?.plugins.reduce<{ [key: string]: any }>(
        (a, b) => ({ ...a, [b.pluginId]: convertProperty(b.property) }),
        {},
      ),
    [scene?.plugins],
  );

  const selectLayer = useCallback(
    (id?: string) =>
      select(id && !!layers?.findById(id) ? { layerId: id, type: "layer" } : undefined),
    [layers, select],
  );

  const onBlockChange = useCallback(
    async <T extends keyof ValueTypes>(
      blockId: string,
      schemaGroupId: string,
      fid: string,
      v: ValueTypes[T],
      vt: T,
    ) => {
      const propertyId = (selectedLayer?.infobox?.blocks?.find(b => b.id === blockId) as any)
        ?.propertyId as string | undefined;
      if (!propertyId) return;

      const gvt = valueTypeToGQL(vt);
      if (!gvt) return;

      await changePropertyValue({
        variables: {
          propertyId,
          schemaGroupId,
          fieldId: fid,
          type: gvt,
          value: valueToGQL(v, vt),
          lang: intl.locale,
        },
      });
    },
    [changePropertyValue, intl.locale, selectedLayer?.infobox?.blocks],
  );

  const onFovChange = useCallback(
    (fov: number) => camera && onCameraChange({ ...camera, fov }),
    [camera, onCameraChange],
  );

  // block selector
  const [addInfoboxField] = useAddInfoboxFieldMutation();
  const { data: blockData } = useGetBlocksQuery({
    variables: { sceneId: sceneId ?? "", lang: intl.locale },
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
          lang: intl.locale,
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
    async (layerId: string, propertyKey: string, position: LatLng) => {
      const layer = layers?.findById(layerId);
      const propertyId = layer?.propertyId;
      if (!propertyId) return;

      // propertyKey will be "default.location" for example
      const [schemaGroupId, fieldId] = propertyKey.split(".", 2);

      await changePropertyValue({
        variables: {
          propertyId,
          schemaGroupId,
          fieldId,
          type: ValueType.Latlng,
          value: {
            lat: position.lat,
            lng: position.lng,
          },
        },
      });
    },
    [changePropertyValue, layers],
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

  return {
    sceneId,
    rootLayerId,
    selectedLayerId,
    selectedBlockId: selectedBlock,
    sceneProperty,
    pluginProperty,
    clusterProperty,
    tags,
    widgets,
    layers,
    selectedLayer,
    blocks,
    isCapturing,
    camera,
    widgetAlignEditorActivated,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
    onIsCapturingChange,
    onCameraChange,
    onFovChange,
    handleDropLayer,
  };
};
