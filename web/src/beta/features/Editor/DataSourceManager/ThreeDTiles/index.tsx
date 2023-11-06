import { useState } from "react";

import Button from "@reearth/beta/components/Button";

import { DataProps } from "..";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SubmitWrapper,
  generateTitle,
} from "../utils";

const ThreeDTiles: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(value),
      visible: true,
      config: {
        data: {
          url: value !== "" ? value : undefined,
          type: "3dtiles",
        },
      },
    });
    onClose();
  };

  return (
    <ColJustifyBetween>
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
      <SubmitWrapper>
        <Button
          text="Add to Layer"
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={!value}
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default ThreeDTiles;
