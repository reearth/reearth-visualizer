import {
  ContentWrapper,
  InputGroup,
  InputsWrapper,
  LayerNameList,
  LayerNameListWrapper,
  LayerWrapper,
  SubmitWrapper,
  Wrapper
} from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import { Button, TextInput } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { DataProps } from "..";
import { generateTitle } from "../util";

const WmsTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const theme = useTheme();

  const [mvtUrlValue, setMvtUrlValue] = useState("");
  const [isLayerName, setIsLayerName] = useState(false);
  const [layerName, setLayerName] = useState("");
  const [layerNameList, setLayerNameList] = useState<string[]>([]);

  const handleLayerNameAdd = () => {
    if (layerName.trim() !== "") {
      const exist = layerNameList.some((layer: string) => layer === layerName);
      if (!exist) setLayerNameList((prev) => [...prev, layerName]);
      setLayerName("");
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
    const updatedLayerNameList = [...layerNameList];
    updatedLayerNameList.splice(idx, 1);
    setLayerNameList(updatedLayerNameList);
  };

  const handleValueChange = useCallback((value: string) => {
    setMvtUrlValue(value);
  }, []);

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(mvtUrlValue),
      visible: true,
      config: {
        data: {
          url: mvtUrlValue !== "" ? mvtUrlValue : undefined,
          type: "mvt",
          layers: layerNameList.length === 1 ? layerNameList[0] : layerNameList
        }
      }
    });
    onClose();
  };

  return (
    <Wrapper data-testid="vectortiles-wrapper">
      <ContentWrapper data-testid="vectortiles-content">
        <InputGroup
          label={t("Resource URL")}
          data-testid="vectortiles-url-group"
        >
          <InputsWrapper data-testid="vectortiles-url-inputs">
            <TextInput
              placeholder="https://"
              value={mvtUrlValue}
              onChange={(value) => handleValueChange(value)}
              data-testid="vectortiles-url-textinput"
            />
          </InputsWrapper>
        </InputGroup>
        <InputGroup
          label={t("Choose layer to add")}
          data-testid="vectortiles-layer-group"
        >
          <LayerNameListWrapper data-testid="vectortiles-layer-list-wrapper">
            <LayerNameList data-testid="vectortiles-layer-list">
              {layerNameList.map((layer: string, index: number) => (
                <LayerWrapper
                  key={index}
                  data-testid={`vectortiles-layer-item-${index}`}
                >
                  <TextInput
                    value={`${layer}`}
                    extendWidth
                    data-testid={`vectortiles-layer-textinput-${index}`}
                  />
                  <Button
                    icon="close"
                    iconButton
                    appearance="simple"
                    size="small"
                    iconColor={theme.content.main}
                    onClick={() => handleLayerNameDelete(index)}
                    data-testid={`vectortiles-layer-delete-button-${index}`}
                  />
                </LayerWrapper>
              ))}
              {(!layerNameList.length || isLayerName) && (
                <LayerWrapper data-testid="vectortiles-layer-input-wrapper">
                  <TextInput
                    placeholder={t("layer name")}
                    value={layerName}
                    extendWidth
                    onBlur={handleBlur}
                    onChange={(value) => setLayerName(value)}
                    data-testid="vectortiles-layer-input"
                  />
                  <Button
                    icon="close"
                    iconButton
                    iconColor={theme.content.weak}
                    size="small"
                    appearance="simple"
                    disabled
                    data-testid="vectortiles-layer-input-disabled-button"
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
            data-testid="vectortiles-layer-add-button"
          />
        </InputGroup>
      </ContentWrapper>

      <SubmitWrapper data-testid="vectortiles-submit-wrapper">
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!mvtUrlValue || !layerNameList.length}
          data-testid="vectortiles-submit-button"
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default WmsTiles;
