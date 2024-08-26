
import {
  ContentWrapper,
  InputGroup,
  InputsWrapper,
  LayerNameList,
  LayerNameListWrapper,
  LayerWrapper,
  SubmitWrapper,
  Wrapper,
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { DataProps } from "..";
import { generateTitle } from "../util";

const WmsTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const theme = useTheme();

  const [wmsUrlValue, setWmsUrlValue] = useState("");
  const [isLayerName, setIsLayerName] = useState(false);
  const [layerNameValue, setLayerNameValue] = useState("");
  const [layersNameList, setLayersNameList] = useState<string[]>([]);

  const handleLayerNameAdd = () => {
    if (layerNameValue.trim() !== "") {
      const exist = layersNameList.some(
        (layer: string) => layer === layerNameValue,
      );
      if (!exist) setLayersNameList((prev) => [...prev, layerNameValue]);
      setLayerNameValue("");
    }
  };

  const handleBlur = () => {
    handleLayerNameAdd();
    setIsLayerName(false);
  };

  const handleLayerNameButtonClick = () => {
    handleLayerNameAdd();
    setIsLayerName(true);
  };

  const handleLayerNameDelete = (idx: number) => {
    const updatedLayers = [...layersNameList];
    updatedLayers.splice(idx, 1);
    setLayersNameList(updatedLayers);
  };

  const handleValueChange = useCallback((value: string) => {
    setWmsUrlValue(value);
  }, []);

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(wmsUrlValue),
      visible: true,
      config: {
        data: {
          url: wmsUrlValue !== "" ? wmsUrlValue : undefined,
          type: "wms",
          layers:
            LayerNameList.length === 1 ? layersNameList[0] : layersNameList,
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
              onChange={(value) => handleValueChange(value)}
            />
          </InputsWrapper>
        </InputGroup>
        <InputGroup label={t("Choose layer to add")}>
          <LayerNameListWrapper>
            <LayerNameList>
              {layersNameList.map((layer: string, index: number) => (
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
              {(!layersNameList.length || isLayerName) && (
                <LayerWrapper>
                  <TextInput
                    placeholder={t("layer name")}
                    value={layerNameValue}
                    extendWidth
                    onBlur={handleBlur}
                    onChange={(value) => setLayerNameValue(value)}
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
            </LayerNameList>
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
          disabled={!wmsUrlValue || !layersNameList.length}
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default WmsTiles;
