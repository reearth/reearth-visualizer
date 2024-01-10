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
  generateTitle,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { SketchProps, dataTypes } from "..";

const CustomedProperties: React.FC<SketchProps> = ({
  sceneId,
  propertyList = [],
  setPropertyList,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [layerName, setLayerName] = useState<string>("");
  const [dataType, setDataType] = useState<string>("");

  const handleAddToPropertyToList = useCallback(() => {
    const newData = { [layerName]: dataType };

    setPropertyList?.([...propertyList, newData]);
    setLayerName("");
    setDataType("");
  }, [dataType, layerName, propertyList, setPropertyList]);

  const handleDeletePropertyToList = useCallback(
    (idx: number) => {
      const updatedPropertiesList = [...propertyList];
      updatedPropertiesList.splice(idx, 1);
      setPropertyList?.(updatedPropertiesList);
    },
    [propertyList, setPropertyList],
  );

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      visible: true,
      config: {
        properties: propertyList,
        data: {
          type: "geojson",
          isSketchLayer: true,
        },
      },
      title: generateTitle(layerName),
    });
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
              value={layerName}
              onChange={e => setLayerName(e.target.value)}
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
            disabled={!layerName}
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

      <SubmitWrapper>
        <Button
          text={t("Create")}
          buttonType="primary"
          size="medium"
          onClick={handleSubmit}
          disabled={!propertyList.length}
        />
      </SubmitWrapper>
    </ColJustifyBetween>
  );
};

export default CustomedProperties;
