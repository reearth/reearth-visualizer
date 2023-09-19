import { FC } from "react";

import Button from "@reearth/beta/components/Button";
import generateRandomString from "@reearth/beta/utils/generate-random-string";

import { DataProps } from "..";
import useHooks from "../hooks";
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

const WmsTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const {
    urlValue,
    layerValue,
    layerInput,
    layers,
    setUrlValue,
    setLayerValue,
    handleAddLayer,
    handleDeleteLayer,
    handleLayerInput,
  } = useHooks();

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateRandomString(5),
      visible: true,
      config: {
        data: {
          url: urlValue !== "" ? urlValue : null,
          type: "wms",
          layers: layers.length <= 1 ? layers[0] : layers,
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
          {!layers.length || layerInput ? (
            <LayerWrapper>
              <Input
                type="text"
                placeholder="layer name"
                value={layerValue}
                onChange={e => setLayerValue(e.target.value)}
                onKeyDown={handleAddLayer}
              />
              <DeleteLayerIcon disabled={true} icon="bin" size={16} />
            </LayerWrapper>
          ) : (
            <></>
          )}

          <AddLayerWrapper>
            <Button
              icon="plus"
              text="Layer"
              buttonType="primary"
              size="small"
              onClick={handleLayerInput}
              disabled={layers.length < 1}
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

export default WmsTiles;
