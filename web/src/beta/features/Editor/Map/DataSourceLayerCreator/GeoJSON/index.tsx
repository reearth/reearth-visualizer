import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import {
  RadioGroup,
  Switcher,
  Button,
  TextInput,
  TextArea
} from "@reearth/beta/lib/reearth-ui";
import { AssetField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
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
    <Wrapper>
      <ContentWrapper>
        <InputGroup label={t("Source Type")}>
          <RadioGroup
            value={sourceType}
            options={dataSourceTypeOptions}
            onChange={handleDataSourceTypeChange}
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
          />
        </InputGroup>
      </ContentWrapper>
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!value}
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default GeoJSON;
