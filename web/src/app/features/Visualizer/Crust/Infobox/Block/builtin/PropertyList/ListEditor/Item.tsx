import { Button, Icon, TextInput } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { PropertyListItem } from ".";

type Props = {
  item: PropertyListItem;
  isEditKey: boolean;
  isEditValue: boolean;
  handleClassName?: string;
  onKeyBlur: (newValue?: string) => void;
  onValueBlur: (newValue?: string) => void;
  onItemRemove: () => void;
  onDoubleClick?: (field: string) => void;
};

const EditorItem: FC<Props> = ({
  item,
  handleClassName,
  isEditKey,
  isEditValue,
  onKeyBlur,
  onValueBlur,
  onItemRemove,
  onDoubleClick
}) => {
  const t = useT();
  const theme = useTheme();

  const [currentKeyItem, setCurrentKeyItem] = useState<string>(item.key);
  const [currentValueItem, setCurrentValueItem] = useState<string>(item.value);

  const handleKeyChange = useCallback((newValue: string) => {
    setCurrentKeyItem(newValue);
  }, []);

  const handleKeyBlur = useCallback(
    (newValue: string) => {
      onKeyBlur(newValue);
    },
    [onKeyBlur]
  );

  const handleValueChange = useCallback((newValue: string) => {
    setCurrentValueItem(newValue);
  }, []);

  const handleValueBlur = useCallback(
    (newValue: string) => {
      onValueBlur(newValue);
    },
    [onValueBlur]
  );

  return (
    <Field>
      <Icon
        className={handleClassName}
        icon="dotsSixVertical"
        color={theme.content.weak}
        size="small"
      />
      <ItemCol>
        {item.key === "" || isEditKey ? (
          <TextInput
            size="small"
            value={currentKeyItem}
            placeholder={t("Display title")}
            onChange={handleKeyChange}
            onBlur={handleKeyBlur}
          />
        ) : (
          <TextWrapper onDoubleClick={() => onDoubleClick?.("key")}>
            {currentKeyItem}
          </TextWrapper>
        )}
      </ItemCol>
      <ItemCol>
        {item.value === "" || isEditValue ? (
          <TextInput
            size="small"
            value={currentValueItem}
            placeholder={t("${your property name}")}
            onChange={handleValueChange}
            onBlur={handleValueBlur}
          />
        ) : (
          <TextWrapper onDoubleClick={() => onDoubleClick?.("value")}>
            {currentValueItem}
          </TextWrapper>
        )}
      </ItemCol>

      <Button
        icon="trash"
        iconButton
        appearance="simple"
        size="small"
        onClick={onItemRemove}
      />
    </Field>
  );
};

export default EditorItem;

const Field = styled("div")(({ theme }) => ({
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

const ItemCol = styled("div")(() => ({
  flex: 1
}));

const TextWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  padding: theme.spacing.micro,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}));
