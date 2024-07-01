import { FC, useCallback, useEffect, useState } from "react";

import DragAndDropList, {
  Props as DragAndDropProps,
} from "@reearth/beta/components/DragAndDropList";
import { Button } from "@reearth/beta/lib/reearth-ui";
import { EntryItem, EntryItemProps } from "@reearth/beta/ui/components/EntryItem";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

type ListItem = {
  id: string;
  value: string;
};

export type ListFieldProps = CommonFieldProps &
  EntryItemProps & {
    className?: string;
    items: ListItem[];
    addItem: () => void;
    onSelect: (id: string) => void;
    selected?: string;
    atLeastOneItem?: boolean;
  } & Pick<DragAndDropProps, "onItemDrop">;

const ListField: FC<ListFieldProps> = ({
  className,
  commonTitle,
  description,
  items,
  addItem,
  onItemDrop,
  onSelect,
  optionsMenu,
  selected,
  atLeastOneItem,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getId = useCallback(({ id }: ListItem) => {
    return id;
  }, []);

  useEffect(() => {
    if (!atLeastOneItem) return;

    const updateSelected = !selected || !items.find(({ id }) => id === selected);
    if (updateSelected) {
      onSelect(items[0]?.id);
    }
  }, [selected, items, atLeastOneItem, onSelect]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <FieldContainer className={className}>
        <SectionButton
          onClick={addItem}
          icon="plus"
          appearance="secondary"
          title="New Item"
          size="small"
          extendWidth={true}
        />
        <FieldWrapper>
          <DragAndDropList<ListItem>
            uniqueKey="ListField"
            items={items}
            onItemDrop={onItemDrop}
            getId={getId}
            renderItem={({ id, value }) => (
              <Item
                onClick={() => onSelect(id)}
                onMouseEnter={() => setHoveredItem(id)}
                onMouseLeave={() => setHoveredItem(null)}
                selected={selected === id}>
                <EntryItem
                  title={value}
                  highlighted={selected === id || hoveredItem === id}
                  onClick={() => onSelect(id)}
                  optionsMenu={optionsMenu}
                />
              </Item>
            )}
            gap={0}
          />
        </FieldWrapper>
      </FieldContainer>
    </CommonField>
  );
};

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.smallest}px;
`;

const FieldWrapper = styled.div`
  min-height: 84px;
  max-height: 224px;
  border-radius: 4px;
  border: 1px solid rgba(77, 83, 88, 1);
  overflow: auto;
`;

const Item = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.smallest}px;
  height: 28px;
  cursor: pointer;
`;

const SectionButton = styled(Button)`
  height: 28px;
  width: 100%;
  padding: 0px;
  margin: 0px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default ListField;
