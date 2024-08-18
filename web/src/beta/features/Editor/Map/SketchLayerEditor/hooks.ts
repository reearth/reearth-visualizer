import { useCallback, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { UpdateCustomPropertySchemaInput } from "@reearth/services/gql";

import { CustomPropertyProps } from "../SketchLayerCreator/type";

import { SketchLayerEditorProp } from ".";

export default function useHooks({
  layers,
  layerId,
  customProperties,
  setPropertiesList,
  onClose,
  onCustomPropertySchemaUpdate,
}: Pick<CustomPropertyProps, "customProperties" | "setPropertiesList"> & SketchLayerEditorProp) {
  const sketchLayers = useMemo(() => layers.filter(({ isSketch }) => isSketch), [layers]);

  const handleClose = useCallback(() => {
    if (onClose) setPropertiesList?.([]);
    onClose?.();
  }, [onClose, setPropertiesList]);

  const handleSubmit = useCallback(() => {
    const schemaJSON = customProperties?.reduce((acc, property, index) => {
      const [key] = Object.keys(property);
      // Appending index + 1 to the value for sorting later
      const value = `${property[key]}_${index + 1}`;
      acc[key] = value;
      return acc;
    }, {});
    const inp: UpdateCustomPropertySchemaInput = {
      layerId: layerId || "",
      schema: schemaJSON,
    };

    onCustomPropertySchemaUpdate?.(inp);
    handleClose();
  }, [customProperties, handleClose, onCustomPropertySchemaUpdate, layerId]);

  const processCustomProperties = (layer: NLSLayer) => {
    const { customPropertySchema } = layer.sketch || {};
    if (!customPropertySchema) return [];

    const sortedEntries = Object.entries(customPropertySchema)
      .map(([key, value]) => ({
        key,
        value: (value as string).replace(/_\d+$/, ""),
        number: parseInt((value as string).match(/_(\d+)$/)?.[1] || "0", 10),
      }))
      .sort((a, b) => a.number - b.number);

    return sortedEntries.map(({ key, value }) => ({
      id: uuidv4(),
      key,
      value,
    }));
  };

  useEffect(() => {
    if (setPropertiesList) {
      const layer = sketchLayers.find(layer => layer.id === layerId);
      if (layer) {
        const newPropertiesList = processCustomProperties(layer);
        setPropertiesList(newPropertiesList);
      }
    }
  }, [setPropertiesList, sketchLayers, layerId]);

  return {
    handleSubmit,
    handleClose,
  };
}
