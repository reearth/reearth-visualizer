import { FC } from "react";

import URLField from "@reearth/beta/components/fields/URLField";
import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
} from "@reearth/beta/features/Editor/utils";
import {
  Selector,
  RadioGroup,
  Switcher,
  Button,
  TextInput,
  TextArea,
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { DataProps } from "..";

import useHooks from "./hooks";

const CommonAsset: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const {
    value,
    fileFormat,
    sourceType,
    dataSourceOptions,
    fileFormatOptions,
    prioritizePerformance,
    handleOnChange,
    handleDataSourceTypeOnChange,
    handleFileFormatOnChange,
    handleSubmit,
    setPrioritizePerformance,
    isValidExtension,
  } = useHooks({ sceneId, onSubmit, onClose });

  return (
    <Wrapper>
      <InputGroup
        label={t("File Format")}
        description={t("File format of the data source you want to add.")}>
        <Selector
          value={fileFormat}
          options={fileFormatOptions}
          onChange={handleFileFormatOnChange}
        />
      </InputGroup>
      <InputGroup label={t("Source Type")}>
        <RadioGroup
          checkedValue={sourceType}
          options={dataSourceOptions}
          onChange={handleDataSourceTypeOnChange}
        />
      </InputGroup>

      {sourceType == "local" && (
        //this Url field component will be replaced with new ui/fields
        <InputsWrapper>
          <URLField
            fileType="asset"
            entityType="file"
            name={t("Asset")}
            value={value}
            fileFormat={fileFormat}
            onChange={handleOnChange}
          />
        </InputsWrapper>
      )}
      {sourceType == "url" && (
        <InputGroup label={t("Resource URL")}>
          <InputsWrapper>
            <TextInput placeholder={t("Input Text")} value={value} onChange={handleOnChange} />
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
              onChange={handleOnChange}
            />
          </InputsWrapper>
        </InputGroup>
      )}
      {fileFormat === "GeoJSON" && (
        <InputGroup label={t("Prioritize Performance")}>
          <Switcher value={prioritizePerformance} onChange={v => setPrioritizePerformance(v)} />
        </InputGroup>
      )}
      <Spacer />
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

const Spacer = styled("div")(() => ({
  minHeight: "100px",
}));

export default CommonAsset;
