import { useState } from "react";

import Button from "@reearth/beta/components/Button";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SubmitWrapper,
  generateTitle,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { DataProps } from "..";

const ThreeDTiles: React.FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(value),
      visible: true,
      config: {
        data: {
          url: value !== "" ? value : undefined,
          type: "3dtiles",
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
            placeholder={t("Input Text")}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </InputGroup>
      </AssetWrapper>
      <SubmitWrapper>
        <Button
          text={t("Add to Layer")}
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={!value}
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default ThreeDTiles;
