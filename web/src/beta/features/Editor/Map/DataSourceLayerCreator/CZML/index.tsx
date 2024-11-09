import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import {
  RadioGroup,
  Button,
  TextInput,
  TextArea,
  Icon
} from "@reearth/beta/lib/reearth-ui";
import { AssetField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

import { DataProps } from "..";

import useHooks from "./hooks";

const CZML: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const {
    value,
    sourceType,
    dataSourceTypeOptions,
    handleValueChange,
    handleDataSourceTypeChange,
    handleSubmit
  } = useHooks({ sceneId, onSubmit, onClose });

  const theme = useTheme();
  return (
    <Wrapper>
      <ContentWrapper>
        <Warning>
          <IconWrapper icon="flask" color={theme.warning.main} size="normal" />
          <TextWrapper>
            {t(
              "Support for the CZML format is currently experimental and remains somewhat unstable, with certain features not yet fully supported. We advise using it with caution."
            )}
          </TextWrapper>
        </Warning>
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
              assetsTypes={["czml"]}
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

const Warning = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center"
}));

const IconWrapper = styled(Icon)(() => ({
  flexGrow: 0,
  flexShrink: 0
}));

const TextWrapper = styled("div")(({ theme }) => ({
  color: theme.warning.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

export default CZML;
