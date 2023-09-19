import React from "react";

import Button from "@reearth/beta/components/Button";
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

  const [sourceType, setSourceType] = React.useState("url"); // ["url", "local", "value"]
  const [value, setValue] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [long, setLong] = React.useState("");

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateRandomString(5),
      visible: true,
      config: {
        data: {
          url: sourceType === "url" && value !== "" ? value : null,
          type: "csv",
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

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputGroup
          label="Source Type"
          description="Select the type of data source you want to add.">
          <SourceTypeWrapper>
            <RadioGroup
              options={[{ label: t("From URL"), keyValue: "url" }]}
              selectedValue={sourceType}
              onChange={setSourceType}
            />
          </SourceTypeWrapper>
        </InputGroup>
        <InputGroup label="Resource URL" description="URL of the data source you want to add.">
          <Input
            type="text"
            placeholder="Input Text"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </InputGroup>
        <Text size="body">Point coordinates</Text>
        <InputGroup label="Latitude Field" description="Description around">
          <Input
            type="number"
            placeholder="Input Text"
            value={lat}
            onChange={e => setLat(e.target.value)}
          />
        </InputGroup>
        <InputGroup label="Longitude Field" description="Description around">
          <Input
            type="number"
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
