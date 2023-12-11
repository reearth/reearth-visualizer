import { useState } from "react";

import Button from "@reearth/beta/components/Button";
import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SubmitWrapper,
  InputWrapper,
  AddButtonWrapper,
  SelectWrapper,
  PropertyList,
  PropertyListHeader,
  StyledText,
  DataTypeContent,
  PropertyContent,
  DataTypeText,
  DeleteDataType,
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
          <SelectWrapper
            value={layerValue}
            name={t("Type")}
            description={t("Type of data you want to add.")}
            options={[].map(v => ({ key: v, label: v }))}
            attachToRoot
            onChange={setLayerValue}
          />
        </InputWrapper>
        <AddButtonWrapper>
          <Button
            text={t("Add to proprety list")}
            buttonType="primary"
            size="medium"
            disabled={!value}
            onClick={handleSubmit}
          />
        </AddButtonWrapper>
      </AssetWrapper>

      <PropertyList>
        <PropertyListHeader>
          <StyledText size="footnote">{t("Name")}</StyledText>
          <StyledText size="footnote">{t("Data Types")}</StyledText>
        </PropertyListHeader>
        <PropertyContent>
          <StyledText size="footnote">{t("Name")}</StyledText>
          <DataTypeContent>
            <DataTypeText size="footnote">{t("Data Types")}</DataTypeText>{" "}
            <DeleteDataType icon="bin" size={16} />
          </DataTypeContent>
        </PropertyContent>
      </PropertyList>
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
