import { FC, useCallback, useState } from "react";

import { Button, Selector, TextInput, Icon } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { dataTypes } from "..";
import { PropertyListProp } from "../type";

type PropertyItemProps = {
  propertyItem: PropertyListProp;
  isEditTitle?: boolean;
  isEditType?: boolean;
  handleClassName?: string;
  onTypeChange?: (v?: string | string[]) => void;
  onBlur?: (v?: string) => void;
  onDoubleClick?: (field: string) => void;
  onRemovePropertyItem: () => void;
};

const PropertyItem: FC<PropertyItemProps> = ({
  propertyItem,
  isEditTitle,
  isEditType,
  handleClassName,
  onTypeChange,
  onBlur,
  onDoubleClick,
  onRemovePropertyItem,
}) => {
  const t = useT();
  const theme = useTheme();

  const [customPropertyTitle, setCustomPropertyTitle] = useState(propertyItem.key);
  const [dataType, setDataType] = useState(propertyItem.value);

  const handleTitleChange = useCallback((value: string) => {
    setCustomPropertyTitle(value);
  }, []);

  const handleTypeChange = useCallback(
    (value: string | string[]) => {
      setDataType(value as string);
      onTypeChange?.(value as string);
    },
    [onTypeChange],
  );

  return (
    <PropertyFieldWrapper>
      <Icon
        className={handleClassName}
        icon="dotsSixVertical"
        color={theme.content.weak}
        size="small"
      />
      <ProjectItemCol>
        {propertyItem.key.trim() === "" || isEditTitle ? (
          <TextInput
            size="small"
            value={customPropertyTitle}
            onChange={handleTitleChange}
            onBlur={onBlur}
            placeholder={t("Type Title here")}
          />
        ) : (
          <TitleWrapper onDoubleClick={() => onDoubleClick?.("name")}>
            {customPropertyTitle}
          </TitleWrapper>
        )}
      </ProjectItemCol>
      <ProjectItemCol
        style={{
          justifyContent: "space-between",
        }}>
        {propertyItem.value.trim() === "" || isEditType ? (
          <Selector
            size="small"
            value={dataType}
            placeholder={t("Please select one type")}
            options={dataTypes.map(v => ({ value: v, label: v }))}
            onChange={handleTypeChange}
          />
        ) : (
          <TitleWrapper onDoubleClick={() => onDoubleClick?.("type")}>{dataType}</TitleWrapper>
        )}
      </ProjectItemCol>
      <Button
        icon="trash"
        iconButton
        appearance="simple"
        size="small"
        onClick={onRemovePropertyItem}
      />
    </PropertyFieldWrapper>
  );
};

const PropertyFieldWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  alignSelf: "stretch",
  width: "100%",
  background: theme.bg[2],
  color: theme.content.main,
  gap: theme.spacing.micro,
  padding: theme.spacing.micro,
  borderRadius: theme.radius.smallest,
}));

const ProjectItemCol = styled("div")(() => ({
  flex: 1,
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  padding: theme.spacing.micro,

  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

export default PropertyItem;
