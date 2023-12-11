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

import { SketchProps } from "..";

type Property = {
  name: string;
  dataType: string;
};

const CustomedProperties: React.FC<SketchProps> = ({ sceneId, onClose, onSubmit }) => {
  const t = useT();
  const [layerName, setLayerName] = useState<string>("");
  const [dataType, setDataType] = useState<string>("");
  const [propertyList, setPropertyList] = useState<Property[]>([]);

  const handleAddToPropertyToList = useCallback(() => {
    const data: Property = {
      name: layerName,
      dataType: dataType,
    };

    setPropertyList(prev => [...prev, data]);
    setLayerName("");
    setDataType("");
  }, [dataType, layerName]);

  const handleDeletePropertyToList = useCallback(
    (idx: number) => {
      const updatedPropertiesList = [...propertyList];
      updatedPropertiesList.splice(idx, 1);
      setPropertyList(updatedPropertiesList);
    },
    [propertyList],
  );

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
          value: propertyList,
        },
      },
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
            name={t("Type")}
            description={t("Type of data you want to add.")}
            options={["Text", "URL"].map(v => ({ key: v, label: v }))}
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
          {propertyList.length > 0 &&
            propertyList.map(({ name, dataType }, i) => {
              return (
                <PropertyContent key={i}>
                  <StyledText size="footnote">{name}</StyledText>
                  <DataTypeContent>
                    <DataTypeText size="footnote">{dataType}</DataTypeText>{" "}
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
