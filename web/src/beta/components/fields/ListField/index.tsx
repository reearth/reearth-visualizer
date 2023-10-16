import { useCallback, useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import DragAndDropList, {
  Props as DragAndDropProps,
} from "@reearth/beta/components/DragAndDropList";
import Property from "@reearth/beta/components/fields";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type ListItem = {
  id: string;
  value: string;
};

export type Props = {
  name?: string;
  description?: string;
  items: ListItem[];
  removeItem: (id: string) => void;
  addItem: () => void;
  onSelect: (id: string) => void;
  selected?: string;
  atLeastOneItem?: boolean;
} & Pick<DragAndDropProps, "onItemDrop">;

const ListField: React.FC<Props> = ({
  name,
  description,
  items,
  removeItem,
  addItem,
  onItemDrop,
  onSelect,
  selected,
  atLeastOneItem,
}: Props) => {
  const t = useT();

  const deleteItem = useCallback(() => {
    if (!selected) return;
    removeItem(selected);
    // Select the first item in items after removing the item
    onSelect(items[0]?.id);
  }, [selected, removeItem, items, onSelect]);

  const getId = useCallback(({ id }: ListItem) => {
    return id;
  }, []);

  const disableRemoveButton = useMemo(() => {
    if (!selected || (atLeastOneItem && items.length === 1)) return true;

    return !items.find(({ id }) => id == selected);
  }, [items, selected, atLeastOneItem]);

  return (
    <Property name={name} description={description}>
      <FieldWrapper>
        <DragAndDropList<ListItem>
          uniqueKey="ListField"
          items={items}
          onItemDrop={onItemDrop}
          getId={getId}
          renderItem={({ id, value }) => (
            <Item onClick={() => onSelect(id)} selected={selected === id}>
              <Text size="xFootnote">{value}</Text>
            </Item>
          )}
          gap={0}
        />
      </FieldWrapper>
      <ButtonGroup>
        <ButtonWrapper
          onClick={deleteItem}
          icon="trash"
          buttonType="secondary"
          text={t("Remove")}
          size="medium"
          disabled={disableRemoveButton}
        />
        <ButtonWrapper
          onClick={addItem}
          icon="plus"
          buttonType="secondary"
          text={t("Add Item")}
          size="medium"
        />
      </ButtonGroup>
    </Property>
  );
};

const FieldWrapper = styled.div`
  min-height: 84px;
  max-height: 224px;
  border-radius: 4px;
  border: 1px solid rgba(77, 83, 88, 1);
  overflow: auto;
`;

const Item = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 28px;
  cursor: pointer;
  background: ${({ theme, selected }) => (selected ? theme.select.main : "inherit")};
  &:hover {
    background: ${({ theme, selected }) => (selected ? theme.select.main : theme.bg[2])};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const ButtonWrapper = styled(Button)`
  height: 28px;
  width: 100%;
  padding: 0px;
  margin: 0px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default ListField;
