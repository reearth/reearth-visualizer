import { useCallback, useMemo, useState } from "react";

import Button from "@reearth/beta/components/Button";
import URLField from "@reearth/beta/components/fields/URLField";
import RadioGroup from "@reearth/beta/components/RadioGroup";
import Text from "@reearth/beta/components/Text";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SourceTypeWrapper,
  SubmitWrapper,
  generateTitle,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { DataProps, SourceType, DataSourceOptType } from "..";

const DelimitedText: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const [sourceType, setSourceType] = useState<SourceType>("local");
  const [value, setValue] = useState("");
  const [layerName, setLayerName] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");

  const DataSourceOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("From Assets"), keyValue: "local" },
      { label: t("From Web"), keyValue: "url" },
    ],
    [t],
  );

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(value, layerName),
      visible: true,
      config: {
        data: {
          url: (sourceType === "url" || sourceType === "local") && value !== "" ? value : undefined,
          type: "csv",
          csv: {
            latColumn: lat,
            lngColumn: long,
          },
        },
      },
    });
    onClose();
  };

  const handleOnChange = useCallback((value?: string, name?: string) => {
    setValue(value || "");
    setLayerName(name || "");
  }, []);

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputGroup
          label={t("Source Type")}
          description={t("Select the type of data source you want to add.")}>
          <SourceTypeWrapper>
            <RadioGroup
              options={DataSourceOptions}
              selectedValue={sourceType}
              onChange={(newValue: string) => setSourceType(newValue as SourceType)}
            />
          </SourceTypeWrapper>
        </InputGroup>

        {sourceType == "url" && (
          <InputGroup
            label={t("Resource URL")}
            description={t("URL of the data source you want to add.")}>
            <Input
              type="text"
              placeholder={t("Input Text")}
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </InputGroup>
        )}
        {sourceType == "local" && (
          <URLField
            fileType="asset"
            entityType="file"
            value={value}
            fileFormat="CSV"
            name={t("Asset")}
            onChange={handleOnChange}
          />
        )}
        <Text size="body">{t("Point coordinates")}</Text>
        <InputGroup label={t("Latitude Field")}>
          <Input
            type="text"
            placeholder={t("Input Text")}
            value={lat}
            onChange={e => setLat(e.target.value)}
          />
        </InputGroup>
        <InputGroup label={t("Longitude Field")}>
          <Input
            type="text"
            placeholder={t("Input Text")}
            value={long}
            onChange={e => setLong(e.target.value)}
          />
        </InputGroup>
      </AssetWrapper>
      <SubmitWrapper>
        <Button
          text={t("Add to Layer")}
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={
            (sourceType === "url" || sourceType === "value" || sourceType === "local") && !value
          }
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default DelimitedText;
