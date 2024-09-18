import { Button, DragAndDropList } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

import ListItem from "./ListItem";

const LIST_FIELD_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-list-field-drag-handle";

export type ListItemProps = {
  id: string;
  title: string;
};

export type ListFieldProps = CommonFieldProps & {
  items: ListItemProps[];
  selected?: string;
  atLeastOneItem?: boolean;
  isEditable?: boolean;
  onItemAdd?: () => void;
  onItemSelect?: (id: string) => void;
  onItemDelete?: (id: string) => void;
  onItemMove?: (id: string, targetIndex: number) => void;
  onItemNameUpdate?: (id: string, value: string) => void;
};

const ListField: FC<ListFieldProps> = ({
  title,
  description,
  items,
  selected,
  atLeastOneItem,
  isEditable = true,
  onItemAdd,
  onItemSelect,
  onItemDelete,
  onItemMove,
  onItemNameUpdate
}) => {
  const [listItems, setListItems] = useState(items ?? []);

  useEffect(() => {
    if (!atLeastOneItem) return;
    const updateSelected =
      !selected || !items.find(({ id }) => id === selected);
    if (updateSelected) {
      onItemSelect?.(items[0]?.id);
    }
  }, [selected, items, atLeastOneItem, onItemSelect]);
  const [isDragging, setIsDragging] = useState(false);

  const handleMoveEnd = useCallback(
    (itemId?: string, newIndex?: number) => {
      if (itemId !== undefined && newIndex !== undefined) {
        setListItems((old) => {
          const items = [...old];
          const currentIndex = old.findIndex((o) => o.id === itemId);
          if (currentIndex !== -1) {
            const [movedItem] = items.splice(currentIndex, 1);
            items.splice(newIndex, 0, movedItem);
          }
          return items;
        });
        onItemMove?.(itemId, newIndex);
      }
      setIsDragging(false);
    },
    [onItemMove]
  );

  useEffect(() => {
    setListItems(items ?? []);
  }, [items]);

  const DraggableListItems = useMemo(
    () =>
      listItems.map((item) => ({
        id: item.id,
        content: (
          <ListItem
            item={item}
            dragHandleClassName={LIST_FIELD_DRAG_HANDLE_CLASS_NAME}
            isDragging={isDragging}
            selectedItem={selected}
            isEditable={isEditable}
            onItemDelete={onItemDelete}
            onItemSelect={onItemSelect}
            onItemNameUpdate={onItemNameUpdate}
          />
        )
      })),
    [
      listItems,
      isDragging,
      selected,
      isEditable,
      onItemDelete,
      onItemSelect,
      onItemNameUpdate
    ]
  );

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  return (
    <CommonField title={title} description={description}>
      <FieldContainer>
        <Button
          onClick={onItemAdd}
          icon="plus"
          appearance="secondary"
          title="New Item"
          size="small"
          extendWidth
        />
        <FieldWrapper>
          <DragAndDropList
            items={DraggableListItems}
            handleClassName={LIST_FIELD_DRAG_HANDLE_CLASS_NAME}
            onMoveStart={handleMoveStart}
            onMoveEnd={handleMoveEnd}
          />
        </FieldWrapper>
      </FieldContainer>
    </CommonField>
  );
};

const FieldContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));

const FieldWrapper = styled("div")(({ theme }) => ({
  height: "130px",
  borderRadius: theme.radius.small,
  padding: theme.spacing.smallest,
  border: `1px solid ${theme.outline.weak}`,
  overflow: "auto"
}));

export default ListField;
