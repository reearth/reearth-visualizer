import { PopupMenuItem, TextInput } from "@reearth/app/lib/reearth-ui";
import { EntryItem } from "@reearth/app/ui/components";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { ListItemProps } from ".";

type ItemProps = {
  item: ListItemProps;
  selectedItem?: string;
  dragHandleClassName?: string;
  isDragging?: boolean;
  isEditable?: boolean;
  onItemDelete?: (id: string) => void;
  onItemSelect?: (id: string) => void;
  onItemNameUpdate?: (id: string, value: string) => void;
};

const ListItem: FC<ItemProps> = ({
  item,
  dragHandleClassName,
  isDragging,
  selectedItem,
  isEditable,
  onItemDelete,
  onItemSelect,
  onItemNameUpdate
}) => {
  const [localTitle, setLocalTitle] = useState(item.title);
  const [itemNameRenameId, setItemNameRenameId] = useState("");

  const handleItemDelete = useCallback(
    (id: string) => {
      onItemDelete?.(id);
    },
    [onItemDelete]
  );
  const t = useT();
  const optionsMenu = useMemo<PopupMenuItem[]>(() => {
    const menu: PopupMenuItem[] = [
      {
        id: "delete",
        title: t("Delete"),
        icon: "trash" as const,
        onClick: () => handleItemDelete(item.id)
      }
    ];

    if (isEditable) {
      menu.unshift({
        id: "rename",
        title: "Rename",
        icon: "pencilSimple" as const,
        onClick: () => {
          // Delay entering edit mode until popup has fully closed and finished focus management
          setTimeout(() => {
            setItemNameRenameId(item.id);
          }, 0);
        }
      });
    }

    return menu;
  }, [handleItemDelete, item.id, isEditable, t]);

  const handleTitleUpdate = useCallback(() => {
    setItemNameRenameId("");
    if (!localTitle || localTitle === item.title) return;
    onItemNameUpdate?.(item.id, localTitle);
  }, [item.id, item.title, localTitle, onItemNameUpdate]);

  return (
    <Wrapper>
      <EntryItemWrapper>
        <EntryItem
          title={
            itemNameRenameId === item.id && isEditable ? (
              <TextInput
                size="small"
                extendWidth
                autoFocus
                value={localTitle}
                onChange={setLocalTitle}
                onBlur={handleTitleUpdate}
              />
            ) : (
              <TitleWrapper
                onDoubleClick={
                  isEditable ? () => setItemNameRenameId(item.id) : undefined
                }
              >
                {item.title === "New Credit" ? t("New Credit") : item.title}
              </TitleWrapper>
            )
          }
          dragHandleClassName={dragHandleClassName}
          disableHover={isDragging}
          optionsMenu={optionsMenu}
          highlighted={selectedItem == item.id}
          optionsMenuWidth={100}
          onClick={() => onItemSelect?.(item?.id)}
        />
      </EntryItemWrapper>
    </Wrapper>
  );
};

export default ListItem;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.micro
}));

const EntryItemWrapper = styled("div")(() => ({
  flex: 1,
  width: 0
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}));
