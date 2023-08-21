import React from "react";

import Button from "@reearth/beta/components/Button";
import Modal from "@reearth/beta/components/Modal";
import ToggleButton from "@reearth/beta/components/properties/Toggle";
import Text from "@reearth/beta/components/Text";
import Select from "@reearth/classic/components/atoms/Select";
import { Option } from "@reearth/classic/components/atoms/SelectOption";
import { styled } from "@reearth/services/theme";

export default function DataSourceManager() {
  return (
    <Modal
      size="md"
      isVisible={true}
      title="Data Source Manager"
      button1={<Button buttonType="secondary">Cancel</Button>}
      button2={<Button buttonType="primary">Add to Layer</Button>}
      onClose={() => {}}
      sidebarTabs={[
        {
          content: <Asset />,
          id: "asset",
          label: "Asset",
        },
        {
          content: <DelimitedText />,
          id: "delimitedText",
          label: "Delimited Text",
        },
        {
          content: <ThreeDTiles />,
          id: "threeDTiles",
          label: "3D Tiles",
        },
      ]}
    />
  );
}

// Asset
function Asset() {
  const [fileFormat, setFileFormat] = React.useState("GeoJSON");
  const [prioritizePerformance, setPrioritizePerformance] = React.useState(false);

  return (
    <AssetWrapper>
      <InputGroup label="Source Type" description="Select the type of data source you want to add.">
        <label style={{ display: "flex", gap: "8px" }}>
          <input type="radio" checked />
          <span style={{ fontSize: "0.75rem" }}>From URL</span>
        </label>
      </InputGroup>
      <InputGroup label="File Format" description="File format of the data source you want to add.">
        <Select value={fileFormat} onChange={setFileFormat}>
          {["GeoJSON", "KML", "CJML"].map(op => (
            <Option key={op} value={op} label={op}>
              {op}
            </Option>
          ))}
        </Select>
      </InputGroup>
      <InputGroup label="Resource URL" description="URL of the data source you want to add.">
        <Input type="text" placeholder="Input Text" />
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
    </AssetWrapper>
  );
}

const AssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

function DelimitedText() {
  return (
    <AssetWrapper>
      <InputGroup label="Source Type" description="Select the type of data source you want to add.">
        <label style={{ display: "flex", gap: "8px" }}>
          <input type="radio" checked />
          <span style={{ fontSize: "0.75rem" }}>From URL</span>
        </label>
      </InputGroup>
      <InputGroup label="Resource URL" description="URL of the data source you want to add.">
        <Input type="text" placeholder="Input Text" />
      </InputGroup>
      <Text size="body">Point coordinates</Text>
      <InputGroup label="Latitude Field" description="Description around">
        <Input type="text" placeholder="Input Text" />
      </InputGroup>
      <InputGroup label="Longitude Field" description="Description around">
        <Input type="text" placeholder="Input Text" />
      </InputGroup>
    </AssetWrapper>
  );
}

function ThreeDTiles() {
  return (
    <AssetWrapper>
      <InputGroup label="Resource URL" description="URL of the data source you want to add.">
        <Input type="text" placeholder="Input Text" />
      </InputGroup>
    </AssetWrapper>
  );
}

// UTILS

function InputGroup({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <InputGroupWrapper>
      <Label>{label}</Label>
      {children}
      <Description>{description}</Description>
    </InputGroupWrapper>
  );
}

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
