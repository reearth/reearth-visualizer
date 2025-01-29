import {
  Button,
  TextInput,
  Icon,
  PopupMenu,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { CustomPropertyItemProps } from "../../SketchLayerCreator/type";

const dataTypes = [
  {
    id: "text",
    title: "Text"
  },
  {
    id: "textArea",
    title: "TextArea"
  },
  {
    id: "url",
    title: "URL"
  },
  {
    id: "asset",
    title: "Asset"
  },
  {
    id: "color",
    title: "Color"
  },
  {
    id: "float",
    title: "Float"
  },
  {
    id: "int",
    title: "Int"
  },
  {
    id: "bool",
    title: "Boolean"
  }
];
const dataTypeGroups = {
  string: ["Text", "TextArea", "URL", "Asset", "Color"],
  number: ["Float", "Int"],
  boolean: ["Boolean"]
};

const CustomPropertyItem: FC<CustomPropertyItemProps> = ({
  customPropertyItem,
  isEditTitle,
  handleClassName,
  isSketchLayerEditor,
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
    (value: string) => {
      setDataType(value);
      onTypeChange?.(value);
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

  const menuItems = useMemo(() => {
    const currentGroup = Object.keys(dataTypeGroups).find((group) =>
      dataTypeGroups[group as keyof typeof dataTypeGroups].includes(dataType)
    );

    return dataTypes.map((dataType) => {
      const isDisabled =
        currentGroup &&
        !dataTypeGroups[currentGroup as keyof typeof dataTypeGroups].includes(
          dataType.title
        );

      return {
        id: dataType.id,
        title: dataType.title,
        disabled: isSketchLayerEditor && !!isDisabled,
        onClick: !isDisabled
          ? () => handleTypeChange(dataType.title)
          : undefined
      };
    });
  }, [dataType, handleTypeChange, isSketchLayerEditor]);

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
        <PopupMenu
          extendTriggerWidth
          extendContentWidth
          menu={menuItems}
          label={
            dataType ? (
              <TitleWrapper>{dataType}</TitleWrapper>
            ) : (
              <Typography size="body" color={theme.content.weak}>
                {t("Please select one type")}
              </Typography>
            )
          }
        />
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
