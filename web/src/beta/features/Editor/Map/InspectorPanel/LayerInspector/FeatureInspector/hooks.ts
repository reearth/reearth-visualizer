import {
  generateNewPropertiesWithPhotoOverlay,
  getPhotoOverlayValue
} from "@reearth/beta/utils/sketch";
import { useTheme } from "@reearth/services/theme";
import { useState, useEffect, useMemo, useCallback } from "react";

import { FeatureDataProps, FieldProp } from ".";

export default ({
  layer,
  sketchFeature,
  selectedFeature,
  onGeoJsonFeatureUpdate
}: FeatureDataProps) => {
  const theme = useTheme();

  const [fields, setFields] = useState<FieldProp[]>([]);
  const [initialFields, setInitialFields] = useState<FieldProp[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editGeometry, setEditGeometry] = useState(false);
  const [geometryValue, setGeometryValue] = useState<string | undefined>("");

  useEffect(() => {
    setGeometryValue(JSON.stringify(selectedFeature?.geometry, null, 2));
  }, [selectedFeature?.geometry]);

  // Initialize collapsed state from localStorage
  const initialCollapsedStates = useMemo(() => {
    const storedStates: Record<string, boolean> = {};
    ["customProperties", "photoOverlay", "geometry", "properties"].forEach(
      (id) => {
        storedStates[id] =
          localStorage.getItem(`reearth-visualizer-feature-${id}-collapsed`) ===
          "true";
      }
    );
    return storedStates;
  }, []);

  const [collapsedStates, setCollapsedStates] = useState<
    Record<string, boolean>
  >(initialCollapsedStates);

  const saveCollapseState = useCallback((storageId: string, state: boolean) => {
    localStorage.setItem(
      `reearth-visualizer-feature-${storageId}-collapsed`,
      JSON.stringify(state)
    );
  }, []);

  const handleCollapse = useCallback(
    (storageId: string, state: boolean) => {
      saveCollapseState(storageId, state);
      setCollapsedStates((prevState) => ({
        ...prevState,
        [storageId]: state
      }));
    },
    [saveCollapseState]
  );

  useEffect(() => {
    if (!layer?.sketch?.customPropertySchema) return;
    const entries = Object.entries<string>(layer.sketch.customPropertySchema);
    const sortedValues = entries
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => {
        // Note: value is a combine of type and index
        // in format of fieldType_index
        // eg. Text_0, Text_1, Number_2, Number_3
        const aIndex = parseInt(a.value.split("_")[1]);
        const bIndex = parseInt(b.value.split("_")[1]);
        return aIndex - bIndex;
      });
    const fieldArray = sortedValues.map(({ key, value }) => ({
      id: key,
      type: value.replace(/_\d+$/, ""),
      title: key,
      value: selectedFeature?.properties?.[key]
    }));

    setFields(fieldArray);
    setInitialFields(fieldArray);
  }, [layer?.sketch?.customPropertySchema, selectedFeature?.properties]);

  const handleSubmit = useCallback(() => {
    if (!selectedFeature || !sketchFeature?.id || !layer?.id) return;
    const newProperties = { ...selectedFeature.properties };
    Object.assign(
      newProperties,
      ...fields.map((f) => ({ [f.title]: f.value }))
    );

    onGeoJsonFeatureUpdate?.({
      layerId: layer.id,
      featureId: sketchFeature.id,
      geometry: selectedFeature.geometry,
      properties: newProperties
    });
    setEditMode(false);
  }, [
    layer?.id,
    fields,
    onGeoJsonFeatureUpdate,
    selectedFeature,
    sketchFeature?.id
  ]);

  const handleUpdateGeometry = useCallback(() => {
    if (!selectedFeature || !sketchFeature?.id || !layer?.id || !geometryValue)
      return;

    try {
      const updatedGeometry = JSON.parse(geometryValue);

      onGeoJsonFeatureUpdate?.({
        layerId: layer.id,
        featureId: sketchFeature.id,
        geometry: updatedGeometry,
        properties: selectedFeature.properties
      });
      setEditGeometry(false);
    } catch (error) {
      console.error("Invalid geometry JSON:", error);
    }
  }, [
    layer?.id,
    onGeoJsonFeatureUpdate,
    selectedFeature,
    sketchFeature?.id,
    geometryValue
  ]);

  const jsonStyle = useMemo(
    () => ({
      wordWrap: "break-word" as const,
      minWidth: 0,
      lineHeight: "1.5em",
      fontSize: theme.fonts.sizes.body
    }),
    [theme.fonts.sizes.body]
  );

  const handleDeletePhotoOverlay = useCallback(() => {
    if (
      !selectedFeature ||
      !getPhotoOverlayValue(selectedFeature?.properties) ||
      !sketchFeature?.id ||
      !layer?.id
    )
      return;

    const newProperties = generateNewPropertiesWithPhotoOverlay(
      selectedFeature?.properties,
      undefined
    );
    onGeoJsonFeatureUpdate?.({
      layerId: layer?.id,
      featureId: sketchFeature?.id,
      geometry: selectedFeature.geometry,
      properties: newProperties
    });
  }, [selectedFeature, sketchFeature?.id, layer?.id, onGeoJsonFeatureUpdate]);

  const handleEditCustomProperties = useCallback(() => {
    setEditMode(true);
  }, []);

  const handleCancelEditCustomProperties = useCallback(() => {
    setEditMode(false);
    setFields(initialFields);
  }, [initialFields]);

  const handleCancelEditGeometry = useCallback(() => {
    setEditGeometry(false);
    setGeometryValue(JSON.stringify(selectedFeature?.geometry, null, 2));
  }, [selectedFeature?.geometry]);
    
  return {
    fields,
    editMode,
    collapsedStates,
    jsonStyle,
    geometryValue,
    editGeometry,
    setEditGeometry,
    setFields,
    setGeometryValue,
    handleCollapse,
    handleSubmit,
    handleDeletePhotoOverlay,
    handleEditCustomProperties,
    handleCancelEditCustomProperties,
    handleUpdateGeometry,
    handleCancelEditGeometry
  };
};
