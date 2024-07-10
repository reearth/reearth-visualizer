import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { Button, DragAndDropList } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "../CommonField";

import ListItem from "./ListItem";

const LIST_FIELD_DRAG_HANDLE_CLASS_NAME = "reearth-visualizer-editor-list-field-drag-handle";

export type ListItemProps = {
  id: string;
  title: string;
};

export type ListFieldProps = CommonFieldProps & {
  items: ListItemProps[];
  onItemAdd?: () => void;
  onItemSelect?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  selected?: string;
  atLeastOneItem?: boolean;
};

const ListField: FC<ListFieldProps> = ({
  commonTitle,
  description,
  items,
  selected,
  atLeastOneItem,
  onItemAdd,
  onItemSelect,
  onDeleteItem,
}) => {
  useEffect(() => {
    if (!atLeastOneItem) return;
    const updateSelected = !selected || !items.find(({ id }) => id === selected);
    if (updateSelected) {
      onItemSelect?.(items[0]?.id);
    }
  }, [selected, items, atLeastOneItem, onItemSelect]);
  const [isDragging, setIsDragging] = useState(false);

  const DraggableListItems = useMemo(
    () =>
      items.map(item => ({
        ...item,
        id: item.id,
        content: (
          <ListItem
            item={item}
            dragHandleClassName={LIST_FIELD_DRAG_HANDLE_CLASS_NAME}
            isDragging={isDragging}
            selectedItem={selected}
            onItemDelete={onDeleteItem}
            onItemSelect={onItemSelect}
          />
        ),
      })),
    [items, isDragging, selected, onDeleteItem, onItemSelect],
  );

  const handleMoveStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMoveEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
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
  gap: `${theme.spacing.smallest}px`,
}));

const FieldWrapper = styled("div")(({ theme }) => ({
  minHeight: "84px",
  maxHeight: "224px",
  borderRadius: theme.radius.small,
  border: `1px solid ${theme.outline.weak}`,
  overflow: "auto",
}));

export default ListField;
