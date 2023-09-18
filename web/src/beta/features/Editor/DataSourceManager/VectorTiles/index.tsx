import { FC, useState } from "react";

import Button from "@reearth/beta/components/Button";
import generateRandomString from "@reearth/beta/utils/generate-random-string";

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
    updatedLayers.splice(idx, 1);
    setLayers(updatedLayers);
  };

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateRandomString(5),
      visible: true,
      config: {
        data: {
          url: urlValue !== "" ? urlValue : null,
          type: "mvt",
          layers: layers,
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
