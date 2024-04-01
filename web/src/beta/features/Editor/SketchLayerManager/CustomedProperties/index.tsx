import Button from "@reearth/beta/components/Button";
import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import {
  ColJustifyBetween,
  SubmitWrapper,
  AddButtonWrapper,
  PropertyListHeader,
  TitledText,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import { SketchProps } from "..";

import useHooks, { PropertyProps } from "./hooks";
import EditorProperty from "./PropertyEditor";

const CustomedProperties: React.FC<SketchProps> = ({
  customPropertyList,
  setCustomPropertyList,
}) => {
  const t = useT();
  const theme = useTheme();

  const {
    currentProperties,
    handleRemovePropertyToList,
    handlePropertyDrop,
    handlePropertyAdd,
    handleKeyChange,
    handleValueChange,
  } = useHooks({
    customPropertyList,
    setCustomPropertyList,
  });

  return (
    <ColJustifyBetween>
      <PropertyListHeader>
        <TitledText size="footnote" color={theme.content.weaker}>
          {t("Name")}
        </TitledText>
        <TitledText size="footnote" color={theme.content.weaker}>
          {t("Type")}
        </TitledText>
      </PropertyListHeader>
      {currentProperties && currentProperties?.length > 0 && (
        <DragAndDropList<PropertyProps>
          uniqueKey="custom-property"
          gap={5}
          items={(currentProperties as PropertyProps[]) || []}
          getId={item => item.id}
          onItemDrop={handlePropertyDrop}
          renderItem={(property, idx) => (
            <EditorProperty
              key={property.id}
              property={property}
              onKeyChange={handleKeyChange(idx)}
              onValueChange={handleValueChange(idx)}
              onRemoveItem={() => handleRemovePropertyToList(idx)}
            />
          )}
        />
      )}
      <AddButtonWrapper>
        <Button icon="plus" text={t("New Property")} size="small" onClick={handlePropertyAdd} />
      </AddButtonWrapper>
      <SubmitWrapper />
    </ColJustifyBetween>
  );
};

export default CustomedProperties;
