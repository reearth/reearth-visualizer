import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import {
  ChangeCustomPropertyTitleInput,
  RemoveCustomPropertyInput,
  UpdateCustomPropertySchemaInput
} from "@reearth/services/gql";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { CustomPropertyProps } from "../SketchLayerCreator/type";

import { SketchLayerEditorProp } from ".";

export default function useHooks({
  layers,
  layerId,
  customProperties,
  setPropertiesList,
  onClose,
  onCustomPropertySchemaUpdate,
  onChangeCustomPropertyTitle,
  onRemoveCustomProperty
}: Pick<CustomPropertyProps, "customProperties" | "setPropertiesList"> &
  SketchLayerEditorProp) {
  const sketchLayers = useMemo(
    () => layers.filter(({ isSketch }) => isSketch),
    [layers]
  );

  const [previousTitle, setPreviousTitle] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);
  
  const handleClose = useCallback(() => {
    if (onClose) setPropertiesList?.([]);
    onClose?.();
  }, [onClose, setPropertiesList]);

  const schemaJSON = useMemo(() => {
    return customProperties?.reduce((acc, property, index) => {
      const [key] = Object.keys(property);
      // Appending index + 1 to the value for sorting later
      const value = `${property[key]}_${index + 1}`;
      acc[key] = value;
      return acc;
    }, {});
  }, [customProperties]);

  const handleApply = useCallback(() => {
    setConfirmationModal(!confirmationModal);
  }, [confirmationModal]);

    const handleRemoveCustomProperty = useCallback(() => {
      const inp: RemoveCustomPropertyInput = {
        layerId: layerId || "",
        schema: schemaJSON,
        removedTitle: previousTitle
      };
      onRemoveCustomProperty?.(inp);
    }, [layerId, onRemoveCustomProperty, previousTitle, schemaJSON]);

  const handleSubmit = useCallback(() => {
    const inp: UpdateCustomPropertySchemaInput = {
      layerId: layerId || "",
      schema: schemaJSON
    };

    const titleInput: ChangeCustomPropertyTitleInput = {
      layerId: layerId || "",
      oldTitle: previousTitle,
      newTitle,
      schema: schemaJSON
    };

    if (previousTitle !== newTitle) {
      onChangeCustomPropertyTitle?.(titleInput);
    }
    if (previousTitle === newTitle) {
      onCustomPropertySchemaUpdate?.(inp);
    }
    handleApply()
  }, [layerId, schemaJSON, previousTitle, newTitle, handleApply, onChangeCustomPropertyTitle, onCustomPropertySchemaUpdate]);

  const processCustomProperties = (layer: NLSLayer) => {
    const { customPropertySchema } = layer.sketch || {};
    if (!customPropertySchema) return [];

    const sortedEntries = Object.entries(customPropertySchema)
      .map(([key, value]) => ({
        key,
        value: (value as string).replace(/_\d+$/, ""),
        number: parseInt((value as string).match(/_(\d+)$/)?.[1] || "0", 10)
      }))
      .sort((a, b) => a.number - b.number);

    return sortedEntries.map(({ key, value }) => ({
      id: uuidv4(),
      key,
      value
    }));
  };

  useEffect(() => {
    if (setPropertiesList) {
      const layer = sketchLayers.find((layer) => layer.id === layerId);
      if (layer) {
        const newPropertiesList = processCustomProperties(layer);
        setPropertiesList(newPropertiesList);
      }
    }
  }, [setPropertiesList, sketchLayers, layerId]);



  return {
    confirmationModal,
    setPreviousTitle,
    setNewTitle,
    handleApply,
    handleSubmit,
    handleClose,
    handleRemoveCustomProperty
  };
}
