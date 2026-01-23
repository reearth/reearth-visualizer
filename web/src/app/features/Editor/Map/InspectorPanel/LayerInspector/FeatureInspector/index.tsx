import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

import { SelectedFeature } from "@reearth/app/features/Editor/hooks/useLayers";
import { GeoJsonFeatureUpdateProps } from "@reearth/app/features/Editor/hooks/useSketch";
import { Button, Collapse, Typography } from "@reearth/app/lib/reearth-ui";
import {
  generateNewPropertiesWithPhotoOverlay,
  getPhotoOverlayValue
} from "@reearth/app/utils/sketch";
import { NLSLayer, SketchFeature } from "@reearth/services/api/layer/types";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import JsonView from "react18-json-view";

import { FieldComponent } from "./CustomPropertField";
import PhotoOverlayCollapse from "./PhotoOverlayCollapse";

type Props = {
  selectedFeature?: SelectedFeature;
  layer?: NLSLayer;
  sketchFeature?: SketchFeature;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
};

export type ValueProp = string | number | boolean | undefined;
export type FieldProp = {
  id: string;
  type: string;
  title: string;
  value?: ValueProp;
};

const FeatureData: FC<Props> = ({
  selectedFeature,
  layer,
  sketchFeature,
  onGeoJsonFeatureUpdate
}) => {
  const t = useT();
  const theme = useTheme();
  const [fields, setFields] = useState<FieldProp[]>([]);
  const [initialFields, setInitialFields] = useState<FieldProp[]>([]);
  const [editMode, setEditMode] = useState(false);

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

  return (
    <Wrapper>
      {!!layer?.isSketch && (
        <Collapse
          title={t("Custom Properties")}
          size="small"
          background={theme.relative.dim}
          headerBg={theme.relative.dim}
          collapsed={collapsedStates.customProperties}
          onCollapse={(state) => handleCollapse("customProperties", state)}
        >
          <FieldsWrapper>
            {fields.map((f) => (
              <FieldComponent
                field={f}
                key={f.id}
                setFields={setFields}
                editMode={editMode}
              />
            ))}
            <SketchFeatureButtons>
              {fields.length > 0 &&
                (editMode ? (
                  <>
                    <Button
                      onClick={handleCancelEditCustomProperties}
                      size="small"
                      icon="close"
                      extendWidth
                    />
                    <Button
                      extendWidth
                      icon="check"
                      size="small"
                      appearance="primary"
                      onClick={handleSubmit}
                    />
                  </>
                ) : (
                  <Button
                    onClick={handleEditCustomProperties}
                    size="small"
                    icon="pencilSimple"
                    title={t("Edit")}
                    extendWidth
                  />
                ))}
            </SketchFeatureButtons>
          </FieldsWrapper>
          {fields.length === 0 && (
            <Typography size="body" color={theme.content.weak}>
              {t("No custom properties")}
            </Typography>
          )}
        </Collapse>
      )}
      {!!layer?.isSketch && selectedFeature && sketchFeature && (
        <PhotoOverlayCollapse
          layerId={layer.id}
          dataFeatureId={sketchFeature.id}
          feature={selectedFeature}
          value={selectedFeature?.properties?.["_reearth"]?.["photoOverlay"]}
          collapsedStates={collapsedStates}
          onCollapse={handleCollapse}
          onDelete={handleDeletePhotoOverlay}
        />
      )}
      <Collapse
        title={t("Geometry")}
        size="small"
        background={theme.relative.dim}
        headerBg={theme.relative.dim}
        collapsed={collapsedStates.geometry}
        onCollapse={(state) => handleCollapse("geometry", state)}
      >
        <ValueWrapper>
          <JsonView
            src={selectedFeature?.geometry}
            theme="vscode"
            dark
            style={jsonStyle}
          />
        </ValueWrapper>
      </Collapse>
      <Collapse
        title={t("Properties")}
        size="small"
        background={theme.relative.dim}
        headerBg={theme.relative.dim}
        collapsed={collapsedStates.properties}
        onCollapse={(state) => handleCollapse("properties", state)}
      >
        <ValueWrapper>
          <JsonView
            src={selectedFeature?.properties}
            theme="vscode"
            dark
            style={jsonStyle}
          />
        </ValueWrapper>
      </Collapse>
    </Wrapper>
  );
};

export default FeatureData;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  padding: `${theme.spacing.small}px 0`,
  wordBreak: "break-all"
}));

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  userSelect: "none"
}));

const ValueWrapper = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`
}));

const SketchFeatureButtons = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: theme.spacing.small
}));
