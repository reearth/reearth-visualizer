import { FC } from "react";

import {
  ContentWrapper,
  InputGroup,
  InputsWrapper,
  LayerNameListWrapper,
  LayerWrapper,
  SubmitWrapper,
  Wrapper,
} from "@reearth/beta/features/Editor/Map/commonLayerCreatorStyles";
import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import { DataProps } from "..";
import useHooks from "../hooks";
import { generateTitle } from "../util";

const WmsTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const theme = useTheme();

  const {
    wmsUrlValue,
    layerNameValue,
    isLayerName,
    layers,
    setLayers,
    handleOnChange,
    setLayerNameValue,
    handleLayerNameDelete,
    handleLayerNameButtonClick,
    handleOnBlur,
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
      title: generateTitle(wmsUrlValue),
      visible: true,
      config: {
        data: {
          url: wmsUrlValue !== "" ? wmsUrlValue : undefined,
          type: "wms",
          layers: updatedLayers.length === 1 ? updatedLayers[0] : updatedLayers,
        },
      },
    });
    onClose();
  };

  return (
    <Wrapper>
      <ContentWrapper>
        <InputGroup label={t("Resource URL")}>
          <InputsWrapper>
            <TextInput
              placeholder="https://"
              value={wmsUrlValue}
              onChange={value => handleOnChange(value, "wmsUrl")}
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
                  size="small"
                  iconColor={theme.content.weak}
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
      </ContentWrapper>
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!wmsUrlValue}
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default WmsTiles;
