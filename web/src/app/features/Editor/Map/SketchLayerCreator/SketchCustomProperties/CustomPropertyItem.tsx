import { Button, Selector, TextInput, Icon } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { dataTypes } from "../../SketchLayerCreator";
import { CustomPropertyItemProps } from "../../SketchLayerCreator/type";

const CustomPropertyItem: FC<CustomPropertyItemProps> = ({
  customPropertyItem,
  isEditTitle,
  isEditType,
  handleClassName,
  onTypeChange,
  onBlur,
  onDoubleClick,
  onCustomPropertyDelete
}) => {
  const t = useT();
  const theme = useTheme();

  const [customPropertyTitle, setCustomPropertyTitle] = useState(
    customPropertyItem.key
  );
  const [dataType, setDataType] = useState(customPropertyItem.value);

  const handleTitleChange = useCallback((value: string) => {
    setCustomPropertyTitle(value);
  }, []);

  const handleTypeChange = useCallback(
    (value: string | string[]) => {
      setDataType(value as string);
      onTypeChange?.(value as string);
    },
    [onTypeChange]
  );

  const handleTitleBlur = useCallback(
    (title: string) => {
      const trimmedTitle = title.trim();
      setCustomPropertyTitle(trimmedTitle);
      onBlur?.(trimmedTitle);
    },
    [onBlur]
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
        {customPropertyItem.key === "" || isEditTitle ? (
          <TextInput
            size="small"
            value={customPropertyTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder={t("Type Title here")}
            autoFocus
          />
        ) : (
          <TitleWrapper onDoubleClick={() => onDoubleClick?.("name")}>
            {customPropertyTitle}
          </TitleWrapper>
        )}
      </ProjectItemCol>
      <ProjectItemCol
        style={{
          justifyContent: "space-between"
        }}
      >
        {customPropertyItem.value.trim() === "" || isEditType ? (
          <Selector
            size="small"
            value={dataType}
            placeholder={t("Please select one type")}
            options={dataTypes.map((v) => ({ value: v, label: v }))}
            onChange={handleTypeChange}
          />
        ) : (
          <TitleWrapper onDoubleClick={() => onDoubleClick?.("type")}>
            {dataType}
          </TitleWrapper>
        )}
      </ProjectItemCol>
      <Button
        icon="trash"
        iconButton
        appearance="simple"
        size="small"
        onClick={onCustomPropertyDelete}
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
  borderRadius: theme.radius.smallest
}));

const ProjectItemCol = styled("div")(() => ({
  flex: 1
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  padding: theme.spacing.micro,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}));

export default CustomPropertyItem;
