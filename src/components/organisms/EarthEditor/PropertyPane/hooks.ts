import { useCallback } from "react";
import { useIntl } from "react-intl";

import { ValueTypes, ValueType } from "@reearth/components/molecules/EarthEditor/PropertyPane";
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
  useUpdatePropertyItemsMutation,
  ListOperation,
  useCreateAssetMutation,
} from "@reearth/gql";
import {
  useSelected,
  useRootLayerId,
  useIsCapturing,
  useCamera,
  useTeam,
  useSceneId,
  useSelectedBlock,
  useWidgetAlignEditorActivated,
} from "@reearth/state";
import { valueTypeToGQL, Camera, toGQLSimpleValue, valueToGQL } from "@reearth/util/value";

import useQueries, { Mode as RawMode } from "./hooks-queries";

export type Mode = RawMode;

export type FieldPointer = {
  itemId?: string;
  fieldId: string;
};

export default (mode: Mode) => {
  const intl = useIntl();
  const [selected] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [rootLayerId] = useRootLayerId();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [camera, setCamera] = useCamera();
  const [team] = useTeam();
  const [sceneId] = useSceneId();
  const [widgetAlignEditorActivated, setWidgetAlignEditorActivated] =
    useWidgetAlignEditorActivated();

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
    assets,
    selectedWidget,
  } = useQueries({
    mode,
    sceneId,
    rootLayerId,
    selectedBlock,
    selected,
    teamId: team?.id,
    locale: intl.locale,
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
          lang: intl.locale,
        },
      });
    },
    [changeValueMutation, intl.locale],
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
          lang: intl.locale,
        },
      });
    },
    [intl.locale, linkDataset],
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
      uploadFileMutation({
        variables: { propertyId, itemId, schemaItemId, fieldId, file, lang: intl.locale },
      });
    },
    [intl.locale, uploadFileMutation],
  );

  const [createAssetMutation] = useCreateAssetMutation();
  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (team?.id) {
          await Promise.all(
            Array.from(files).map(file =>
              createAssetMutation({
                variables: { teamId: team.id, file },
                refetchQueries: ["Assets"],
              }),
            ),
          );
        }
      })(),
    [createAssetMutation, team?.id],
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
          lang: intl.locale,
        },
      });
    },
    [changeValueMutation, intl.locale],
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
          lang: intl.locale,
        },
      });
    },
    [intl.locale, removeFieldMutation],
  );

  const [createInfoboxMutation] = useCreateInfoboxMutation();
  const createInfobox = useCallback(() => {
    if (selected?.type !== "layer") return;
    return createInfoboxMutation({
      variables: { layerId: selected.layerId, lang: intl.locale },
    });
  }, [createInfoboxMutation, selected, intl.locale]);

  const [removeInfoboxMutation] = useRemoveInfoboxMutation();
  const removeInfobox = useCallback(() => {
    if (selected?.type !== "layer") return;
    return removeInfoboxMutation({
      variables: { layerId: selected.layerId, lang: intl.locale },
    });
  }, [removeInfoboxMutation, selected, intl.locale]);

  const [removeInfoboxFieldMutation] = useRemoveInfoboxFieldMutation();
  const removeInfoboxField = useCallback(() => {
    if (!selectedBlock || selected?.type !== "layer") return;
    selectBlock(undefined);
    return removeInfoboxFieldMutation({
      variables: { layerId: selected.layerId, infoboxFieldId: selectedBlock, lang: intl.locale },
    });
  }, [selectedBlock, selected, selectBlock, removeInfoboxFieldMutation, intl.locale]);

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
          lang: intl.locale,
        },
      });
    },
    [addPropertyItemMutation, intl.locale],
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
          lang: intl.locale,
        },
      });
    },
    [intl.locale, movePropertyItemMutation],
  );

  const [removePropertyItemMutation] = useRemovePropertyItemMutation();
  const removePropertyItem = useCallback(
    async (propertyId: string, schemaItemId: string, itemId: string) => {
      await removePropertyItemMutation({
        variables: {
          propertyId,
          schemaItemId,
          itemId,
          lang: intl.locale,
        },
      });
    },
    [intl.locale, removePropertyItemMutation],
  );

  const onWidgetEditorActivate = useCallback(
    (enabled: boolean) => {
      setWidgetAlignEditorActivated(enabled);
    },
    [setWidgetAlignEditorActivated],
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
          lang: intl.locale,
        },
      });
    },
    [intl.locale, updatePropertyItemsMutation],
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
    onWidgetAlignEditorActivate: onWidgetEditorActivate,
    widgetAlignEditorActivated: widgetAlignEditorActivated,
    selectedWidget,
    updatePropertyItems,
    datasetSchemas,
    layers,
    assets,
  };
};
