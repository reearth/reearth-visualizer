import React from "react";

import Button from "@reearth/beta/components/Button";
import generateRandomString from "@reearth/beta/utils/generate-random-string";
import RadioButton from "@reearth/classic/components/atoms/RadioButton";
import Select from "@reearth/classic/components/atoms/Select";
import { Option } from "@reearth/classic/components/atoms/SelectOption";
import ToggleButton from "@reearth/classic/components/atoms/ToggleButton";
import { styled } from "@reearth/services/theme";

import { ColJustiftBetween, AssetWrapper, InputGroup, Input } from "./utils";

import { DataProps } from ".";

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
          <div style={{ display: "flex", gap: "24px" }}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <RadioButton
                value="url"
                checked={sourceType == "url"}
                handleChange={c => c && setSourceType("url")}
              />
              <span style={{ fontSize: "0.75rem" }}>From URL</span>
            </label>
            <label style={{ display: "flex", alignItems: "center" }}>
              <RadioButton
                value="local"
                checked={sourceType == "local"}
                handleChange={c => c && setSourceType("local")}
              />
              <span style={{ fontSize: "0.75rem" }}>From Local</span>
            </label>
            <label style={{ display: "flex", alignItems: "center" }}>
              <RadioButton
                value="value"
                checked={sourceType == "value"}
                handleChange={c => c && setSourceType("value")}
              />
              <span style={{ fontSize: "0.75rem" }}>From Value</span>
            </label>
          </div>
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
                <ToggleButton
                  checked={prioritizePerformance}
                  onChange={v => setPrioritizePerformance(v)}
                />
              </InputGroup>
            )}
          </>
        )}
        {sourceType == "local" && <>TODO</>}
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
      <div
        style={{
          marginTop: "24px",
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}>
        <Button
          text="Add to Layer"
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={(sourceType === "url" || sourceType === "value") && !value}
        />
      </div>
    </ColJustiftBetween>
  );
};

const TextArea = styled.textarea`
  flex: auto;
  background: transparent;
  border: 1px solid #777;
  border-radius: 4px;
  outline: none;
  padding: 5px 10px;
  color: ${props => props.theme.content.main};
  overflow: hidden;
`;

export default Asset;
