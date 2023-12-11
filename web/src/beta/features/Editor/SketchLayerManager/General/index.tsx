import { useState } from "react";

import Button from "@reearth/beta/components/Button";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SubmitWrapper,
  LayerWrapper,
  LayerStyleIcon,
  generateTitle,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { SketchProps } from "..";

const General: React.FC<SketchProps> = ({ sceneId, onClose, onSubmit }) => {
  const t = useT();
  const [layerName, setLayerName] = useState("");
  const [layerStyle, setLayerStyle] = useState("");

  const handleSubmit = () => {
    const parsedValue = "data:text/plain;charset=UTF-8," + encodeURIComponent(layerName);

    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle("sketchLayer", layerName),
      visible: true,
      config: {
        data: {
          url: layerName !== "" ? layerName : parsedValue,
          type: "3dtiles", // put this here for test while waiting for the API
          value: layerName,
        },
      },
    });
    onClose();
  };

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputGroup label={t("Layer Name")} description={t("Layer name you want to add.")}>
          <Input
            type="text"
            placeholder={t("Input Text")}
            value={layerName}
            onChange={e => setLayerName(e.target.value)}
          />
        </InputGroup>
        <InputGroup label={t("Layer Style")} description={t("Layer style you want to add.")}>
          <LayerWrapper>
            <Input
              type="text"
              placeholder={t("layer name")}
              value={layerStyle}
              onChange={e => setLayerStyle(e.target.value)}
            />
            <LayerStyleIcon icon="layerStyle" size={16} />
          </LayerWrapper>
        </InputGroup>
      </AssetWrapper>

      <SubmitWrapper>
        <Button
          text={t("Create")}
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={!layerName}
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default General;
