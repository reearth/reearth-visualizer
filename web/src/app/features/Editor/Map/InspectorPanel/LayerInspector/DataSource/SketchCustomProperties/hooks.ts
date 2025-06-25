import { IconName } from "@reearth/app/lib/reearth-ui";
import { UpdateCustomPropertySchemaInput } from "@reearth/services/gql";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useMapPage } from "../../../../context";
import { CustomPropertyProp } from "../../../../SketchLayerCreator/type";

export const getIcon = (value: string): IconName => {
  const cleanedValue = value.replace(/_\d+$/, ""); // Remove _Number suffix
  const iconMap: Record<string, IconName> = {
    TextArea: "textarea",
    Text: "textT",
    URL: "linkSimpleHorizontal",
    Asset: "file",
    Float: "float",
    Int: "numberNine",
    Boolean: "toggleLeft"
  };

  return iconMap[cleanedValue] || "file";
};

export default function useHooks(
  layerId?: string,
  customPropertySchema?: CustomPropertyProp
) {
  const {
    handleCustomPropertySchemaUpdate,
    handleRemoveCustomProperty,
    handleChangeCustomPropertyTitle
  } = useMapPage();

  const [selectedField, setSelectedField] = useState<{
    key: string;
    value: string;
  } | null>(null);

  const [isEditField, setIsEditField] = useState(false);
  const isEmpty =
    !customPropertySchema || Object.keys(customPropertySchema).length === 0;
  const [schemaJSON, setSchemaJSON] = useState<Record<string, string>>(
    customPropertySchema || {}
  );

  useEffect(() => {
    if (customPropertySchema) {
      setSchemaJSON(customPropertySchema);
    }
  }, [customPropertySchema]);

  const sortedValues = useMemo(() => {
    if (!customPropertySchema) return;
    return Object.entries(customPropertySchema)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => {
        const aIndex = parseInt(a.value.split("_")[1]) || 0;
        const bIndex = parseInt(b.value.split("_")[1]) || 0;
        return aIndex - bIndex;
      });
  }, [customPropertySchema]);

  const [customPropertySchemaShown, setCustomPropertySchemaShown] =
    useState(false);

  const openCustomPropertySchema = useCallback(() => {
    setCustomPropertySchemaShown(true);
  }, []);

  const handleCustomPropertySchemaState = useCallback(() => {
    setCustomPropertySchemaShown(false);
    setIsEditField(false);
  }, []);

  const closeCustomPropertySchema = useCallback(() => {
    if (!customPropertySchema) return;
    setSelectedField(null);
    handleCustomPropertySchemaState();
    setSchemaJSON(customPropertySchema);
  }, [customPropertySchema, handleCustomPropertySchemaState]);

  const [showDeleteFieldConfirmModal, setShowDeleteFieldConfirmModal] =
    useState(false);

  const openDeleteFieldConfirmModal = useCallback(() => {
    setShowDeleteFieldConfirmModal(true);
  }, []);

  const closeDeleteFieldConfirmModal = useCallback(() => {
    setShowDeleteFieldConfirmModal(false);
    setSelectedField(null);
  }, []);

  const handleEditField = useCallback(
    (key?: string, value?: string) => {
      setSelectedField(
        key && value ? { key, value: value.replace(/_\d+$/, "") } : null
      );
      openCustomPropertySchema();
      setIsEditField(true);
    },
    [openCustomPropertySchema]
  );

  const handleDeleteField = useCallback(
    (key?: string) => {
      if (!key) return;
      const value = customPropertySchema?.[key] || ""; // Get value from schema
      setSelectedField({ key, value: value.replace(/_\d+$/, "") });
      Promise.resolve().then(openDeleteFieldConfirmModal);
    },
    [customPropertySchema, openDeleteFieldConfirmModal]
  );

  const handleAppyDelete = useCallback(() => {
    if (!customPropertySchema || !layerId) return;

    const updatedSchema = Object.fromEntries(
      Object.entries(customPropertySchema).filter(
        ([schemaKey]) => schemaKey !== selectedField?.key
      )
    );
    handleRemoveCustomProperty({
      layerId: layerId,
      removedTitle: selectedField?.key || "",
      schema: updatedSchema
    });
    closeDeleteFieldConfirmModal();
  }, [
    closeDeleteFieldConfirmModal,
    customPropertySchema,
    handleRemoveCustomProperty,
    layerId,
    selectedField?.key
  ]);

  const handleUpdateCustomPropertySchema = useCallback(
    (schema: CustomPropertyProp) => {
      const inp: UpdateCustomPropertySchemaInput = {
        layerId: layerId || "",
        schema
      };

      handleCustomPropertySchemaUpdate?.(inp);
    },
    [layerId, handleCustomPropertySchemaUpdate]
  );

  const handleUpdateCustomPropertyTitle = useCallback(
    (updatedSchema: CustomPropertyProp, newTitle: string) => {
      if (!customPropertySchema || !selectedField?.key || !newTitle) return;

      handleChangeCustomPropertyTitle({
        layerId: layerId || "",
        oldTitle: selectedField.key,
        newTitle,
        schema: updatedSchema
      });
    },
    [
      customPropertySchema,
      handleChangeCustomPropertyTitle,
      layerId,
      selectedField?.key
    ]
  );

  const handleSubmit = useCallback(
    (updatedSchema: CustomPropertyProp, newTitle?: string) => {
      if (newTitle) {
        handleUpdateCustomPropertyTitle(updatedSchema, newTitle);
      }
      if (!newTitle) handleUpdateCustomPropertySchema(updatedSchema);
    },
    [handleUpdateCustomPropertySchema, handleUpdateCustomPropertyTitle]
  );

  return {
    sortedValues,
    selectedField,
    isEmpty,
    isEditField,
    schemaJSON,
    customPropertySchemaShown,
    openCustomPropertySchema,
    closeCustomPropertySchema,
    showDeleteFieldConfirmModal,
    openDeleteFieldConfirmModal,
    closeDeleteFieldConfirmModal,
    handleUpdateCustomPropertySchema,
    handleAppyDelete,
    handleDeleteField,
    handleEditField,
    handleSubmit,
    setSchemaJSON
  };
}
