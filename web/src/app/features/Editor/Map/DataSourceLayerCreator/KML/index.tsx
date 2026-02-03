import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper
} from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import {
  RadioGroup,
  Button,
  TextInput,
  TextArea,
  Icon
} from "@reearth/app/lib/reearth-ui";
import { AssetField } from "@reearth/app/ui/fields";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import { DataProps } from "..";

import useHooks from "./hooks";

const KML: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
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
    <Wrapper data-testid="kml-wrapper">
      <ContentWrapper data-testid="kml-content">
        <Warning data-testid="kml-warning">
          <IconWrapper
            icon="flask"
            color={theme.warning.main}
            size="normal"
            data-testid="kml-warning-icon"
          />
          <TextWrapper data-testid="kml-warning-text">
            {t(
              "Support for the KML format is currently experimental and remains somewhat unstable, with certain features not yet fully supported. We advise using it with caution."
            )}
          </TextWrapper>
        </Warning>
        <InputGroup
          label={t("Source Type")}
          data-testid="kml-source-type-group"
        >
          <RadioGroup
            value={sourceType}
            options={dataSourceTypeOptions}
            onChange={handleDataSourceTypeChange}
            data-testid="kml-source-type-radio"
          />
        </InputGroup>

        {sourceType === "local" && (
          <InputsWrapper data-testid="kml-local-inputs">
            <AssetField
              inputMethod="asset"
              title={t("Asset")}
              value={value}
              assetsTypes={["kml", "kmz"]}
              onChange={handleValueChange}
              data-testid="kml-asset-field"
            />
          </InputsWrapper>
        )}
        {sourceType === "url" && (
          <InputGroup label={t("Resource URL")} data-testid="kml-url-group">
            <InputsWrapper data-testid="kml-url-inputs">
              <TextInput
                placeholder={t("Input Text")}
                value={value}
                onChange={handleValueChange}
                data-testid="kml-url-textinput"
              />
            </InputsWrapper>
          </InputGroup>
        )}
        {sourceType === "value" && (
          <InputGroup label={t("Value")} data-testid="kml-value-group">
            <InputsWrapper data-testid="kml-value-inputs">
              <TextArea
                placeholder={t("Input data here")}
                rows={8}
                value={value}
                onChange={handleValueChange}
                data-testid="kml-value-textarea"
              />
            </InputsWrapper>
          </InputGroup>
        )}
      </ContentWrapper>
      <SubmitWrapper data-testid="kml-submit-wrapper">
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!value}
          data-testid="kml-submit-button"
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

const Warning = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.small,
  alignItems: css.alignItems.center
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

export default KML;
