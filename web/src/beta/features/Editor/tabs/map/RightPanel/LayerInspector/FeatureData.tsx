import { useCallback, useEffect, useState } from "react";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";
import JsonView from "react18-json-view";
import { v4 as uuidv4 } from "uuid";

import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import Text from "@reearth/beta/components/Text";
import { GeoJsonFeatureUpdateProps } from "@reearth/beta/features/Editor/useSketch";
import { Geometry, Feature } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

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
  sketchFeature?: Feature;
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

  return (
    <Wrapper>
      <Text size="body">{t("ID")}</Text>
      <ValueWrapper>
        <Text size="body" otherProperties={{ userSelect: "auto" }}>
          {selectedFeature?.id}
        </Text>
      </ValueWrapper>
      <StyledSidePanelSectionField title={t("Geometry")} border="1">
        <ValueWrapper>
          <JsonView
            src={selectedFeature?.geometry}
            theme="a11y"
            dark
            style={{ wordWrap: "break-word", minWidth: 0, lineHeight: "1.5em" }}
          />
        </ValueWrapper>
      </StyledSidePanelSectionField>
      <StyledSidePanelSectionField title={t("Properties")} border="1">
        <ValueWrapper>
          <JsonView src={selectedFeature?.properties} theme="a11y" dark />
        </ValueWrapper>
      </StyledSidePanelSectionField>
      {isSketchLayer && (
        <StyledSidePanelSectionField title={t("Custom Properties")} border="1">
          {field.map(f => (
            <FieldComponent
              field={f}
              key={f.id}
              selectedFeature={sketchFeature}
              setField={setField}
              onSubmit={handleSubmit}
            />
          ))}
        </StyledSidePanelSectionField>
      )}
    </Wrapper>
  );
};

export default FeatureData;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  word-break: break-all;
`;

const ValueWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: 4px 8px;
`;

const StyledSidePanelSectionField = styled(SidePanelSectionField)`
  background: ${({ theme }) => theme.outline.weaker};
`;
