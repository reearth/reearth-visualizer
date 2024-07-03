import { FC } from "react";

import {
  AddLayerWrapper,
  InputGroup,
  InputsWrapper,
  LayerNameListWrapper,
  LayerWrapper,
  SubmitWrapper,
  Wrapper,
  generateTitle,
} from "@reearth/beta/features/Editor/utils";
import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import { DataProps } from "..";
import useHooks from "../hooks";

const WmsTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const theme = useTheme();

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
          type: "wms",
          layers: updatedLayers.length === 1 ? updatedLayers[0] : updatedLayers,
        },
      },
    });
    onClose();
  };

  return (
    <Wrapper>
      <InputGroup label={t("Resource URL")}>
        <InputsWrapper>
          <TextInput
            placeholder="https://"
            value={urlValue}
            onChange={value => setUrlValue(value)}
          />
        </InputsWrapper>
      </InputGroup>
      <InputGroup label={t("Choose layer to add")}>
        <LayerNameListWrapper>
          {layers.map((layer: string, index: number) => (
            <LayerWrapper key={index}>
              <TextInput value={`${layer}`} extendWidth />
              <Button
                icon="close"
                iconButton
                shadow={false}
                appearance="simple"
                iconColor={theme.content.main}
                onClick={() => handleDeleteLayer(index)}
              />
            </LayerWrapper>
          ))}
          {(!layers.length || layerInput) && (
            <LayerWrapper>
              <TextInput
                placeholder={t("layer name")}
                value={layerValue}
                extendWidth
                onBlur={handleAddLayer}
                onChange={value => setLayerValue(value)}
              />
              <Button
                icon="close"
                iconButton
                shadow={false}
                iconColor={theme.content.weak}
                appearance="simple"
              />
            </LayerWrapper>
          )}
        </LayerNameListWrapper>

        <AddLayerWrapper>
          <Button icon="plus" title={t("Layer name")} size="small" onClick={handleLayerInput} />
        </AddLayerWrapper>
      </InputGroup>
      <SubmitWrapper>
        <Button title={t("Add to Layer")} appearance="primary" onClick={handleSubmit} />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default WmsTiles;
