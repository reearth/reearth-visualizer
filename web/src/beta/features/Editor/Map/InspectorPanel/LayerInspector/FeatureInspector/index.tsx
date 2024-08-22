import { FC, useCallback, useEffect, useMemo, useState } from "react";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";
import JsonView from "react18-json-view";

import {
  GeoJsonFeatureDeleteProps,
  GeoJsonFeatureUpdateProps,
} from "@reearth/beta/features/Editor/hooks/useSketch";
import { Button, Collapse, Typography } from "@reearth/beta/lib/reearth-ui";
import { Geometry } from "@reearth/core";
import { NLSLayer, SketchFeature } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { FieldComponent } from "./CustomPropertField";

type Props = {
  selectedFeature?: {
    id: string;
    geometry: Geometry | undefined;
    properties: any;
  };
  layer?: NLSLayer;
  sketchFeature?: SketchFeature;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
  onGeoJsonFeatureDelete?: (inp: GeoJsonFeatureDeleteProps) => void;
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
  onGeoJsonFeatureUpdate,
  onGeoJsonFeatureDelete,
}) => {
  const t = useT();
  const theme = useTheme();
  const [fields, setFields] = useState<FieldProp[]>([]);

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
      value: selectedFeature?.properties?.[key],
    }));

    setFields(fieldArray);
  }, [layer?.sketch?.customPropertySchema, selectedFeature?.properties]);

  const handleSubmit = useCallback(() => {
    if (!selectedFeature || !sketchFeature?.id || !layer?.id) return;
    const newProperties = { ...selectedFeature.properties };
    Object.assign(newProperties, ...fields.map(f => ({ [f.title]: f.value })));
    onGeoJsonFeatureUpdate?.({
      layerId: layer.id,
      featureId: sketchFeature.id,
      geometry: selectedFeature.geometry,
      properties: newProperties,
    });
  }, [layer?.id, fields, onGeoJsonFeatureUpdate, selectedFeature, sketchFeature?.id]);

  const jsonStyle = useMemo(
    () => ({
      wordWrap: "break-word" as const,
      minWidth: 0,
      lineHeight: "1.5em",
      fontSize: theme.fonts.sizes.body,
    }),
    [theme.fonts.sizes.body],
  );

  const handleDeleteSketchFeature = useCallback(() => {
    if (!layer?.id || !sketchFeature?.id) return;
    onGeoJsonFeatureDelete?.({
      layerId: layer.id,
      featureId: sketchFeature.id,
    });
  }, [layer?.id, sketchFeature?.id, onGeoJsonFeatureDelete]);

  return (
    <Wrapper>
      {!!layer?.isSketch && (
        <Collapse
          title={t("Custom Properties")}
          size="small"
          background={theme.relative.dim}
          headerBg={theme.relative.dim}>
          <FieldsWrapper>
            {fields.map(f => (
              <FieldComponent field={f} key={f.id} setFields={setFields} />
            ))}
            {fields.length > 0 && (
              <Button
                extendWidth
                icon="return"
                title={t("Save & Apply")}
                size="small"
                onClick={handleSubmit}
              />
            )}
          </FieldsWrapper>
          {fields.length === 0 && (
            <Typography size="body" color={theme.content.weak}>
              {t("No custom properties")}
            </Typography>
          )}
        </Collapse>
      )}
      <Collapse
        title={t("Geometry")}
        size="small"
        background={theme.relative.dim}
        headerBg={theme.relative.dim}>
        <ValueWrapper>
          <JsonView src={selectedFeature?.geometry} theme="vscode" dark style={jsonStyle} />
        </ValueWrapper>
      </Collapse>
      <Collapse
        title={t("Properties")}
        size="small"
        background={theme.relative.dim}
        headerBg={theme.relative.dim}>
        <ValueWrapper>
          <JsonView src={selectedFeature?.properties} theme="vscode" dark style={jsonStyle} />
        </ValueWrapper>
      </Collapse>
      {!!layer?.isSketch && sketchFeature?.id && (
        <Button
          title={t("Delete Feature")}
          onClick={handleDeleteSketchFeature}
          size="small"
          icon="trash"
          extendWidth
        />
      )}
    </Wrapper>
  );
};

export default FeatureData;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  padding: `${theme.spacing.small}px 0`,
  wordBreak: "break-all",
}));

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  userSelect: "none",
}));

const ValueWrapper = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
}));
