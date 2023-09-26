import React, { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import SelectField from "@reearth/beta/components/fields/SelectField";
import URLField from "@reearth/beta/components/fields/URLField";
import RadioGroup from "@reearth/beta/components/RadioGroup";
import Text from "@reearth/beta/components/Text";
import generateRandomString from "@reearth/beta/utils/generate-random-string";
import { useT } from "@reearth/services/i18n";

import { DataProps } from "..";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SourceTypeWrapper,
  SubmitWrapper,
} from "../utils";

const DelimitedText: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const [sourceType, setSourceType] = React.useState("local"); // ["url", "local", "value"]
  const [value, setValue] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [long, setLong] = React.useState("");
  const [fileFormat, setFileFormat] = React.useState("csv");

  const DataSourceOptions = useMemo(
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
      title: generateRandomString(5),
      visible: true,
      config: {
        data: {
          url: (sourceType === "url" || sourceType === "local") && value !== "" ? value : null,
          type: fileFormat,
          csv: {
            latColumn: lat,
            lngColumn: long,
          },
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

  const handleOnChange = (value?: string) => {
    setValue(value || "");
  };

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputGroup
          label="Source Type"
          description="Select the type of data source you want to add.">
          <SourceTypeWrapper>
            <RadioGroup
              options={DataSourceOptions}
              selectedValue={sourceType}
              onChange={setSourceType}
            />
          </SourceTypeWrapper>
        </InputGroup>

        <SelectField
          value={fileFormat}
          options={["csv"].map(v => ({ key: v, label: v }))}
          name={t("File Format")}
          description={t("File format of the data source you want to add.")}
          onChange={setFileFormat}
        />

        {sourceType == "url" && (
          <InputGroup label="Resource URL" description="URL of the data source you want to add.">
            <Input
              type="text"
              placeholder="Input Text"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </InputGroup>
        )}
        {sourceType == "local" && (
          <URLField fileType="asset" value={value} name={t("Asset")} onChange={handleOnChange} />
        )}
        <Text size="body">Point coordinates</Text>
        <InputGroup label="Latitude Field" description="Description around">
          <Input
            type="text"
            placeholder="Input Text"
            value={lat}
            onChange={e => setLat(e.target.value)}
          />
        </InputGroup>
        <InputGroup label="Longitude Field" description="Description around">
          <Input
            type="text"
            placeholder="Input Text"
            value={long}
            onChange={e => setLong(e.target.value)}
          />
        </InputGroup>
      </AssetWrapper>
      <SubmitWrapper>
        <Button
          text="Add to Layer"
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={(sourceType === "url" || sourceType === "value") && !value}
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default DelimitedText;
