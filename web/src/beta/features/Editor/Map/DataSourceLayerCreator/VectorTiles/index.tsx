import { FC, useCallback, useState } from "react";

import {
  ContentWrapper,
  InputGroup,
  InputsWrapper,
  LayerNameList,
  LayerNameListWrapper,
  LayerWrapper,
  SubmitWrapper,
  Wrapper,
} from "@reearth/beta/features/Editor/Map/SharedComponent";
import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

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
      if (!exist) setLayerNameList(prev => [...prev, layerName]);
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
          layers: layerNameList.length === 1 ? layerNameList[0] : layerNameList,
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
              value={mvtUrlValue}
              onChange={value => handleValueChange(value)}
            />
          </InputsWrapper>
        </InputGroup>
        <InputGroup label={t("Choose layer to add")}>
          <LayerNameListWrapper>
            <LayerNameList>
              {layerNameList.map((layer: string, index: number) => (
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
              {(!layerNameList.length || isLayerName) && (
                <LayerWrapper>
                  <TextInput
                    placeholder={t("layer name")}
                    value={layerName}
                    extendWidth
                    onBlur={handleBlur}
                    onChange={value => setLayerName(value)}
                  />
                  <Button
                    icon="close"
                    iconButton
                    iconColor={theme.content.weak}
                    size="small"
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
          disabled={!mvtUrlValue || !layerName}
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default WmsTiles;
