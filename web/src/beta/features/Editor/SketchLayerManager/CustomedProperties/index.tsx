import { useState } from "react";

import Button from "@reearth/beta/components/Button";
import SelectField from "@reearth/beta/components/fields/SelectField";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SubmitWrapper,
  InputWrapper,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { SketchProps } from "..";

const CustomedProperties: React.FC<SketchProps> = ({ onClose }) => {
  const t = useT();
  const [value, setValue] = useState("");
  const [layerValue, setLayerValue] = useState("");

  const handleSubmit = () => {
    onClose();
  };

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputWrapper>
          <InputGroup label={t("Name")} description={t("Layer name you want to add.")}>
            <Input
              type="text"
              placeholder={t("Input Text")}
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </InputGroup>
          <InputGroup label={t("Type")} description={t("Type of data you want to add.")}>
            <SelectField
              value={layerValue}
              options={[].map(v => ({ key: v, label: v }))}
              attachToRoot
              onChange={setLayerValue}
            />
          </InputGroup>
        </InputWrapper>
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

export default CustomedProperties;
