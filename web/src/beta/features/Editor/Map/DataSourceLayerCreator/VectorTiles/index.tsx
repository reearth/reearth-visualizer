import { FC } from "react";

import {
  InputGroup,
  InputsWrapper,
  LayerNameListWrapper,
  LayerWrapper,
  SubmitWrapper,
  Wrapper,
} from "@reearth/beta/features/Editor/Map/commonLayerCreatorStyles";
import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { generateTitle } from "@reearth/beta/utils/generate-title";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import { DataProps } from "..";
import useHooks from "../hooks";

const WmsTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const theme = useTheme();

  const {
    mvtUrlValue,
    layerNameValue,
    isLayerName,
    layers,
    setLayers,
    handleOnChange,
    setLayerNameValue,
    handleOnBlur,
    handleLayerNameButtonClick,
    handleLayerNameDelete,
  } = useHooks();

  const handleSubmit = () => {
    let updatedLayers = layers;
    if (layerNameValue.trim() !== "") {
      const exist = layers.some(layer => layer === layerNameValue);
      if (!exist) {
        updatedLayers = [...layers, layerNameValue];
        setLayers(updatedLayers);
      }
      setLayerNameValue("");
    }

    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(mvtUrlValue),
      visible: true,
      config: {
        data: {
          url: mvtUrlValue !== "" ? mvtUrlValue : undefined,
          type: "mvt",
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
            value={mvtUrlValue}
            onChange={value => handleOnChange(value, "mvtUrl")}
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
                size="small"
                iconColor={theme.content.main}
                onClick={() => handleLayerNameDelete(index)}
              />
            </LayerWrapper>
          ))}
          {(!layers.length || isLayerName) && (
            <LayerWrapper>
              <TextInput
                placeholder={t("layer name")}
                value={layerNameValue}
                extendWidth
                onBlur={handleOnBlur}
                onChange={value => setLayerNameValue(value)}
              />
              <Button
                icon="close"
                iconButton
                shadow={false}
                iconColor={theme.content.weak}
                size="small"
                appearance="simple"
                disabled
              />
            </LayerWrapper>
          )}
        </LayerNameListWrapper>

        <Button
          icon="plus"
          title={t("Layer name")}
          size="small"
          onClick={handleLayerNameButtonClick}
        />
      </InputGroup>
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!mvtUrlValue.endsWith(".mvt")}
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default WmsTiles;
