import { FC, useState } from "react";

import Button from "@reearth/beta/components/Button";
import { useT } from "@reearth/services/i18n";

import { DataProps } from "..";
import {
  AddLayerWrapper,
  AssetWrapper,
  ColJustiftBetween,
  DeleteLayerIcon,
  Input,
  InputGroup,
  LayerWrapper,
  SubmitWrapper,
} from "../utils";

const VectorTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  console.log(t);

  const handleSubmit = () => {
    console.log("clicked", sceneId, onClose, onSubmit);
  };

  const [value, setValue] = useState("");
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
        <InputGroup
          label="Choose layer to add"
          description="Layer of the data source you want to add.">
          <LayerWrapper>
            <Input
              type="text"
              placeholder="layer name"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
            <DeleteLayerIcon icon="bin" size={16} />
          </LayerWrapper>
          <AddLayerWrapper>
            <Button icon="plus" text="Layer" buttonType="primary" size="medium" disabled={!value} />
          </AddLayerWrapper>
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

export default VectorTiles;
