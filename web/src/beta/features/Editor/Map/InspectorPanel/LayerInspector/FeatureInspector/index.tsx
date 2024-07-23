import { useCallback, useEffect, useMemo, useState } from "react";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";
import JsonView from "react18-json-view";
import { v4 as uuidv4 } from "uuid";

import { GeoJsonFeatureUpdateProps } from "@reearth/beta/features/Editor/hooks/useSketch";
import { Collapse } from "@reearth/beta/lib/reearth-ui";
import { Geometry } from "@reearth/core";
import { SketchFeature } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { FieldComponent } from "./CustomPropertField";

type Props = {
  selectedFeature?: {
    id: string;
    geometry: Geometry | undefined;
    properties: any;
  };
  isSketchLayer?: boolean;
  customProperties?: any;
  layerId?: string;
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
const FeatureData: React.FC<Props> = ({
  selectedFeature,
  isSketchLayer,
  customProperties,
  layerId,
  sketchFeature,
  onGeoJsonFeatureUpdate,
}) => {
  const t = useT();
  const theme = useTheme();
  const [field, setField] = useState<FieldProp[]>([]);

  useEffect(() => {
    if (!customProperties) return;
    const entries = Object.entries<string>(customProperties);
    const sortedValues = entries
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => {
        const aIndex = parseInt(a.value.split("_")[1]);
        const bIndex = parseInt(b.value.split("_")[1]);
        return aIndex - bIndex;
      });

    const fieldArray = sortedValues.map(({ key, value }) => ({
      id: uuidv4(),
      type: value.replace(/_\d+$/, ""),
      title: key,
      value: undefined,
    }));

    setField(fieldArray);
  }, [customProperties, selectedFeature?.properties]);

  const handleSubmit = useCallback(
    (p: any) => {
      if (!selectedFeature) return;
      onGeoJsonFeatureUpdate?.({
        layerId: layerId ?? "",
        featureId: sketchFeature?.id ?? "",
        geometry: selectedFeature.geometry,
        properties: p,
      });
    },
    [layerId, onGeoJsonFeatureUpdate, selectedFeature, sketchFeature?.id],
  );

  const jsonStyle = useMemo(
    () => ({
      wordWrap: "break-word" as const,
      minWidth: 0,
      lineHeight: "1.5em",
      fontSize: theme.fonts.sizes.body,
    }),
    [theme.fonts.sizes.body],
  );

  return (
    <Wrapper>
      {isSketchLayer && (
        <Collapse
          title={t("Custom Properties")}
          size="small"
          background={theme.bg[2]}
          headerBg={theme.bg[2]}>
          {field.map(f => (
            <FieldComponent
              field={f}
              key={f.id}
              selectedFeature={sketchFeature}
              setField={setField}
              onSubmit={handleSubmit}
            />
          ))}
        </Collapse>
      )}
      <Collapse title={t("Geometry")} size="small" background={theme.bg[2]} headerBg={theme.bg[2]}>
        <ValueWrapper>
          <JsonView src={selectedFeature?.geometry} theme="vscode" dark style={jsonStyle} />
        </ValueWrapper>
      </Collapse>
      <Collapse
        title={t("Properties")}
        size="small"
        background={theme.bg[2]}
        headerBg={theme.bg[2]}>
        <ValueWrapper>
          <JsonView src={selectedFeature?.properties} theme="vscode" dark style={jsonStyle} />
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
  wordBreak: "break-all",
}));

const ValueWrapper = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
}));
