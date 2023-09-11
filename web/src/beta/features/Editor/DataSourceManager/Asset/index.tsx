import React from "react";

import Button from "@reearth/beta/components/Button";
import RadioGroup from "@reearth/beta/components/RadioGroup";
import Toggle from "@reearth/beta/components/Toggle";
import generateRandomString from "@reearth/beta/utils/generate-random-string";
//import RadioButton from "@reearth/classic/components/atoms/RadioButton";
import Select from "@reearth/classic/components/atoms/Select";
import { Option } from "@reearth/classic/components/atoms/SelectOption";

import { DataProps } from "..";
import {
  ColJustiftBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SourceTypeWrapper,
  // RadioButtonLabel,
  SubmitWrapper,
  TextArea,
} from "../utils";

const Asset: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const [sourceType, setSourceType] = React.useState("url"); // ["url", "local", "value"]
  const [fileFormat, setFileFormat] = React.useState("GeoJSON");
  const [value, setValue] = React.useState("");
  const [prioritizePerformance, setPrioritizePerformance] = React.useState(false);

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateRandomString(5),
      visible: true,
      config: {
        data: {
          url: sourceType === "url" && value !== "" ? value : null,
          type: fileFormat.toLowerCase(),
          value: sourceType === "value" && value !== "" ? value : null,
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
    <ColJustiftBetween>
      <AssetWrapper>
        <InputGroup
          label="Source Type"
          description="Select the type of data source you want to add.">
          <SourceTypeWrapper>
            <RadioGroup
              options={[
                { value: "url", selected: true },
                { value: "value", selected: false },
              ]}
              layout="horizontal"
              onChange={setSourceType}
            />
          </SourceTypeWrapper>
        </InputGroup>
        {sourceType == "url" && (
          <>
            <InputGroup
              label="File Format"
              description="File format of the data source you want to add.">
              <Select value={fileFormat} onChange={setFileFormat}>
                {["GeoJSON", "KML", "CZML"].map(op => (
                  <Option key={op} value={op} label={op}>
                    {op}
                  </Option>
                ))}
              </Select>
            </InputGroup>
            <InputGroup label="Resource URL" description="URL of the data source you want to add.">
              <Input
                type="text"
                placeholder="Input Text"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </InputGroup>
            {fileFormat === "GeoJSON" && (
              <InputGroup
                label="Prioritize Performance"
                description="URL of the data source you want to add.">
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
            <InputGroup
              label="File Format"
              description="File format of the data source you want to add.">
              <Select value={fileFormat} onChange={setFileFormat}>
                {["GeoJSON", "KML", "CZML"].map(op => (
                  <Option key={op} value={op} label={op}>
                    {op}
                  </Option>
                ))}
              </Select>
            </InputGroup>
            <InputGroup label="Value" description="Description around.">
              <TextArea
                placeholder="Write down your text"
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
          text="Add to Layer"
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={(sourceType === "url" || sourceType === "value") && !value}
        />
      </SubmitWrapper>
    </ColJustiftBetween>
  );
};

export default Asset;
