import { FC } from "react";

import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper,
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import {
  Selector,
  RadioGroup,
  Switcher,
  Button,
  TextInput,
  TextArea,
} from "@reearth/beta/lib/reearth-ui";
import { AssetField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";

import { DataProps } from "..";

import useHooks from "./hooks";

const CommonAsset: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const {
    value,
    fileFormat,
    assetsTypes,
    sourceType,
    dataSourceTypeOptions,
    fileFormatOptions,
    prioritizePerformance,
    handleValueChange,
    handleDataSourceTypeChange,
    handleFileFormatChange,
    handleSubmit,
    setPrioritizePerformance,
    isValidExtension,
  } = useHooks({ sceneId, onSubmit, onClose });

  return (
    <Wrapper>
      <ContentWrapper>
        <InputGroup
          label={t("File Format")}
          description={t("File format of the data source you want to add.")}>
          <Selector
            value={fileFormat}
            options={fileFormatOptions}
            onChange={handleFileFormatChange}
          />
        </InputGroup>
        <InputGroup label={t("Source Type")}>
          <RadioGroup
            value={sourceType}
            options={dataSourceTypeOptions}
            onChange={handleDataSourceTypeChange}
          />
        </InputGroup>

        {sourceType == "local" && (
          <InputsWrapper>
            <AssetField
              inputMethod="asset"
              commonTitle={t("Asset")}
              value={value}
              assetsTypes={assetsTypes}
              onChange={handleValueChange}
            />
          </InputsWrapper>
        )}
        {sourceType == "url" && (
          <InputGroup label={t("Resource URL")}>
            <InputsWrapper>
              <TextInput placeholder={t("Input Text")} value={value} onChange={handleValueChange} />
            </InputsWrapper>
          </InputGroup>
        )}
        {sourceType == "value" && (
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
        {fileFormat === "geojson" && (
          <InputGroup label={t("Prioritize Performance")}>
            <Switcher value={prioritizePerformance} onChange={v => setPrioritizePerformance(v)} />
          </InputGroup>
        )}
      </ContentWrapper>
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={
            ((sourceType === "url" || sourceType === "value" || sourceType === "local") &&
              !value) ||
            !isValidExtension()
          }
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default CommonAsset;
