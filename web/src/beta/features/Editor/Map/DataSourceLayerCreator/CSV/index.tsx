import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import {
  Button,
  Icon,
  RadioGroup,
  TextInput
} from "@reearth/beta/lib/reearth-ui";
import { AssetField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { DataProps, SourceType, DataSourceOptType } from "..";
import { generateTitle } from "../util";

const assetsTypes = ["csv" as const];

const CSV: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const theme = useTheme();
  const [sourceType, setSourceType] = useState<SourceType>("local");
  const [value, setValue] = useState("");
  const [layerName, setLayerName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const dataSourceOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("From Assets"), value: "local" },
      { label: t("From Web"), value: "url" }
    ],
    [t]
  );

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(value, layerName),
      visible: true,
      config: {
        data: {
          url:
            (sourceType === "url" || sourceType === "local") && value !== ""
              ? value
              : undefined,
          type: "csv",
          csv: {
            latColumn: lat,
            lngColumn: lng
          }
        }
      }
    });
    onClose();
  };

  const handleValueChange = useCallback((value?: string, name?: string) => {
    setValue(value || "");
    setLayerName(name || "");
  }, []);

  const handleDataSourceTypeChange = useCallback((newValue: string) => {
    setSourceType(newValue as SourceType);
    setValue("");
  }, []);

  return (
    <Wrapper>
      <ContentWrapper>
        <InputGroup label={t("Source Type")}>
          <RadioGroup
            value={sourceType}
            options={dataSourceOptions}
            onChange={handleDataSourceTypeChange}
          />
        </InputGroup>

        {sourceType == "local" && (
          <InputsWrapper>
            <AssetField
              inputMethod="asset"
              title={t("Asset")}
              value={value}
              assetsTypes={assetsTypes}
              onChange={handleValueChange}
            />
          </InputsWrapper>
        )}
        {sourceType == "url" && (
          <InputGroup label={t("Resource URL")}>
            <InputsWrapper>
              <TextInput
                placeholder="https://"
                value={value}
                onChange={handleValueChange}
              />
            </InputsWrapper>
          </InputGroup>
        )}
        <Warning>
          <IconWrapper
            icon="lightBulb"
            color={theme.warning.main}
            size="normal"
          />
          <TextWrapper>
            {t(
              "Visualizer currently only supports CSV point data. Please specify the column names for latitude and longitude in your data below."
            )}
          </TextWrapper>
        </Warning>
        <CoordinateWrapper>
          <InputGroup label={t("Latitude Column Name")}>
            <InputsWrapper>
              <TextInput
                value={lat}
                placeholder={t("Column Name")}
                onChange={(value) => setLat(value)}
              />
            </InputsWrapper>
          </InputGroup>
          <InputGroup label={t("Longitude Column Name")}>
            <InputsWrapper>
              <TextInput
                value={lng}
                placeholder={t("Column Name")}
                onChange={(value) => setLng(value)}
              />
            </InputsWrapper>
          </InputGroup>
        </CoordinateWrapper>
      </ContentWrapper>
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          disabled={!value || !lng || !lat}
          appearance="primary"
          onClick={handleSubmit}
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

const TextWrapper = styled("div")(({ theme }) => ({
  color: theme.warning.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const IconWrapper = styled(Icon)(() => ({
  flexGrow: 0,
  flexShrink: 0
}));

const CoordinateWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center",
  width: "100%"
}));

export default CSV;
