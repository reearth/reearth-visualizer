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

  const [urlValue, setUrlValue] = useState("");
  const [layerValue, setLayerValue] = useState("");
  const [layers, setLayers] = useState<string[]>([]);

  const handleAddLayer = () => {
    const exist = layers.some((layer: string) => layer === layerValue);
    if (layerValue.trim() !== "") {
      if (!exist) setLayers(prev => [...prev, layerValue]);
      setLayerValue("");
    }
  };

  const handleDeleteLayer = (idx: number) => {
    const updatedLayers = [...layers];
    const deleted = updatedLayers.splice(idx, 1);
    console.log(deleted);

    setLayers(updatedLayers);
  };

  console.log("added layers", layers);
  const handleSubmit = () => {
    console.log("clicked", sceneId, onClose, onSubmit);
  };

  return (
    <ColJustiftBetween>
      <AssetWrapper>
        <InputGroup label="Resource URL" description="URL of the data source you want to add.">
          <Input
            type="text"
            placeholder="https://"
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
          />
        </InputGroup>
        <InputGroup
          label="Choose layer to add"
          description="Layer of the data source you want to add.">
          {layers.map((layer, index) => (
            <LayerWrapper key={index}>
              <Input type="text" placeholder={`${layer}`} disabled={true} />
              <DeleteLayerIcon icon="bin" size={16} onClick={() => handleDeleteLayer(index)} />
            </LayerWrapper>
          ))}
          <LayerWrapper>
            <Input
              type="text"
              placeholder="layer name"
              value={layerValue}
              onChange={e => setLayerValue(e.target.value)}
            />
            <DeleteLayerIcon icon="bin" size={16} />
          </LayerWrapper>
          <AddLayerWrapper>
            <Button
              icon="plus"
              text="Layer"
              buttonType="primary"
              size="small"
              onClick={handleAddLayer}
              disabled={!layerValue}
            />
          </AddLayerWrapper>
        </InputGroup>
      </AssetWrapper>
      <SubmitWrapper>
        <Button
          text="Add to Layer"
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={!urlValue}
        />
      </SubmitWrapper>
    </ColJustiftBetween>
  );
};

export default VectorTiles;
