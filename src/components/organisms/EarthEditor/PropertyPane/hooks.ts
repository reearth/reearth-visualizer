import { useCallback } from "react";

import {
  useChangePropertyValueMutation,
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
  useAddWidgetMutation,
  useUpdateWidgetMutation,
  useUpdatePropertyItemsMutation,
  ListOperation,
  useCreateAssetMutation,
} from "@reearth/gql";
import { useLocalState } from "@reearth/state";
import { valueTypeToGQL, Camera, toGQLSimpleValue, valueToGQL } from "@reearth/util/value";
import { ValueTypes, ValueType } from "@reearth/components/molecules/EarthEditor/PropertyPane";
import useQueries, { Mode as RawMode } from "./hooks-queries";

export type Mode = RawMode;

export type FieldPointer = {
  itemId?: string;
  fieldId: string;
};

export default (mode: Mode) => {
  const [
    {
      rootLayerId,
      selectedLayer,
      selectedBlock,
      selectedWidgetId,
      isCapturing,
      camera,
      sceneId,
      teamId,
    },
    setLocalState,
  ] = useLocalState(s => ({
    rootLayerId: s.rootLayerId,
    selectedLayer: s.selectedLayer,
    selectedBlock: s.selectedBlock,
    selectedWidgetId: s.selectedWidget,
    isCapturing: s.isCapturing,
    camera: s.camera,
    teamId: s.currentTeam?.id,
    sceneId: s.sceneId,
  }));

  const {
    loading,
    error,
    pane,
    isLayerGroup,
    linkedDatasetSchemaId,
    linkedDatasetId,
    isInfoboxCreatable,
    datasetSchemas,
    scene,
    layers,
    assets,
    selectedWidget,
  } = useQueries({
    mode,
    sceneId,
    rootLayerId,
    selectedLayer,
    selectedBlock,
    selectedWidgetId,
    teamId,
  });

  const [changeValueMutation] = useChangePropertyValueMutation();
  const changeValue = useCallback(
    (
      propertyId: string,
      schemaItemId: string,
      itemId: string | undefined,
      fieldId: string,
      v: ValueTypes[ValueType] | null,
      vt: ValueType,
    ) => {
      const gvt = valueTypeToGQL(vt);
      if (!gvt) return;
      changeValueMutation({
        variables: {
          propertyId,
          itemId,
          schemaItemId,
          fieldId,
          value: valueToGQL(v, vt),
          type: gvt,
        },
      });
    },
    [changeValueMutation],
  );

  const [linkDataset] = useLinkDatasetMutation({
    refetchQueries: ["GetLayers"],
  });
  const link = useCallback(
    async (
      propertyId: string,
      schemaItemId: string,
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
          schemaItemId,
          datasetSchemaIds: [schema],
          datasetIds: dataset ? [dataset] : null,
          datasetFieldIds: [field],
        },
      });
    },
    [linkDataset],
  );

  const [uploadFileMutation] = useUploadFileToPropertyMutation();
  const uploadFile = useCallback(
    (
      propertyId: string,
      schemaItemId: string,
      itemId: string | undefined,
      fieldId: string,
      file: File,
    ) => {
      uploadFileMutation({ variables: { propertyId, itemId, schemaItemId, fieldId, file } });
    },
    [uploadFileMutation],
  );

  const [createAssetMutation] = useCreateAssetMutation();
  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (teamId) {
          await Promise.all(
            Array.from(files).map(file =>
              createAssetMutation({ variables: { teamId, file }, refetchQueries: ["Assets"] }),
            ),
          );
        }
      })(),
    [createAssetMutation, teamId],
  );

  const removeFile = useCallback(
    (propertyId: string, schemaItemId: string, itemId: string | undefined, fieldId: string) => {
      changeValueMutation({
        variables: {
          propertyId,
          fieldId,
          itemId,
          schemaItemId,
          type: GQLValueType.Url,
          value: null,
        },
      });
    },
    [changeValueMutation],
  );

  const [removeFieldMutation] = useRemovePropertyFieldMutation();
  const removeField = useCallback(
    (propertyId: string, schemaItemId: string, itemId: string | undefined, fieldId: string) => {
      removeFieldMutation({
        variables: {
          propertyId,
          fieldId,
          itemId,
          schemaItemId,
        },
      });
    },
    [removeFieldMutation],
  );

  const [createInfoboxMutation] = useCreateInfoboxMutation();
  const createInfobox = useCallback(() => {
    if (!selectedLayer) return;
    return createInfoboxMutation({
      variables: { layerId: selectedLayer },
    });
  }, [createInfoboxMutation, selectedLayer]);

  const [removeInfoboxMutation] = useRemoveInfoboxMutation();
  const removeInfobox = useCallback(() => {
    if (!selectedLayer) return;
    return removeInfoboxMutation({
      variables: { layerId: selectedLayer },
    });
  }, [removeInfoboxMutation, selectedLayer]);

  const [removeInfoboxFieldMutation] = useRemoveInfoboxFieldMutation();
  const removeInfoboxField = useCallback(() => {
    if (!selectedBlock || !selectedLayer) return;
    setLocalState({ selectedBlock: undefined });
    return removeInfoboxFieldMutation({
      variables: { layerId: selectedLayer, infoboxFieldId: selectedBlock },
    });
  }, [removeInfoboxFieldMutation, selectedBlock, selectedLayer, setLocalState]);

  const onIsCapturingChange = useCallback(
    (isCapturing: boolean) => setLocalState({ isCapturing }),
    [setLocalState],
  );

  const onCameraChange = useCallback(
    (value: Partial<Camera>) => camera && setLocalState({ camera: { ...camera, ...value } }),
    [setLocalState, camera],
  );

  const [addPropertyItemMutation] = useAddPropertyItemMutation();
  const addPropertyItem = useCallback(
    async (
      propertyId: string,
      schemaItemId: string,
      value?: ValueTypes[ValueType],
      valueType?: ValueType,
    ) => {
      await addPropertyItemMutation({
        variables: {
          propertyId,
          schemaItemId,
          nameFieldValue: toGQLSimpleValue(value),
          nameFieldType: valueType ? valueTypeToGQL(valueType) : undefined,
        },
      });
    },
    [addPropertyItemMutation],
  );

  const [movePropertyItemMutation] = useMovePropertyItemMutation();
  const movePropertyItem = useCallback(
    async (propertyId: string, schemaItemId: string, itemId: string, _from: number, to: number) => {
      await movePropertyItemMutation({
        variables: {
          propertyId,
          schemaItemId,
          itemId,
          index: to,
        },
      });
    },
    [movePropertyItemMutation],
  );

  const [removePropertyItemMutation] = useRemovePropertyItemMutation();
  const removePropertyItem = useCallback(
    async (propertyId: string, schemaItemId: string, itemId: string) => {
      await removePropertyItemMutation({
        variables: {
          propertyId,
          schemaItemId,
          itemId,
        },
      });
    },
    [removePropertyItemMutation],
  );

  const [addWidgetMutation] = useAddWidgetMutation();
  const [updateWidgetMutation] = useUpdateWidgetMutation();

  const onWidgetActivate = useCallback(
    async (enabled: boolean) => {
      if (!sceneId || !selectedWidgetId) return;
      if (!enabled) {
        await updateWidgetMutation({
          variables: {
            sceneId,
            pluginId: selectedWidgetId.pluginId,
            extensionId: selectedWidgetId.extensionId,
            enabled: false,
          },
          refetchQueries: ["GetEarthWidgets"],
        });
      } else if (
        scene?.widgets.some(
          w =>
            w.pluginId === selectedWidgetId.pluginId &&
            w.extensionId === selectedWidgetId.extensionId,
        )
      ) {
        await updateWidgetMutation({
          variables: {
            sceneId,
            pluginId: selectedWidgetId.pluginId,
            extensionId: selectedWidgetId.extensionId,
            enabled: true,
          },
          refetchQueries: ["GetEarthWidgets"],
        });
      } else {
        await addWidgetMutation({
          variables: {
            sceneId,
            pluginId: selectedWidgetId.pluginId,
            extensionId: selectedWidgetId.extensionId,
          },
          refetchQueries: ["GetEarthWidgets"],
        });
      }
    },
    [addWidgetMutation, scene?.widgets, sceneId, selectedWidgetId, updateWidgetMutation],
  );

  const [updatePropertyItemsMutation] = useUpdatePropertyItemsMutation();
  const updatePropertyItems = useCallback(
    async (
      propertyId: string,
      schemaItemId: string,
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
          schemaItemId,
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
        },
      });
    },
    [updatePropertyItemsMutation],
  );

  return {
    pane,
    error,
    loading,
    isLayerGroup,
    linkedDatasetSchemaId,
    linkedDatasetId,
    changeValue,
    removeField,
    link,
    uploadFile,
    createAssets,
    removeFile,
    createInfobox,
    removeInfobox,
    removeInfoboxField,
    isInfoboxCreatable,
    isCapturing,
    onIsCapturingChange,
    camera,
    onCameraChange,
    addPropertyItem,
    movePropertyItem,
    removePropertyItem,
    onWidgetActivate,
    selectedWidget,
    updatePropertyItems,
    datasetSchemas,
    layers,
    assets,
  };
};
