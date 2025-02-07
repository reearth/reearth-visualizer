import { IconName } from "@reearth/beta/lib/reearth-ui";
import { UpdateCustomPropertySchemaInput } from "@reearth/services/gql";
import { useCallback, useMemo, useState } from "react";

import { useMapPage } from "../../../../context";
import { CustomPropertyProp } from "../../../../SketchLayerCreator/type";

export const getIcon = (value: string): IconName => {
  const cleanedValue = value.replace(/_\d+$/, ""); // Remove _Number suffix
  const iconMap: Record<string, IconName> = {
    TextArea: "textarea",
    Text: "textT",
    URL: "paperclip",
    Asset: "image",
    Float: "file",
    Int: "file",
    Boolean: "file",
    Camera: "camera"
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

  const [newTitle, setNewTitle] = useState<string | undefined>();

  const [isEditField, setIsEditField] = useState(false);
  const isEmpty =
    !customPropertySchema || Object.keys(customPropertySchema).length === 0;
  const [schemaJSON, setSchemaJSON] = useState<Record<string, string>>(
    customPropertySchema || {}
  );
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

  const handleTitleBlur = useCallback((title: string) => {
    const trimmedTitle = title.trim();
    setNewTitle(trimmedTitle);
  }, []);

  const [customPropertySchemaShown, setCustomPropertySchemaShown] =
    useState(false);

  const openCustomPropertySchema = useCallback(
    () => setCustomPropertySchemaShown(true),
    []
  );

  const closeCustomPropertySchema = useCallback(() => {
    setCustomPropertySchemaShown(false);
    setSelectedField(null);
    setIsEditField(false);
  }, []);

  const [showEditFieldConfirmModal, setShowEditFieldConfirmModal] =
    useState(false);

  const openEditFieldConfirmModal = useCallback(() => {
    setShowEditFieldConfirmModal(true);
    setCustomPropertySchemaShown(false);
    setIsEditField(false);
  }, []);

  const closeEditFieldConfirmModal = useCallback(() => {
    setShowEditFieldConfirmModal(false);
    setSelectedField(null);
  }, []);

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
      setTimeout(openDeleteFieldConfirmModal, 0);
    },
    [customPropertySchema, openDeleteFieldConfirmModal]
  );

  const handleAppyDelete = useCallback(() => {
    if (!customPropertySchema) return;

    const updatedSchema = Object.fromEntries(
      Object.entries(customPropertySchema).filter(
        ([schemaKey]) => schemaKey !== selectedField?.key
      )
    );
    handleRemoveCustomProperty({
      layerId: layerId || "",
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

  const handleSubmit = useCallback(() => {
    if (!customPropertySchema || !selectedField?.key || !newTitle) return;

    const { [selectedField.key]: _, ...updatedSchema } = schemaJSON;
    updatedSchema[newTitle] = schemaJSON[selectedField.key];
    setSchemaJSON(updatedSchema);

    handleChangeCustomPropertyTitle({
      layerId: layerId || "",
      oldTitle: selectedField.key,
      newTitle: newTitle,
      schema: updatedSchema
    });

    closeEditFieldConfirmModal();
  }, [
    closeEditFieldConfirmModal,
    customPropertySchema,
    handleChangeCustomPropertyTitle,
    layerId,
    newTitle,
    schemaJSON,
    selectedField?.key
  ]);

  return {
    sortedValues,
    selectedField,
    isEmpty,
    isEditField,
    customPropertySchemaShown,
    openCustomPropertySchema,
    closeCustomPropertySchema,
    showDeleteFieldConfirmModal,
    openDeleteFieldConfirmModal,
    closeDeleteFieldConfirmModal,
    showEditFieldConfirmModal,
    openEditFieldConfirmModal,
    closeEditFieldConfirmModal,
    handleUpdateCustomPropertySchema,
    handleAppyDelete,
    handleDeleteField,
    handleEditField,
    handleSubmit,
    handleTitleBlur,
    setSchemaJSON
  };
}
