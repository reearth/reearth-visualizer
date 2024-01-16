import { FC } from "react";

import Button from "@reearth/beta/components/Button";
import {
  AddLayerWrapper,
  AssetWrapper,
  ColJustifyBetween,
  DeleteLayerIcon,
  Input,
  InputGroup,
  LayerWrapper,
  SubmitWrapper,
  generateTitle,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { DataProps } from "..";
import useHooks from "../hooks";

const VectorTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const {
    urlValue,
    layerValue,
    layerInput,
    layers,
    setLayers,
    setUrlValue,
    setLayerValue,
    handleAddLayer,
    handleDeleteLayer,
    handleLayerInput,
  } = useHooks();

  const t = useT();

  const handleSubmit = () => {
    let updatedLayers = layers;
    if (layerValue.trim() !== "") {
      const exist = layers.some(layer => layer === layerValue);
      if (!exist) {
        updatedLayers = [...layers, layerValue];
        setLayers(updatedLayers);
      }
      setLayerValue("");
    }

    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(urlValue),
      visible: true,
      config: {
        data: {
          url: urlValue !== "" ? urlValue : undefined,
          type: "mvt",
          layers: updatedLayers.length === 1 ? updatedLayers[0] : updatedLayers,
        },
      },
    });
    onClose();
  };

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputGroup
          label={t("Resource URL")}
          description={t("URL of the data source you want to add.")}>
          <Input
            type="text"
            placeholder="https://"
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
          />
        </InputGroup>
        <InputGroup
          label={t("Choose layer to add")}
          description={t("Layer of the data source you want to add.")}>
          {layers.map((layer: string, index: number) => (
            <LayerWrapper key={index}>
              <Input type="text" value={`${layer}`} disabled={true} />
              <DeleteLayerIcon icon="bin" size={16} onClick={() => handleDeleteLayer(index)} />
            </LayerWrapper>
          ))}
          {(!layers.length || layerInput) && (
            <LayerWrapper>
              <Input
                type="text"
                placeholder={t("layer name")}
                value={layerValue}
                onChange={e => setLayerValue(e.target.value)}
                onKeyDown={handleAddLayer}
              />
              <DeleteLayerIcon disabled={true} icon="bin" size={16} />
            </LayerWrapper>
          )}

          <AddLayerWrapper>
            <Button
              icon="plus"
              text={t("Layer")}
              buttonType="primary"
              size="small"
              onClick={handleLayerInput}
              disabled={!layerValue && !layers.length}
            />
          </AddLayerWrapper>
        </InputGroup>
      </AssetWrapper>
      <SubmitWrapper>
        <Button
          text={t("Add to Layer")}
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={!urlValue}
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default VectorTiles;
