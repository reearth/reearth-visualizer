import React from "react";

import Button from "@reearth/beta/components/Button";
import generateRandomString from "@reearth/beta/utils/generate-random-string";

import { DataProps } from "..";
import { ColJustiftBetween, AssetWrapper, InputGroup, Input, SubmitWrapper } from "../utils";

const ThreeDTiles: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const [value, setValue] = React.useState("");

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateRandomString(5),
      visible: true,
      config: {
        data: {
          url: value !== "" ? value : null,
          type: "3dtiles",
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
    </ColJustiftBetween>
  );
};

export default ThreeDTiles;
