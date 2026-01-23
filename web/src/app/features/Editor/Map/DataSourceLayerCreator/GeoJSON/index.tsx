import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper
} from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import {
  RadioGroup,
  Switcher,
  Button,
  TextInput,
  TextArea
} from "@reearth/app/lib/reearth-ui";
import { AssetField } from "@reearth/app/ui/fields";
import { useT } from "@reearth/services/i18n/hooks";
import { FC } from "react";

import { DataProps } from "..";

import useHooks from "./hooks";

const GeoJSON: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const {
    value,
    sourceType,
    dataSourceTypeOptions,
    prioritizePerformance,
    handleValueChange,
    handleDataSourceTypeChange,
    handleSubmit,
    setPrioritizePerformance
  } = useHooks({ sceneId, onSubmit, onClose });

  return (
    <Wrapper data-testid="geojson-layer-creator">
      <ContentWrapper>
        <InputGroup label={t("Source Type")}>
          <RadioGroup
            value={sourceType}
            options={dataSourceTypeOptions}
            onChange={handleDataSourceTypeChange}
            data-testid="geojson-source-type"
          />
        </InputGroup>

        {sourceType === "local" && (
          <InputsWrapper>
            <AssetField
              inputMethod="asset"
              title={t("Asset")}
              value={value}
              assetsTypes={["geojson"]}
              onChange={handleValueChange}
              data-testid="geojson-asset-field"
            />
          </InputsWrapper>
        )}
        {sourceType === "url" && (
          <InputGroup label={t("Resource URL")}>
            <InputsWrapper>
              <TextInput
                placeholder={t("Input Text")}
                value={value}
                onChange={handleValueChange}
                data-testid="geojson-url-input"
              />
            </InputsWrapper>
          </InputGroup>
        )}
        {sourceType === "value" && (
          <InputGroup label={t("Value")}>
            <InputsWrapper>
              <TextArea
                placeholder={t("Input data here")}
                rows={8}
                value={value}
                onChange={handleValueChange}
                data-testid="geojson-value-input"
              />
            </InputsWrapper>
          </InputGroup>
        )}
        <InputGroup
          label={t("Prioritize Performance")}
          description={t(
            "If Prioritize Performance is set to True, the Visualizer will prioritize performance. This layer will not use the Layer Style but instead will apply its own predefined style, which cannot be modified."
          )}
        >
          <Switcher
            value={prioritizePerformance}
            onChange={(v) => setPrioritizePerformance(v)}
            data-testid="geojson-prioritize-switcher"
          />
        </InputGroup>
      </ContentWrapper>
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!value}
          data-testid="geojson-submit-button"
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default GeoJSON;
