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
  Icon,
  Switcher
} from "@reearth/app/lib/reearth-ui";
import { AssetField } from "@reearth/app/ui/fields";
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
    handleSubmit,
    autoUpdateTime,
    setAutoUpdateTime
  } = useHooks({ sceneId, onSubmit, onClose });

  const theme = useTheme();
  return (
    <Wrapper data-testid="czml-layer-creator">
      <ContentWrapper>
        <Warning data-testid="czml-warning">
          <IconWrapper
            icon="flask"
            color={theme.warning.main}
            size="normal"
            data-testid="czml-warning-icon"
          />
          <TextWrapper data-testid="czml-warning-text">
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
            data-testid="czml-source-type"
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
              data-testid="czml-asset-field"
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
                data-testid="czml-url-input"
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
                data-testid="czml-value-input"
              />
            </InputsWrapper>
          </InputGroup>
        )}
        <InputGroup
          label={t("Auto Update Time")}
          description={t(
            "When enabled, the simulation clock will be updated to the time interval defined in the CZML file once it is loaded. Warning: If multiple CZML layers with this option enabled are loaded, the final simulation time will be set by the last loaded layer."
          )}
        >
          <Switcher
            value={autoUpdateTime}
            onChange={(v) => setAutoUpdateTime(v)}
            data-testid="czml-auto-update-time-switcher"
          />
        </InputGroup>
      </ContentWrapper>
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!value}
          data-testid="czml-submit-button"
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
