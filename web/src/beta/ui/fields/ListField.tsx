import { FC, useEffect } from "react";

import { Button, DragAndDropList, DragAndDropListProps } from "@reearth/beta/lib/reearth-ui";
import { EntryItem, EntryItemProps } from "@reearth/beta/ui/components/EntryItem";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

type ListItem = {
  id: string;
  value: string;
  content?: JSX.Element;
};

export type ListFieldProps = CommonFieldProps &
  DragAndDropListProps<ListItem> &
  EntryItemProps & {
    className?: string;
    items: ListItem[];
    onItemAdd: () => void;
    onItemSelect: (id: string) => void;
    selected?: string;
    atLeastOneItem?: boolean;
  };

const ListField: FC<ListFieldProps> = ({
  className,
  commonTitle,
  description,
  items,
  onItemAdd,
  onItemSelect,
  optionsMenu,
  selected,
  atLeastOneItem,
  setItems,
  onMoveStart,
  onMoveEnd,
}) => {
  useEffect(() => {
    if (!atLeastOneItem) return;

    const updateSelected = !selected || !items.find(({ id }) => id === selected);
    if (updateSelected) {
      onItemSelect(items[0]?.id);
    }
  }, [selected, items, atLeastOneItem, onItemSelect]);

  const itemsWithContent = items.map(item => ({
    ...item,
    content: (
      <Item key={item.id} onClick={() => onItemSelect(item.id)} selected={selected === item.id}>
        <EntryItem
          title={item.value}
          highlighted={selected === item.id}
          onClick={() => onItemSelect(item.id)}
          optionsMenu={optionsMenu}
        />
      </Item>
    ),
  }));

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <FieldContainer className={className}>
        <Button
          onClick={onItemAdd}
          icon="plus"
          appearance="secondary"
          title="New Item"
          size="small"
          extendWidth={true}
        />
        <FieldWrapper>
          <DragAndDropList<ListItem>
            items={itemsWithContent}
            setItems={setItems}
            onMoveStart={onMoveStart}
            onMoveEnd={onMoveEnd}
            gap={0}
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
  border: "1px solid rgba(77, 83, 88, 1)",
  overflow: "auto",
}));

const Item = styled("div")<{ selected: boolean }>(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  padding: theme.spacing.smallest,
  height: "28px",
  cursor: "pointer",
}));

export default ListField;
