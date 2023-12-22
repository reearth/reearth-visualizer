import { useState } from "react";

import Button from "@reearth/beta/components/Button";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SubmitWrapper,
  SelectWrapper,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { SketchProps } from "..";

const General: React.FC<SketchProps> = ({ sceneId, layerStyles, onClose, onSubmit }) => {
  const t = useT();
  const [layerName, setLayerName] = useState("");

  const [layerStyle, setLayerStyle] = useState("");
  const layerStyleOption = layerStyles ? layerStyles : [];

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: layerName,
      visible: true,
      config: {
        properties: {
          name: layerName,
          layerStyle: layerStyle,
        },
        data: {
          type: "geojson",
          isSketchLayer: true,
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

        <SelectWrapper
          value={layerStyle}
          name={t("Layer Style")}
          description={t("Layer style you want to add.")}
          options={layerStyleOption?.map(v => ({ key: v.id, label: v.name }))}
          attachToRoot
          onChange={setLayerStyle}
        />
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
