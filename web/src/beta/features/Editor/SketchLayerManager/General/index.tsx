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
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { SketchProps } from "..";

const General: React.FC<SketchProps> = ({ onClose }) => {
  const t = useT();
  const [value, setValue] = useState("");
  const [layerValue, setLayerValue] = useState("");

  const handleSubmit = () => {
    onClose();
  };

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputGroup label={t("Layer Name")} description={t("Layer name you want to add.")}>
          <Input
            type="text"
            placeholder={t("Input Text")}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </InputGroup>
        <InputGroup label={t("Layer Style")} description={t("Layer style you want to add.")}>
          <LayerWrapper>
            <Input
              type="text"
              placeholder={t("layer name")}
              value={layerValue}
              onChange={e => setLayerValue(e.target.value)}
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
          disabled={!value}
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default General;
