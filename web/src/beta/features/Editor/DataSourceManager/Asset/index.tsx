import React, { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import SelectField from "@reearth/beta/components/fields/SelectField";
import RadioGroup from "@reearth/beta/components/RadioGroup";
import Toggle from "@reearth/beta/components/Toggle";
import { useT } from "@reearth/services/i18n";

import { DataProps } from "..";
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
  const [sourceType, setSourceType] = React.useState("url"); // ["url", "local", "value"]
  const [fileFormat, setFileFormat] = React.useState("GeoJSON");
  const [value, setValue] = React.useState("");
  const [prioritizePerformance, setPrioritizePerformance] = React.useState(false);
  const DataSourceOptions = useMemo(
    () => [
      { label: t("From URL"), keyValue: "url" },
      { label: t("From Value"), keyValue: "value" },
    ],
    [t],
  );

  const handleSubmit = () => {
    let parsedValue = null;

    if (sourceType === "value" && value !== "") {
      try {
        parsedValue = JSON.parse(value);
      } catch (error) {
        parsedValue = value;
      }
    }
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(value, sourceType),
      visible: true,
      config: {
        data: {
          url: sourceType === "url" && value !== "" ? value : null,
          type: fileFormat.toLowerCase(),
          value: parsedValue,
        },
        resource: {
          clampToGround: true,
        },
        marker: {
          heightReference: "clamp",
        },
        polygon: {
          heightReference: "clamp",
        },
        polyline: {
          clampToGround: true,
        },
      },
    });
    onClose();
  };

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
              onChange={setSourceType}
            />
          </SourceTypeWrapper>
        </InputGroup>
        {sourceType == "url" && (
          <>
            <SelectDataType fileFormat={fileFormat} setFileFormat={setFileFormat} />
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
          </>
        )}
        {sourceType == "value" && (
          <>
            <SelectDataType fileFormat={fileFormat} setFileFormat={setFileFormat} />
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
      </AssetWrapper>
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
