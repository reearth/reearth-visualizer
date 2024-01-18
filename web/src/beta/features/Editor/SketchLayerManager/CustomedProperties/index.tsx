import { useCallback, useState } from "react";

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
  PropertyContentWrapper,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { SketchProps, dataTypes } from "..";

const CustomedProperties: React.FC<SketchProps> = ({ propertyList = [], setPropertyList }) => {
  const t = useT();
  const [propertyName, setPropertyName] = useState<string>("");
  const [dataType, setDataType] = useState<string>("");

  const handleAddToPropertyToList = useCallback(() => {
    const newData = { [propertyName]: dataType };

    setPropertyList?.([...propertyList, newData]);
    setPropertyName("");
    setDataType("");
  }, [dataType, propertyName, propertyList, setPropertyList]);

  const handleDeletePropertyToList = useCallback(
    (idx: number) => {
      const updatedPropertiesList = [...propertyList];
      updatedPropertiesList.splice(idx, 1);
      setPropertyList?.(updatedPropertiesList);
    },
    [propertyList, setPropertyList],
  );

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputWrapper>
          <InputGroup label={t("Name")} description={t("Property name you want to add.")}>
            <Input
              type="text"
              placeholder={t("Input Text")}
              value={propertyName}
              onChange={e => setPropertyName(e.target.value)}
            />
          </InputGroup>
          <SelectWrapper
            value={dataType}
            name={t("Data Type")}
            description={t("Type of data you want to add.")}
            options={dataTypes.map(v => ({ key: v, label: v }))}
            attachToRoot
            onChange={setDataType}
          />
        </InputWrapper>
        <AddButtonWrapper>
          <Button
            text={t("Add to proprety list")}
            buttonType="primary"
            size="medium"
            disabled={!propertyName}
            onClick={handleAddToPropertyToList}
          />
        </AddButtonWrapper>
      </AssetWrapper>

      <PropertyList>
        <PropertyListHeader>
          <StyledText size="footnote">{t("Name")}</StyledText>
          <StyledText size="footnote">{t("Data Types")}</StyledText>
        </PropertyListHeader>
        <PropertyContentWrapper>
          {propertyList?.length > 0 &&
            propertyList?.map((item, i) => {
              return (
                <PropertyContent key={i}>
                  <StyledText size="footnote">{Object.keys(item)[0]}</StyledText>
                  <DataTypeContent>
                    <DataTypeText size="footnote">{Object.values(item)[0]}</DataTypeText>{" "}
                    <DeleteDataType
                      icon="bin"
                      size={16}
                      onClick={() => handleDeletePropertyToList(i)}
                    />
                  </DataTypeContent>
                </PropertyContent>
              );
            })}
        </PropertyContentWrapper>
      </PropertyList>

      <SubmitWrapper />
    </ColJustifyBetween>
  );
};

export default CustomedProperties;
