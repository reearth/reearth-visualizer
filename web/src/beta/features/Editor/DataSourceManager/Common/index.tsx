import { useCallback, useMemo, useState } from "react";

import Button from "@reearth/beta/components/Button";
import SelectField from "@reearth/beta/components/fields/SelectField";
import URLField from "@reearth/beta/components/fields/URLField";
import RadioGroup from "@reearth/beta/components/RadioGroup";
import Toggle from "@reearth/beta/components/Toggle";
import { DataType } from "@reearth/beta/lib/core/Map";
import { useT } from "@reearth/services/i18n";

import { DataProps, DataSourceOptType, FileFormatType, SourceType } from "..";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SourceTypeWrapper,
  SubmitWrapper,
  TextArea,
  generateTitle,
} from "../utils";

const SelectDataType: React.FC<{ fileFormat: string; setFileFormat: (k: string) => void }> = ({
  fileFormat,
  setFileFormat,
}) => {
  const t = useT();

  return (
    <SelectField
      value={fileFormat}
      options={["GeoJSON", "KML", "CZML"].map(v => ({ key: v, label: v }))}
      name={t("File Format")}
      description={t("File format of the data source you want to add.")}
      onChange={setFileFormat}
    />
  );
};

const Asset: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const [sourceType, setSourceType] = useState<SourceType>("local");
  const [fileFormat, setFileFormat] = useState<FileFormatType>("GeoJSON");
  const [value, setValue] = useState("");
  const [layerName, setLayerName] = useState("");
  const [prioritizePerformance, setPrioritizePerformance] = useState(false);
  const DataSourceOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("From Assets"), keyValue: "local" },
      { label: t("From Web"), keyValue: "url" },
      { label: t("From Value"), keyValue: "value" },
    ],
    [t],
  );

  const handleSubmit = () => {
    let parsedValue = null;

    if (sourceType === "value" && value !== "") {
      if (fileFormat === "GeoJSON") {
        try {
          parsedValue = JSON.parse(value);
        } catch (error) {
          parsedValue = value;
        }
      } else {
        parsedValue = "data:text/plain;charset=UTF-8," + encodeURIComponent(value);
      }
    }

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
              : fileFormat === "CZML" || fileFormat === "KML"
              ? parsedValue
              : undefined,
          type: fileFormat.toLowerCase() as DataType,
          value: parsedValue,
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
          <>
            <SelectDataType
              fileFormat={fileFormat}
              setFileFormat={(f: string) => setFileFormat(f as FileFormatType)}
            />
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
          </>
        )}
        {sourceType == "value" && (
          <>
            <SelectDataType
              fileFormat={fileFormat}
              setFileFormat={(f: string) => setFileFormat(f as FileFormatType)}
            />
            <InputGroup label={t("Value")} description={t("Description around.")}>
              <TextArea
                placeholder={t("Write down your text")}
                rows={8}
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </InputGroup>
          </>
        )}
        {sourceType == "local" && (
          <>
            <SelectDataType
              fileFormat={fileFormat}
              setFileFormat={(f: string) => setFileFormat(f as FileFormatType)}
            />
            <URLField
              fileType="asset"
              entityType={"file"}
              name={t("Asset")}
              value={value}
              onChange={handleOnChange}
            />
          </>
        )}
      </AssetWrapper>

      {fileFormat === "GeoJSON" && (
        <InputGroup
          label={t("Prioritize Performance")}
          description={t("URL of the data source you want to add.")}>
          <Toggle
            checked={prioritizePerformance}
            disabled={true}
            onChange={v => setPrioritizePerformance(v)}
          />
        </InputGroup>
      )}
      <SubmitWrapper>
        <Button
          text={t("Add to Layer")}
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={(sourceType === "url" || sourceType === "value") && !value}
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default Asset;
