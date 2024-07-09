import { useCallback } from "react";

import {
  useUpdatePropertyValueMutation,
  useRemoveInfoboxFieldMutation,
  useRemoveInfoboxMutation,
  useCreateInfoboxMutation,
  useUploadFileToPropertyMutation,
  useRemovePropertyFieldMutation,
  useAddPropertyItemMutation,
  useMovePropertyItemMutation,
  useRemovePropertyItemMutation,
  ValueType as GQLValueType,
  useLinkDatasetMutation,
  useUpdatePropertyItemsMutation,
  ListOperation,
  useUpdateWidgetAlignSystemMutation,
  WidgetAreaType,
  WidgetSectionType,
  WidgetZoneType,
} from "@reearth/beta/graphql";
import {
  ValueTypes,
  ValueType,
} from "@reearth/classic/components/molecules/EarthEditor/PropertyPane";
import { valueTypeToGQL, Camera, toGQLSimpleValue, valueToGQL } from "@reearth/classic/util/value";
import { useLang } from "@reearth/services/i18n";
import {
  useSelected,
  useRootLayerId,
  useIsCapturing,
  useCamera,
  useWorkspace,
  useSceneId,
  useSceneMode,
  useSelectedBlock,
  useWidgetAlignEditorActivated,
  useSelectedWidgetArea,
} from "@reearth/services/state";

import useQueries, { Mode as RawMode } from "./hooks-queries";

export type Mode = RawMode;

export type FieldPointer = {
  itemId?: string;
  fieldId: string;
};

export type WidgetAlignment = "start" | "centered" | "end";

export type WidgetAreaPadding = { top: number; bottom: number; left: number; right: number };

export type WidgetAreaState = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
  align?: WidgetAlignment;
  padding?: WidgetAreaPadding;
  gap?: number | null;
  centered?: boolean;
  background?: string;
};

export default (mode: Mode) => {
  const lang = useLang();
  const [selected] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [rootLayerId] = useRootLayerId();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [camera, setCamera] = useCamera();
  const [sceneMode] = useSceneMode();
  const [workspace] = useWorkspace();

  const [sceneId] = useSceneId();
  const [widgetAlignEditorActivated, setWidgetAlignEditorActivated] =
    useWidgetAlignEditorActivated();
  const [selectedWidgetArea, selectWidgetArea] = useSelectedWidgetArea();

  const {
    loading,
    error,
    pane,
    isLayerGroup,
    linkedDatasetSchemaId,
    linkedDatasetId,
    isInfoboxCreatable,
    datasetSchemas,
    layers,
    selectedWidget,
  } = useQueries({
    mode,
    sceneId,
    rootLayerId,
    selectedBlock,
    selected,
    locale: lang,
  });

  const [updateWidgetAlignSystemMutation] = useUpdateWidgetAlignSystemMutation({
    refetchQueries: ["GetEarthWidgets"],
  });
  const handleAreaStateChange = useCallback(
    async (widgetAreaState?: WidgetAreaState) => {
      if (!sceneId || !widgetAreaState) return;

      const results = await updateWidgetAlignSystemMutation({
        variables: {
          sceneId,
          location: {
            area: widgetAreaState.area.toUpperCase() as WidgetAreaType,
            section: widgetAreaState.section.toUpperCase() as WidgetSectionType,
            zone: widgetAreaState.zone.toUpperCase() as WidgetZoneType,
          },
          background: widgetAreaState.background,
          padding: widgetAreaState.padding,
          centered: widgetAreaState.centered,
          gap: widgetAreaState.gap,
        },
      });
      if (results.data?.updateWidgetAlignSystem) {
        selectWidgetArea(widgetAreaState);
      }
    },
    [sceneId, updateWidgetAlignSystemMutation, selectWidgetArea],
  );

  const [updatePropertyValue] = useUpdatePropertyValueMutation();
  const changeValue = useCallback(
    (
      propertyId: string,
      schemaGroupId: string,
      itemId: string | undefined,
      fieldId: string,
      v: ValueTypes[ValueType] | undefined,
      vt: ValueType,
    ) => {
      const gvt = valueTypeToGQL(vt);
      if (!gvt) return;
      updatePropertyValue({
        variables: {
          propertyId,
          itemId,
          schemaGroupId,
          fieldId,
          value: valueToGQL(v, vt),
          type: gvt,
          lang: lang,
        },
      });
    },
    [updatePropertyValue, lang],
  );

  const [linkDataset] = useLinkDatasetMutation({
    refetchQueries: ["GetLayers"],
  });
  const link = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string | undefined,
      fieldId: string,
      schema: string,
      dataset: string | undefined,
      field: string,
    ) => {
      await linkDataset({
        variables: {
          propertyId,
          itemId,
          fieldId,
          schemaGroupId,
          datasetSchemaIds: [schema],
          datasetIds: dataset ? [dataset] : null,
          datasetFieldIds: [field],
          lang: lang,
        },
      });
    },
    [lang, linkDataset],
  );

  const [uploadFileMutation] = useUploadFileToPropertyMutation();
  const uploadFile = useCallback(
    (
      propertyId: string,
      schemaGroupId: string,
      itemId: string | undefined,
      fieldId: string,
      file: File,
    ) => {
      uploadFileMutation({
        variables: { propertyId, itemId, schemaGroupId, fieldId, file, lang: lang },
      });
    },
    [lang, uploadFileMutation],
  );

  const removeFile = useCallback(
    (propertyId: string, schemaGroupId: string, itemId: string | undefined, fieldId: string) => {
      updatePropertyValue({
        variables: {
          propertyId,
          fieldId,
          itemId,
          schemaGroupId,
          type: GQLValueType.Url,
          value: null,
          lang: lang,
        },
      });
    },
    [updatePropertyValue, lang],
  );

  const [removeFieldMutation] = useRemovePropertyFieldMutation();
  const removeField = useCallback(
    (propertyId: string, schemaGroupId: string, itemId: string | undefined, fieldId: string) => {
      removeFieldMutation({
        variables: {
          propertyId,
          fieldId,
          itemId,
          schemaGroupId,
          lang: lang,
        },
      });
    },
    [lang, removeFieldMutation],
  );

  const [createInfoboxMutation] = useCreateInfoboxMutation();
  const createInfobox = useCallback(() => {
    if (selected?.type !== "layer") return;
    return createInfoboxMutation({
      variables: { layerId: selected.layerId, lang: lang },
    });
  }, [createInfoboxMutation, selected, lang]);

  const [removeInfoboxMutation] = useRemoveInfoboxMutation();
  const removeInfobox = useCallback(() => {
    if (selected?.type !== "layer") return;
    return removeInfoboxMutation({
      variables: { layerId: selected.layerId, lang: lang },
    });
  }, [removeInfoboxMutation, selected, lang]);

  const [removeInfoboxFieldMutation] = useRemoveInfoboxFieldMutation();
  const removeInfoboxField = useCallback(() => {
    if (!selectedBlock || selected?.type !== "layer") return;
    selectBlock(undefined);
    return removeInfoboxFieldMutation({
      variables: { layerId: selected.layerId, infoboxFieldId: selectedBlock, lang: lang },
    });
  }, [selectedBlock, selected, selectBlock, removeInfoboxFieldMutation, lang]);

  const onCameraChange = useCallback(
    (value: Partial<Camera>) => {
      if (camera) setCamera({ ...camera, ...value });
    },
    [camera, setCamera],
  );

  const [addPropertyItemMutation] = useAddPropertyItemMutation();
  const addPropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      value?: ValueTypes[ValueType],
      valueType?: ValueType,
    ) => {
      await addPropertyItemMutation({
        variables: {
          propertyId,
          schemaGroupId,
          nameFieldValue: toGQLSimpleValue(value),
          nameFieldType: valueType ? valueTypeToGQL(valueType) : undefined,
          lang: lang,
        },
      });
    },
    [addPropertyItemMutation, lang],
  );

  const [movePropertyItemMutation] = useMovePropertyItemMutation();
  const movePropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string,
      _from: number,
      to: number,
    ) => {
      await movePropertyItemMutation({
        variables: {
          propertyId,
          schemaGroupId,
          itemId,
          index: to,
          lang: lang,
        },
      });
    },
    [lang, movePropertyItemMutation],
  );

  const [removePropertyItemMutation] = useRemovePropertyItemMutation();
  const removePropertyItem = useCallback(
    async (propertyId: string, schemaGroupId: string, itemId: string) => {
      await removePropertyItemMutation({
        variables: {
          propertyId,
          schemaGroupId,
          itemId,
          lang: lang,
        },
      });
    },
    [lang, removePropertyItemMutation],
  );

  const onWidgetEditorActivate = useCallback(
    (enabled: boolean) => {
      setWidgetAlignEditorActivated(enabled);
      if (!enabled) selectWidgetArea();
    },
    [setWidgetAlignEditorActivated, selectWidgetArea],
  );

  const [updatePropertyItemsMutation] = useUpdatePropertyItemsMutation();
  const updatePropertyItems = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      items: {
        itemId?: string;
        layerId?: string;
        from: number;
        to: number;
      }[],
    ) => {
      await updatePropertyItemsMutation({
        variables: {
          propertyId,
          schemaGroupId,
          operations: items.map(item => ({
            operation:
              item.from === -1
                ? ListOperation.Add
                : item.to === -1
                ? ListOperation.Remove
                : ListOperation.Move,
            itemId: item.itemId,
            index: item.to,
            nameFieldValue: item.layerId,
            nameFieldType: item.layerId ? GQLValueType.Ref : undefined,
          })),
          lang: lang,
        },
      });
    },
    [lang, updatePropertyItemsMutation],
  );

  return {
    pane,
    workspaceId: workspace?.id,
    error,
    loading,
    isLayerGroup,
    linkedDatasetSchemaId,
    linkedDatasetId,
    changeValue,
    removeField,
    link,
    uploadFile,
    removeFile,
    createInfobox,
    removeInfobox,
    removeInfoboxField,
    isInfoboxCreatable,
    isCapturing,
    onIsCapturingChange,
    camera,
    onCameraChange,
    sceneMode,
    addPropertyItem,
    movePropertyItem,
    removePropertyItem,
    onWidgetAlignEditorActivate: onWidgetEditorActivate,
    widgetAlignEditorActivated: widgetAlignEditorActivated,
    selectedWidgetArea,
    selectedWidget,
    handleAreaStateChange,
    updatePropertyItems,
    datasetSchemas,
    layers,
  };
};
