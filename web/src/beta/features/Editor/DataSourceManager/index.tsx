import React from "react";

import Button from "@reearth/beta/components/Button";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import generateRandomString from "@reearth/beta/utils/generate-random-string";
import RadioButton from "@reearth/classic/components/atoms/RadioButton";
import Select from "@reearth/classic/components/atoms/Select";
import { Option } from "@reearth/classic/components/atoms/SelectOption";
import ToggleButton from "@reearth/classic/components/atoms/ToggleButton";
import { styled } from "@reearth/services/theme";

import { LayerAddProps } from "../useLayers";

type DataProps = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

const DataSourceManager: React.FC<DataProps> = ({ sceneId, onClose, onSubmit }) => {
  return (
    <Modal
      size="md"
      isVisible={true}
      title="Data Source Manager"
      onClose={onClose}
      sidebarTabs={[
        {
          content: <Asset sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "asset",
          label: "Asset",
        },
        {
          content: <DelimitedText sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "delimitedText",
          label: "Delimited Text",
        },
        {
          content: <ThreeDTiles sceneId={sceneId} onSubmit={onSubmit} onClose={onClose} />,
          id: "threeDTiles",
          label: "3D Tiles",
        },
      ]}
    />
  );
};

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
        <Button text="Add to Layer" buttonType="primary" size="medium" onClick={handleSubmit} />
      </div>
    </ColJustiftBetween>
  );
};

const AssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ColJustiftBetween = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const DelimitedText: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const [sourceType, setSourceType] = React.useState("url"); // ["url", "local", "value"]
  const [value, setValue] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [long, setLong] = React.useState("");

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateRandomString(5),
      config: {
        data: {
          url: sourceType === "url" && value !== "" ? value : null,
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
          </div>
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
      <div
        style={{
          marginTop: "24px",
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}>
        <Button text="Add to Layer" buttonType="primary" size="medium" onClick={handleSubmit} />
      </div>
    </ColJustiftBetween>
  );
};

const ThreeDTiles: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const [value, setValue] = React.useState("");

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateRandomString(5),
      config: {
        data: {
          url: value !== "" ? value : null,
          type: "3dtiles",
        },
      },
    });
    onClose();
  };

  return (
    <ColJustiftBetween>
      <AssetWrapper>
        <InputGroup label="Resource URL" description="URL of the data source you want to add.">
          <Input
            type="text"
            placeholder="Input Text"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </InputGroup>
      </AssetWrapper>
      <div
        style={{
          marginTop: "24px",
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}>
        <Button text="Add to Layer" buttonType="primary" size="medium" onClick={handleSubmit} />
      </div>
    </ColJustiftBetween>
  );
};

// UTILS

const InputGroup: React.FC<{
  label: string;
  description: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => {
  return (
    <InputGroupWrapper>
      <Label>{label}</Label>
      {children}
      <Description>{description}</Description>
    </InputGroupWrapper>
  );
};

const InputGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.content.main};
`;

const Description = styled.div`
  font-size: 0.625rem;
  color: ${({ theme }) => theme.content.weak};
`;

const Input = styled.input`
  flex: auto;
  background: transparent;
  border: 1px solid #777;
  border-radius: 4px;
  outline: none;
  padding: 5px 10px;
  color: ${props => props.theme.content.main};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

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

export default DataSourceManager;
